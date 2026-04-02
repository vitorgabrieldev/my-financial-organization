export const APP_MODULES = [
  'dashboard',
  'transactions',
  'categories',
  'accounts',
  'goals',
  'reports',
  'users',
] as const

export type AppModule = (typeof APP_MODULES)[number]

export const PERMISSION_ACTIONS = [
  'view',
  'list',
  'create',
  'edit',
  'delete',
] as const

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]

export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const CATEGORY_KINDS = ['income', 'expense'] as const
export type CategoryKind = (typeof CATEGORY_KINDS)[number]

export const ACCOUNT_TYPES = [
  'checking',
  'savings',
  'cash',
  'credit',
  'investment',
  'other',
] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const GOAL_STATUSES = ['active', 'achieved', 'paused', 'cancelled'] as const
export type GoalStatus = (typeof GOAL_STATUSES)[number]

export const RECURRENCE_FREQUENCIES = [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number]
