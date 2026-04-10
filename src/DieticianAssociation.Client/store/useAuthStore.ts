"use client"

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  AuthResponseDto,
  ChangePasswordDto,
  getDieticianAssociationAPI,
  LoginRequestDto,
  RegisterRequestDto,
  UserDto
} from '../services/generated'
import { apiClient } from '@/services/api-client'
import {
  clearViewAsRestoreSession,
  getViewAsRestoreSession,
  setViewAsRestoreSession,
} from '@/lib/view-as-session'
import { handleError } from './storeUtils'

const api = getDieticianAssociationAPI();

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem('authToken')
  window.localStorage.removeItem('refreshToken')
  window.localStorage.removeItem('user')
  window.localStorage.removeItem('mustResetPassword')
  clearViewAsRestoreSession()
}

const persistAuthState = (token: string, user: UserDto, mustResetPassword: boolean, refreshToken?: string) => {
  localStorage.setItem('authToken', token)
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('mustResetPassword', mustResetPassword ? 'true' : 'false')
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  }
}

const parseBooleanClaim = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1'
  }
  if (typeof value === 'number') return value === 1
  return false
}

const parseMustResetFromToken = (token?: string | null): boolean => {
  if (!token) return false

  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return false

    const payload = JSON.parse(atob(payloadPart)) as Record<string, unknown>
    return parseBooleanClaim(
      payload.mustResetPassword ??
      payload.forcePasswordReset ??
      payload.requirePasswordReset ??
      payload.must_change_password
    )
  } catch {
    return false
  }
}

interface AuthState {
  user?: UserDto | undefined
  token?: string | null | undefined
  mustResetPassword: boolean
  isViewingAs: boolean
  viewAsAdminUser?: UserDto | null | undefined
  loading: boolean
  error?: string
  success?: boolean
  message?: string | null | undefined
  loginUser: (request: LoginRequestDto) => Promise<boolean>
  registerUser: (request: RegisterRequestDto) => Promise<boolean>
  changePassword: (request: ChangePasswordDto) => Promise<boolean>
  hydratePersistedSession: () => void
  hydrateViewAsSession: () => void
  syncCurrentUser: (user: UserDto) => void
  startViewAs: (targetUserId: string) => Promise<boolean>
  exitViewAs: () => Promise<boolean>
  logout: () => void
  removeError: () => void
  clearMessage: () => void
}

const normalizeRestoredUser = (user: UserDto): UserDto => {
  if (user.roleId !== undefined) {
    return user
  }

  if (user.role !== undefined) {
    const roleNum = parseInt(user.role ?? '0', 10)
    if (!Number.isNaN(roleNum)) {
      return {
        ...user,
        roleId: roleNum,
      }
    }
  }

  return {
    ...user,
    roleId: 0,
  }
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: undefined,
    token: undefined,
    mustResetPassword: false,
    isViewingAs: false,
    viewAsAdminUser: undefined,
    loading: false,
    error: undefined,
    success: undefined,
    message: undefined,

    loginUser: async (request) => {
      set({ loading: true, error: undefined, success: undefined, message: undefined })
      try {
        const res = await api.postApiAuthLogin(request)
        const { token, user } = res.data
        if (!token || !user) {
          throw new Error('Login response was incomplete.')
        }

        const loginResponse = res.data as Record<string, unknown>
        const mustResetPassword =
          parseBooleanClaim(
            loginResponse.mustResetPassword ??
              loginResponse.forcePasswordReset ??
              loginResponse.requirePasswordReset ??
              (loginResponse.user as Record<string, unknown> | undefined)
                ?.mustResetPassword
          ) || parseMustResetFromToken(token)

        clearViewAsRestoreSession()
        persistAuthState(token, user, mustResetPassword, (res.data as any).refreshToken)
        set({ 
          user, 
          token, 
          mustResetPassword,
          isViewingAs: false,
          viewAsAdminUser: undefined,
          loading: false, 
          success: true, 
          message: 'Login successful!' 
        })
        return true
      } catch (err: any) {
        set({ 
          error: handleError(err), 
          loading: false, 
          success: false, 
          message: err?.response?.data?.message ?? 'Login failed!' 
        })
        return false
      }
    },

    registerUser: async (data) => {
      set({ loading: true, error: undefined, success: undefined, message: undefined })
      try {
        const res = await api.postApiAuthRegister(data)
        const { token, user } = res.data
        if (!token || !user) {
          throw new Error('Registration response was incomplete.')
        }

        clearViewAsRestoreSession()
        persistAuthState(token, user, false, (res.data as any).refreshToken)
        set({ 
          user, 
          token, 
          mustResetPassword: false,
          isViewingAs: false,
          viewAsAdminUser: undefined,
          loading: false, 
          success: true, 
          message: 'Registration successful!' 
        })
        return true
      } catch (err: any) {
        set({ 
          error: handleError(err), 
          loading: false, 
          success: false, 
          message: err?.response?.data?.message ?? 'Registration failed!' 
        })
        return false
      }
    },

    changePassword: async (request) => {
      set({ loading: true, error: undefined, success: undefined, message: undefined })

      // Pre-flight: check if the JWT is about to expire
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const expiresAt = payload.exp * 1000
          const timeLeft = expiresAt - Date.now()
          if (timeLeft < 60_000) { // less than 1 minute remaining
            set({
              error: 'Your session has expired. Please log in again to change your password.',
              loading: false,
              success: false,
              message: 'Session expired. Please log in again.'
            })
            return false
          }
        }
      } catch {
        // If token parsing fails, let the API call proceed and handle the error
      }

      try {
        await api.postApiAuthChangePassword(request)
        localStorage.setItem('mustResetPassword', 'false')
        set({
          mustResetPassword: false,
          loading: false,
          success: true,
          message: 'Password updated successfully!'
        })
        return true
      } catch (err: any) {
        set({
          error: handleError(err),
          loading: false,
          success: false,
          message: err?.response?.data?.message ?? 'Unable to update password.'
        })
        return false
      }
    },

    hydratePersistedSession: () => {
      if (typeof window === 'undefined') {
        return
      }

      const userRaw = localStorage.getItem('user')
      const tokenRaw = localStorage.getItem('authToken')
      const mustResetRaw = localStorage.getItem('mustResetPassword')
      const restoreSession = getViewAsRestoreSession()

      let parsedUser: UserDto | undefined
      if (userRaw) {
        try {
          parsedUser = normalizeRestoredUser(JSON.parse(userRaw) as UserDto)
        } catch {
          parsedUser = undefined
        }
      }

      set({
        user: parsedUser,
        token: tokenRaw,
        mustResetPassword: mustResetRaw === 'true',
        isViewingAs: Boolean(restoreSession),
        viewAsAdminUser: (restoreSession?.user as UserDto | undefined) ?? undefined,
      })
    },

    hydrateViewAsSession: () => {
      const restoreSession = getViewAsRestoreSession()
      set({
        isViewingAs: Boolean(restoreSession),
        viewAsAdminUser: (restoreSession?.user as UserDto | undefined) ?? undefined,
      })
    },

    syncCurrentUser: (user) => {
      persistAuthState(
        localStorage.getItem('authToken') ?? '',
        user,
        localStorage.getItem('mustResetPassword') === 'true',
      )
      set({ user })
    },

    startViewAs: async (targetUserId) => {
      const { token, user, mustResetPassword } = useAuthStore.getState()
      if (!token || !user?.id) {
        set({
          success: false,
          error: 'Admin session was not available.',
          message: 'Unable to start view as without an active admin session.',
        })
        return false
      }

      set({ loading: true, error: undefined, success: undefined, message: undefined })
      setViewAsRestoreSession({
        token,
        user,
        mustResetPassword,
      })

      try {
        const response = await apiClient<AuthResponseDto>({
          url: `/api/auth/view-as/${targetUserId}`,
          method: 'POST',
        })

        const nextSession = response.data
        if (!nextSession.token || !nextSession.user) {
          throw new Error('View-as response was incomplete.')
        }

        persistAuthState(nextSession.token, nextSession.user, false)

        set({
          user: nextSession.user,
          token: nextSession.token,
          mustResetPassword: false,
          isViewingAs: true,
          viewAsAdminUser: user,
          loading: false,
          success: true,
          message: `Viewing as ${nextSession.user.name}`,
        })

        return true
      } catch (err: any) {
        clearViewAsRestoreSession()
        set({
          error: handleError(err),
          loading: false,
          success: false,
          message: err?.response?.data?.message ?? 'Unable to start view as.',
        })
        return false
      }
    },

    exitViewAs: async () => {
      const restoreSession = getViewAsRestoreSession()
      if (!restoreSession?.token || !restoreSession.user) {
        set({
          isViewingAs: false,
          viewAsAdminUser: undefined,
          success: false,
          error: 'No admin session was available to restore.',
          message: 'Unable to return to the admin dashboard.',
        })
        return false
      }

      persistAuthState(
        restoreSession.token,
        restoreSession.user as UserDto,
        restoreSession.mustResetPassword,
      )
      clearViewAsRestoreSession()

      set({
        user: restoreSession.user as UserDto,
        token: restoreSession.token,
        mustResetPassword: restoreSession.mustResetPassword,
        isViewingAs: false,
        viewAsAdminUser: undefined,
        loading: false,
        success: true,
        message: 'Returned to admin dashboard.',
      })

      return true
    },

    logout: () => {
      clearAuthStorage()
      set({ 
        user: undefined, 
        token: undefined, 
        mustResetPassword: false,
        isViewingAs: false,
        viewAsAdminUser: undefined,
        success: true, 
        message: 'Logged out successfully!' 
      })
      // window.location.href = '/'
    },

    removeError: () => set({ error: undefined }),
    clearMessage: () => set({ message: undefined, success: undefined }),
  }))
)
