import {
  createClient,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js'
import { assertEnv, env } from './env.js'
import { AppError, UnauthorizedError } from './errors.js'

assertEnv()

const sharedOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
}

export const createUserSupabaseClient = (accessToken: string): SupabaseClient => {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...sharedOptions,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

export const createServiceSupabaseClient = (): SupabaseClient => {
  if (!env.supabaseServiceRoleKey) {
    throw new AppError(
      500,
      'SUPABASE_SERVICE_ROLE_KEY não configurada.',
      undefined,
      'ENV_SUPABASE_SERVICE_ROLE_KEY_MISSING',
    )
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, sharedOptions)
}

export const authenticateToken = async (
  accessToken: string,
): Promise<{ user: User; supabase: SupabaseClient }> => {
  const supabase = createUserSupabaseClient(accessToken)
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    throw new UnauthorizedError('Falha ao autenticar com Supabase Auth.')
  }

  return { user: data.user, supabase }
}
