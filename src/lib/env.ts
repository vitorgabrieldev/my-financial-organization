const readEnv = (key: string): string | undefined => {
  const value = (import.meta.env as Record<string, string | undefined>)[key]
  return value?.trim() ? value : undefined
}

export const SUPABASE_URL =
  readEnv('VITE_SUPABASE_URL') ?? readEnv('NEXT_PUBLIC_SUPABASE_URL') ?? ''

export const SUPABASE_ANON_KEY =
  readEnv('VITE_SUPABASE_ANON_KEY') ??
  readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY') ??
  ''

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0
