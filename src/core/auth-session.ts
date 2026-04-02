import type { Session, User } from '@supabase/supabase-js'

export interface SerializedAuthSession {
  access_token: string
  refresh_token: string | null
  expires_at: number | null
  token_type: string | null
  user: {
    id: string | null
    email: string | null
  }
}

export const serializeAuthSession = (
  session: Session,
  user: User | null,
): SerializedAuthSession => {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token ?? null,
    expires_at: session.expires_at ?? null,
    token_type: session.token_type ?? null,
    user: {
      id: user?.id ?? null,
      email: user?.email ?? null,
    },
  }
}
