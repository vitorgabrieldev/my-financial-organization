import { z } from 'zod'
import { AppError } from './errors'

export const SORT_ORDERS = ['asc', 'desc'] as const
export type SortOrder = (typeof SORT_ORDERS)[number]

interface CursorPayload {
  v: 1
  offset: number
  sort: string
  order: SortOrder
}

const cursorPayloadSchema = z.object({
  v: z.literal(1),
  offset: z.number().int().min(0),
  sort: z.string().trim().min(1),
  order: z.enum(SORT_ORDERS),
})

const decodeBase64Json = (value: string): unknown => {
  const normalized = value.trim()
  const variants = [normalized, normalized.replace(/-/g, '+').replace(/_/g, '/')]

  for (const candidate of variants) {
    try {
      const text = Buffer.from(candidate, 'base64').toString('utf8')
      if (!text) continue
      return JSON.parse(text)
    } catch {
      // try next
    }
  }

  throw new AppError(
    422,
    'Cursor inválido.',
    undefined,
    'PAGINATION_CURSOR_INVALID',
  )
}

const toCursor = (payload: CursorPayload): string => {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

export interface ResolvedPagination {
  limit: number
  offset: number
  sort: string
  order: SortOrder
}

interface ResolvePaginationInput {
  limit: number
  offset: number
  sort: string
  order: SortOrder
  cursor?: string | undefined
}

export const resolvePagination = (
  input: ResolvePaginationInput,
): ResolvedPagination => {
  if (!input.cursor) {
    return {
      limit: input.limit,
      offset: input.offset,
      sort: input.sort,
      order: input.order,
    }
  }

  const parsed = cursorPayloadSchema.parse(decodeBase64Json(input.cursor))

  if (parsed.sort !== input.sort || parsed.order !== input.order) {
    throw new AppError(
      422,
      'Cursor incompatível com os parâmetros sort/order atuais.',
      {
        expected: { sort: input.sort, order: input.order },
        received: { sort: parsed.sort, order: parsed.order },
      },
      'PAGINATION_CURSOR_MISMATCH',
    )
  }

  return {
    limit: input.limit,
    offset: parsed.offset,
    sort: input.sort,
    order: input.order,
  }
}

interface BuildPaginationOutputInput {
  limit: number
  offset: number
  total: number
  currentCount: number
  sort: string
  order: SortOrder
}

export const buildPagination = (input: BuildPaginationOutputInput) => {
  const safeTotal = Math.max(0, input.total)
  const nextOffset = input.offset + input.currentCount
  const hasMore = nextOffset < safeTotal

  return {
    limit: input.limit,
    offset: input.offset,
    total: safeTotal,
    sort: input.sort,
    order: input.order,
    has_more: hasMore,
    next_cursor: hasMore
      ? toCursor({
          v: 1,
          offset: nextOffset,
          sort: input.sort,
          order: input.order,
        })
      : null,
  }
}
