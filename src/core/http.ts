import { timingSafeEqual } from 'node:crypto'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ZodError } from 'zod'
import { env } from './env.js'
import { AppError, UnauthorizedError } from './errors.js'
import {
  readCachedIdempotencyResponse,
  resolveAuthIdempotencyContext,
  storeIdempotencyResponse,
} from './idempotency.js'
import { authenticateToken } from './supabase.js'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface ApiContext {
  req: VercelRequest
  res: VercelResponse
  supabase: SupabaseClient
  user: User
  userId: string
  url: URL
  query: URLSearchParams
}

type AuthenticatedHandler = (ctx: ApiContext) => Promise<void>
type PublicHandler = (ctx: { req: VercelRequest; res: VercelResponse; url: URL; query: URLSearchParams }) => Promise<void>

interface HandlerOptions {
  methods: HttpMethod[]
  requireApiKey?: boolean
}

const parsedBodySymbol = Symbol('parsedBody')

type ParsedBodyRequest = VercelRequest & {
  [parsedBodySymbol]?: unknown
}

const setCorsHeaders = (res: VercelResponse): void => {
  res.setHeader('Access-Control-Allow-Origin', env.corsAllowOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,X-API-Key,Idempotency-Key',
  )
  res.setHeader('Access-Control-Expose-Headers', 'Idempotency-Replayed')
}

const setSecurityHeaders = (res: VercelResponse): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  )
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';")
}

export const jsonResponse = (
  res: VercelResponse,
  status: number,
  payload: unknown,
): void => {
  setCorsHeaders(res)
  setSecurityHeaders(res)
  res.status(status).json(payload)
}

const readBearerToken = (req: VercelRequest): string => {
  const rawAuth = req.headers.authorization

  if (!rawAuth || !rawAuth.startsWith('Bearer ')) {
    throw new UnauthorizedError()
  }

  const token = rawAuth.slice('Bearer '.length).trim()

  if (!token) {
    throw new UnauthorizedError()
  }

  return token
}

const readApiKey = (req: VercelRequest): string => {
  const rawHeader = req.headers['x-api-key']
  const raw = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader
  const apiKey = raw?.trim() ?? ''

  if (!apiKey) {
    throw new UnauthorizedError('API key inválida ou ausente.')
  }

  return apiKey
}

const isSameSecret = (received: string, expected: string): boolean => {
  const left = Buffer.from(received)
  const right = Buffer.from(expected)

  if (left.length !== right.length) return false

  return timingSafeEqual(left, right)
}

const assertApiKey = (req: VercelRequest): void => {
  const receivedApiKey = readApiKey(req)

  if (!isSameSecret(receivedApiKey, env.apiKey)) {
    throw new UnauthorizedError('API key inválida ou ausente.')
  }
}

const parseUrl = (req: VercelRequest): URL => {
  const host = req.headers.host ?? 'localhost'
  const forwardedProto = req.headers['x-forwarded-proto']
  const firstForwarded = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto
  const fallbackProtocol =
    host.startsWith('localhost') || host.startsWith('127.0.0.1')
      ? 'http'
      : 'https'
  const firstProtocol = (firstForwarded ?? fallbackProtocol).split(',')[0] ?? fallbackProtocol
  const protocol = firstProtocol.trim() || fallbackProtocol
  return new URL(req.url ?? '/', `${protocol}://${host}`)
}

const createErrorPayload = (error: unknown): { status: number; body: Record<string, unknown> } => {
  if (error instanceof ZodError) {
    return {
      status: 422,
      body: {
        code: 'VALIDATION_ERROR',
        error: 'Dados inválidos.',
        details: error.flatten(),
      },
    }
  }

  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        code: error.code,
        error: error.message,
        details: error.details,
      },
    }
  }

  return {
    status: 500,
    body: {
      code: 'INTERNAL_ERROR',
      error: 'Erro interno inesperado.',
    },
  }
}

const startResponseCapture = (res: VercelResponse): {
  getStatus: () => number
  getBody: () => unknown
  restore: () => void
} => {
  const originalStatus = res.status.bind(res)
  const originalJson = res.json.bind(res)

  let statusCode = 200
  let bodyPayload: unknown = undefined

  res.status = ((code: number) => {
    statusCode = code
    return originalStatus(code)
  }) as typeof res.status

  res.json = ((body: unknown) => {
    bodyPayload = body
    return originalJson(body)
  }) as typeof res.json

  return {
    getStatus: () => statusCode,
    getBody: () => bodyPayload,
    restore: () => {
      res.status = originalStatus as typeof res.status
      res.json = originalJson as typeof res.json
    },
  }
}

export const createAuthHandler = (
  options: HandlerOptions,
  handler: AuthenticatedHandler,
) => {
  const methods = new Set(options.methods)
  const requireApiKey = options.requireApiKey ?? true

  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    setCorsHeaders(res)

    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }

    if (!req.method || !methods.has(req.method as HttpMethod)) {
      res.setHeader('Allow', [...methods].join(', '))
      jsonResponse(res, 405, {
        code: 'METHOD_NOT_ALLOWED',
        error: `Método ${req.method ?? 'UNKNOWN'} não suportado para esta rota.`,
      })
      return
    }

    try {
      if (requireApiKey) {
        assertApiKey(req)
      }

      const token = readBearerToken(req)
      const { user, supabase } = await authenticateToken(token)
      const url = parseUrl(req)
      const idempotencyContext = resolveAuthIdempotencyContext(req, url.pathname)

      if (idempotencyContext) {
        const cached = await readCachedIdempotencyResponse(
          supabase,
          user.id,
          idempotencyContext,
        )

        if (cached) {
          res.setHeader('Idempotency-Replayed', 'true')
          jsonResponse(res, cached.status, cached.body)
          return
        }
      }

      const capture = idempotencyContext ? startResponseCapture(res) : null

      try {
        await handler({
          req,
          res,
          supabase,
          user,
          userId: user.id,
          url,
          query: url.searchParams,
        })
      } finally {
        capture?.restore()
      }

      if (idempotencyContext && capture) {
        const status = capture.getStatus()
        const body = capture.getBody()

        if (body !== undefined && status >= 200 && status < 500) {
          await storeIdempotencyResponse(supabase, {
            userId: user.id,
            context: idempotencyContext,
            status,
            body,
          })
        }
      }
    } catch (error) {
      if (!(error instanceof AppError) && !(error instanceof ZodError)) {
        console.error(error)
      }

      const mapped = createErrorPayload(error)
      jsonResponse(res, mapped.status, mapped.body)
    }
  }
}

export const createPublicHandler = (
  options: HandlerOptions,
  handler: PublicHandler,
) => {
  const methods = new Set(options.methods)
  const requireApiKey = options.requireApiKey ?? true

  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    setCorsHeaders(res)

    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }

    if (!req.method || !methods.has(req.method as HttpMethod)) {
      res.setHeader('Allow', [...methods].join(', '))
      jsonResponse(res, 405, {
        code: 'METHOD_NOT_ALLOWED',
        error: `Método ${req.method ?? 'UNKNOWN'} não suportado para esta rota.`,
      })
      return
    }

    try {
      if (requireApiKey) {
        assertApiKey(req)
      }

      const url = parseUrl(req)
      await handler({ req, res, url, query: url.searchParams })
    } catch (error) {
      if (!(error instanceof AppError) && !(error instanceof ZodError)) {
        console.error(error)
      }

      const mapped = createErrorPayload(error)
      jsonResponse(res, mapped.status, mapped.body)
    }
  }
}

export const parseJsonBody = async <T>(req: VercelRequest): Promise<T> => {
  const cachedReq = req as ParsedBodyRequest

  if (cachedReq[parsedBodySymbol] !== undefined) {
    return cachedReq[parsedBodySymbol] as T
  }

  const body = req.body

  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
    cachedReq[parsedBodySymbol] = body
    return body as T
  }

  if (typeof body === 'string') {
    const parsed = JSON.parse(body) as T
    cachedReq[parsedBodySymbol] = parsed
    return parsed
  }

  if (Buffer.isBuffer(body)) {
    const parsed = JSON.parse(body.toString('utf8')) as T
    cachedReq[parsedBodySymbol] = parsed
    return parsed
  }

  const raw = await new Promise<string>((resolve, reject) => {
    let chunk = ''

    req.on('data', (value) => {
      chunk += value
    })

    req.on('end', () => resolve(chunk))
    req.on('error', (error) => reject(error))
  })

  const parsed = raw ? (JSON.parse(raw) as T) : ({} as T)
  cachedReq[parsedBodySymbol] = parsed
  return parsed
}

export const queryToObject = (
  searchParams: URLSearchParams,
): Record<string, string> => {
  const output: Record<string, string> = {}

  for (const [key, value] of searchParams.entries()) {
    output[key] = value
  }

  return output
}
