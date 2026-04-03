import { AppError } from './errors.js'

const readEnv = (key: string): string => {
  const value = process.env[key]?.trim()
  return value || ''
}

const firstNonEmpty = (...values: string[]): string => {
  return values.find((value) => value.length > 0) ?? ''
}

export const env = {
  apiKey: readEnv('API_KEY'),
  supabaseUrl: firstNonEmpty(
    readEnv('SUPABASE_URL'),
    readEnv('VITE_SUPABASE_URL'),
    readEnv('NEXT_PUBLIC_SUPABASE_URL'),
  ),
  supabaseAnonKey: firstNonEmpty(
    readEnv('SUPABASE_ANON_KEY'),
    readEnv('VITE_SUPABASE_ANON_KEY'),
    readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'),
  ),
  supabaseServiceRoleKey: readEnv('SUPABASE_SERVICE_ROLE_KEY'),
  corsAllowOrigin: readEnv('CORS_ALLOW_ORIGIN') || '*',
}

export const assertEnv = (): void => {
  if (!env.apiKey) {
    throw new AppError(500, 'API_KEY não configurada.', undefined, 'ENV_API_KEY_MISSING')
  }

  if (!env.supabaseUrl) {
    throw new AppError(
      500,
      'SUPABASE_URL não configurada.',
      undefined,
      'ENV_SUPABASE_URL_MISSING',
    )
  }

  if (!env.supabaseAnonKey) {
    throw new AppError(
      500,
      'SUPABASE_ANON_KEY não configurada.',
      undefined,
      'ENV_SUPABASE_ANON_KEY_MISSING',
    )
  }
}
