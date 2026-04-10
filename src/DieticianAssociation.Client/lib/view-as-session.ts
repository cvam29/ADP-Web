export interface StoredAuthSessionUser {
  id?: string | null
  name?: string | null
  role?: string | null
  roleId?: number | null
}

export interface ViewAsRestoreSession {
  token: string
  user: StoredAuthSessionUser
  mustResetPassword: boolean
}

const VIEW_AS_RESTORE_KEY = 'viewAsRestoreSession'

export const getViewAsRestoreSession = (): ViewAsRestoreSession | null => {
  if (typeof window === 'undefined') return null

  const raw = window.sessionStorage.getItem(VIEW_AS_RESTORE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as ViewAsRestoreSession
  } catch {
    window.sessionStorage.removeItem(VIEW_AS_RESTORE_KEY)
    return null
  }
}

export const setViewAsRestoreSession = (session: ViewAsRestoreSession) => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(VIEW_AS_RESTORE_KEY, JSON.stringify(session))
}

export const clearViewAsRestoreSession = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(VIEW_AS_RESTORE_KEY)
}
