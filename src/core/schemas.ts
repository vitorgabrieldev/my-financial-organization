import { z } from 'zod'
import {
  ACCOUNT_TYPES,
  CATEGORY_KINDS,
  GOAL_STATUSES,
  RECURRENCE_FREQUENCIES,
  TRANSACTION_TYPES,
  type TransactionType,
} from './types.js'

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Moeda deve ser um código ISO de 3 letras.')

const isoDateSchema = z
  .string()
  .trim()
  .regex(isoDateRegex, 'Data deve estar no formato YYYY-MM-DD.')

const uuidSchema = z.string().uuid('Identificador inválido.')

const nullableTextSchema = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .nullable()

const nullableUuidSchema = uuidSchema.optional().nullable()

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
  cursor: z.string().trim().min(8).max(2048).optional(),
})

const sortOrderSchema = z.enum(['asc', 'desc'])

export const ACCOUNT_SORT_FIELDS = [
  'created_at',
  'name',
  'initial_balance',
] as const

export const CATEGORY_SORT_FIELDS = ['name', 'kind', 'created_at'] as const

export const GOAL_SORT_FIELDS = [
  'created_at',
  'name',
  'target_amount',
  'current_amount',
  'status',
] as const

export const TRANSACTION_SORT_FIELDS = [
  'occurs_on',
  'created_at',
  'amount_in_default_currency',
  'description',
  'type',
] as const

const booleanQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (normalized === '1' || normalized === 'true') return true
    if (normalized === '0' || normalized === 'false') return false
  }

  return value
}, z.boolean())

export const idParamSchema = z.object({
  id: uuidSchema,
})

export const preferencesUpdateSchema = z
  .object({
    default_currency: currencyCodeSchema.optional(),
    locale: z.string().trim().min(2).max(20).optional(),
    session_max_hours: z.coerce.number().int().min(1).max(24).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Informe ao menos um campo para atualizar preferências.',
  })

export const accountListQuerySchema = paginationSchema.extend({
  include_archived: booleanQuerySchema.default(false),
  search: z.string().trim().min(1).max(80).optional(),
  sort: z.enum(ACCOUNT_SORT_FIELDS).default('created_at'),
  order: sortOrderSchema.default('desc'),
})

export const accountCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(ACCOUNT_TYPES).default('checking'),
  currency: currencyCodeSchema.default('BRL'),
  initial_balance: z.coerce.number().finite().default(0),
  logo_path: z.string().trim().max(512).optional().nullable(),
  is_archived: z.boolean().optional().default(false),
})

export const accountUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    type: z.enum(ACCOUNT_TYPES).optional(),
    currency: currencyCodeSchema.optional(),
    initial_balance: z.coerce.number().finite().optional(),
    logo_path: z.string().trim().max(512).optional().nullable(),
    is_archived: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Informe ao menos um campo para atualizar a conta.',
  })

export const categoryListQuerySchema = paginationSchema.extend({
  kind: z.enum(CATEGORY_KINDS).optional(),
  search: z.string().trim().min(1).max(80).optional(),
  sort: z.enum(CATEGORY_SORT_FIELDS).default('name'),
  order: sortOrderSchema.default('asc'),
})

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  kind: z.enum(CATEGORY_KINDS),
  color: z.string().trim().min(4).max(20).default('#9f2f2f'),
  icon: z.string().trim().min(2).max(120).default('LuTag'),
  is_system: z.boolean().optional().default(false),
})

export const categoryUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    kind: z.enum(CATEGORY_KINDS).optional(),
    color: z.string().trim().min(4).max(20).optional(),
    icon: z.string().trim().min(2).max(120).optional(),
    is_system: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Informe ao menos um campo para atualizar a categoria.',
  })

export const goalListQuerySchema = paginationSchema.extend({
  status: z.enum(GOAL_STATUSES).optional(),
  search: z.string().trim().min(1).max(80).optional(),
  sort: z.enum(GOAL_SORT_FIELDS).default('created_at'),
  order: sortOrderSchema.default('desc'),
})

export const goalCreateSchema = z.object({
  name: z.string().trim().min(3).max(160),
  target_amount: z.coerce.number().positive(),
  current_amount: z.coerce.number().min(0).default(0),
  currency: currencyCodeSchema.default('BRL'),
  target_date: isoDateSchema.optional().nullable(),
  status: z.enum(GOAL_STATUSES).default('active'),
  notes: nullableTextSchema,
})

export const goalUpdateSchema = z
  .object({
    name: z.string().trim().min(3).max(160).optional(),
    target_amount: z.coerce.number().positive().optional(),
    current_amount: z.coerce.number().min(0).optional(),
    currency: currencyCodeSchema.optional(),
    target_date: isoDateSchema.optional().nullable(),
    status: z.enum(GOAL_STATUSES).optional(),
    notes: nullableTextSchema,
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Informe ao menos um campo para atualizar a meta.',
  })

const transactionBaseSchema = z.object({
  account_id: uuidSchema,
  transfer_account_id: nullableUuidSchema,
  category_id: nullableUuidSchema,
  goal_id: nullableUuidSchema,
  type: z.enum(TRANSACTION_TYPES),
  description: z.string().trim().min(2).max(200),
  notes: nullableTextSchema,
  amount: z.coerce.number().positive(),
  currency: currencyCodeSchema.default('BRL'),
  default_currency: currencyCodeSchema.default('BRL'),
  exchange_rate: z.coerce.number().positive().optional(),
  occurs_on: isoDateSchema,
  attachment_path: z.string().trim().max(1024).optional().nullable(),
  recurrence_frequency: z.enum(RECURRENCE_FREQUENCIES).default('none'),
  recurrence_interval: z.coerce.number().int().positive().default(1),
  recurrence_end_date: isoDateSchema.optional().nullable(),
  installments: z.coerce.number().int().min(1).max(120).default(1),
})

type TransactionValidationPayload = z.infer<typeof transactionBaseSchema>

const applyTransactionRules = (
  payload: TransactionValidationPayload,
  ctx: z.RefinementCtx,
): void => {
  const isTransfer = payload.type === 'transfer'

  if (isTransfer) {
    if (!payload.transfer_account_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transfer_account_id'],
        message: 'Transferências exigem conta de destino.',
      })
    }

    if (payload.transfer_account_id === payload.account_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transfer_account_id'],
        message: 'Conta de destino deve ser diferente da conta de origem.',
      })
    }

    if (payload.category_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category_id'],
        message: 'Transferências não devem ter categoria.',
      })
    }
  } else {
    if (payload.transfer_account_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transfer_account_id'],
        message: 'Somente transferências podem ter conta de destino.',
      })
    }

    if (!payload.category_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category_id'],
        message: 'Receitas e despesas exigem categoria.',
      })
    }
  }

  if (payload.installments > 1 && payload.recurrence_frequency !== 'none') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['recurrence_frequency'],
      message: 'Use parcelas ou recorrência, não os dois juntos.',
    })
  }

  if (payload.recurrence_frequency === 'none' && payload.recurrence_end_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['recurrence_end_date'],
      message: 'recurrence_end_date só pode ser usada com recorrência ativa.',
    })
  }

  if (
    payload.recurrence_frequency !== 'none' &&
    !payload.recurrence_end_date &&
    payload.installments <= 1
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['recurrence_end_date'],
      message: 'Informe uma data final para recorrência.',
    })
  }

  if (payload.currency !== payload.default_currency && !payload.exchange_rate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['exchange_rate'],
      message: 'exchange_rate é obrigatória quando currency difere de default_currency.',
    })
  }
}

export const transactionCreateSchema = transactionBaseSchema.superRefine(
  applyTransactionRules,
)

export const transactionPatchSchema = z
  .object({
    account_id: uuidSchema.optional(),
    transfer_account_id: nullableUuidSchema,
    category_id: nullableUuidSchema,
    goal_id: nullableUuidSchema,
    type: z.enum(TRANSACTION_TYPES).optional(),
    description: z.string().trim().min(2).max(200).optional(),
    notes: nullableTextSchema,
    amount: z.coerce.number().positive().optional(),
    currency: currencyCodeSchema.optional(),
    default_currency: currencyCodeSchema.optional(),
    exchange_rate: z.coerce.number().positive().optional(),
    occurs_on: isoDateSchema.optional(),
    attachment_path: z.string().trim().max(1024).optional().nullable(),
    recurrence_frequency: z.enum(RECURRENCE_FREQUENCIES).optional(),
    recurrence_interval: z.coerce.number().int().positive().optional(),
    recurrence_end_date: isoDateSchema.optional().nullable(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Informe ao menos um campo para atualizar a transação.',
  })

export const transactionListQuerySchema = paginationSchema.extend({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  type: z.enum(TRANSACTION_TYPES).optional(),
  account_id: uuidSchema.optional(),
  category_id: uuidSchema.optional(),
  goal_id: uuidSchema.optional(),
  search: z.string().trim().min(1).max(120).optional(),
  sort: z.enum(TRANSACTION_SORT_FIELDS).default('occurs_on'),
  order: sortOrderSchema.default('desc'),
})

export const reportQuerySchema = z.object({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
})

export const categoryReportQuerySchema = reportQuerySchema.extend({
  kind: z.enum(CATEGORY_KINDS).optional(),
  category_id: uuidSchema.optional(),
})

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>
export type TransactionPatchInput = z.infer<typeof transactionPatchSchema>

const mergedTransactionSchema = transactionBaseSchema
  .omit({ installments: true })
  .superRefine((payload, ctx) => {
    applyTransactionRules({ ...payload, installments: 1 }, ctx)
  })

type TransactionForValidation = z.infer<typeof mergedTransactionSchema>

export const validateMergedTransaction = (
  payload: unknown,
): TransactionForValidation => {
  return mergedTransactionSchema.parse(payload)
}

export const toTransactionType = (value: unknown): TransactionType | null => {
  if (typeof value !== 'string') return null
  return TRANSACTION_TYPES.includes(value as TransactionType)
    ? (value as TransactionType)
    : null
}
