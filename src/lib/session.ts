export const SESSION_TRACKER_KEY = 'mfo.session-started-at'
export const SESSION_MAX_MS = 4 * 60 * 60 * 1000

export const registerSessionStart = (): void => {
  const existing = window.localStorage.getItem(SESSION_TRACKER_KEY)
  if (!existing) {
    window.localStorage.setItem(SESSION_TRACKER_KEY, String(Date.now()))
  }
}

export const resetSessionStart = (): void => {
  window.localStorage.setItem(SESSION_TRACKER_KEY, String(Date.now()))
}

export const clearSessionStart = (): void => {
  window.localStorage.removeItem(SESSION_TRACKER_KEY)
}

export const isSessionExpired = (): boolean => {
  const raw = window.localStorage.getItem(SESSION_TRACKER_KEY)
  if (!raw) return true

  const startedAt = Number(raw)
  if (Number.isNaN(startedAt)) return true

  return Date.now() - startedAt > SESSION_MAX_MS
}
