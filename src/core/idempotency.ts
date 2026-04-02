import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { VercelRequest } from '@vercel/node'
import { AppError } from './errors'

const IDEMPOTENCY_HEADER = 'idempotency-key'

type MutatingMethod = 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface IdempotencyRow {
  request_hash: string
  status_code: number
  response_body: unknown
}

const isIdempotencyStorageUnavailable = (error: {
  code?: string | null
  message?: string | null
}): boolean => {
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    error.message?.includes('idempotency_requests') === true
  )
}

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`)
  return `{${pairs.join(',')}}`
}

const readRequestBodyString = (req: VercelRequest): string => {
  const body = req.body

  if (body === undefined || body === null) return ''
  if (typeof body === 'string') return body
  if (Buffer.isBuffer(body)) return body.toString('utf8')

  if (typeof body === 'object') {
    return stableStringify(body)
  }

  return String(body)
}

export const isMutatingHttpMethod = (method?: string | null): method is MutatingMethod => {
  return method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE'
}

const readIdempotencyKey = (req: VercelRequest): string => {
  const rawHeader = req.headers[IDEMPOTENCY_HEADER]
  const raw = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader
  return raw?.trim() ?? ''
}

const buildRequestHash = (req: VercelRequest, route: string): string => {
  const hasher = createHash('sha256')
  hasher.update(req.method ?? 'UNKNOWN')
  hasher.update('|')
  hasher.update(route)
  hasher.update('|')
  hasher.update(readRequestBodyString(req))
  return hasher.digest('hex')
}

const loadStoredRequest = async (
  supabase: SupabaseClient,
  params: { userId: string; requestKey: string; method: string; route: string },
): Promise<IdempotencyRow | null> => {
  const { data, error } = await supabase
    .from('idempotency_requests')
    .select('request_hash,status_code,response_body')
    .eq('user_id', params.userId)
    .eq('request_key', params.requestKey)
    .eq('method', params.method)
    .eq('route', params.route)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error) {
    if (isIdempotencyStorageUnavailable(error)) {
      return null
    }

    throw new AppError(
      500,
      `Falha ao consultar idempotência: ${error.message}`,
      undefined,
      'IDEMPOTENCY_LOOKUP_FAILED',
    )
  }

  return (data as IdempotencyRow | null) ?? null
}

export interface AuthIdempotencyContext {
  requestKey: string
  requestHash: string
  method: MutatingMethod
  route: string
}

export const resolveAuthIdempotencyContext = (
  req: VercelRequest,
  route: string,
): AuthIdempotencyContext | null => {
  if (!isMutatingHttpMethod(req.method)) return null

  const requestKey = readIdempotencyKey(req)
  if (!requestKey) return null

  const method = req.method
  const requestHash = buildRequestHash(req, route)

  return {
    requestKey,
    requestHash,
    method,
    route,
  }
}

export const readCachedIdempotencyResponse = async (
  supabase: SupabaseClient,
  userId: string,
  context: AuthIdempotencyContext,
): Promise<{ status: number; body: unknown } | null> => {
  const row = await loadStoredRequest(supabase, {
    userId,
    requestKey: context.requestKey,
    method: context.method,
    route: context.route,
  })

  if (!row) return null

  if (row.request_hash !== context.requestHash) {
    throw new AppError(
      409,
      'Idempotency-Key já usada com payload diferente para esta rota.',
      undefined,
      'IDEMPOTENCY_KEY_CONFLICT',
    )
  }

  return {
    status: row.status_code,
    body: row.response_body,
  }
}

export const storeIdempotencyResponse = async (
  supabase: SupabaseClient,
  params: {
    userId: string
    context: AuthIdempotencyContext
    status: number
    body: unknown
  },
): Promise<void> => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('idempotency_requests')
    .insert({
      user_id: params.userId,
      request_key: params.context.requestKey,
      method: params.context.method,
      route: params.context.route,
      request_hash: params.context.requestHash,
      status_code: params.status,
      response_body: params.body ?? {},
      expires_at: expiresAt,
    })

  if (error && error.code !== '23505') {
    if (isIdempotencyStorageUnavailable(error)) {
      return
    }

    throw new AppError(
      500,
      `Falha ao persistir idempotência: ${error.message}`,
      undefined,
      'IDEMPOTENCY_PERSIST_FAILED',
    )
  }
}
