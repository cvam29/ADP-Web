import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import { clearViewAsRestoreSession } from '@/lib/view-as-session'
import { isSafeRedirect } from '@/lib/safe-redirect'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-adp.azure-api.net'

// Create axios instance
const apiInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem('authToken')
  window.localStorage.removeItem('refreshToken')
  window.localStorage.removeItem('user')
  window.localStorage.removeItem('mustResetPassword')
  clearViewAsRestoreSession()
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error)
    } else {
      p.resolve(token!)
    }
  })
  failedQueue = []
}

// Request interceptor → attach token
apiInstance.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor → handle errors with token refresh
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    let errorMessage = 'An unexpected error occurred'

    if (error.response) {
      const { status, data } = error.response

      if (status === 401 && !originalRequest._retry) {
        // Don't refresh on password reset page
        const isOnResetPage = typeof window !== 'undefined' && window.location.pathname.includes('/reset-password')
        if (isOnResetPage) {
          return Promise.reject(new Error('Your session has expired. Please log in again to reset your password.'))
        }

        // Don't attempt refresh on the refresh endpoint itself
        if (originalRequest.url?.includes('/api/auth/refresh')) {
          clearAuthStorage()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return Promise.reject(new Error('Session expired. Please log in again.'))
        }

        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
        const currentToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

        if (!refreshToken || !currentToken) {
          clearAuthStorage()
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            const safeRedirect = isSafeRedirect(currentPath) ? encodeURIComponent(currentPath) : ''
            window.location.href = safeRedirect ? `/login?redirect=${safeRedirect}` : '/login'
          }
          return Promise.reject(new Error('User not authenticated. Redirecting to login...'))
        }

        if (isRefreshing) {
          return new Promise<AxiosResponse>((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`
                }
                resolve(apiInstance(originalRequest))
              },
              reject,
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            token: currentToken,
            refreshToken: refreshToken,
          })

          const { token: newToken, refreshToken: newRefreshToken, user } = response.data
          localStorage.setItem('authToken', newToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          if (user) {
            localStorage.setItem('user', JSON.stringify(user))
          }

          processQueue(null, newToken)

          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          }
          return apiInstance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          clearAuthStorage()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return Promise.reject(new Error('Session expired. Please log in again.'))
        } finally {
          isRefreshing = false
        }
      } else if (status === 401) {
        clearAuthStorage()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        errorMessage = 'User not authenticated. Redirecting to login...'
      } else {
        errorMessage =
          (data as any)?.message ||
          (data as any)?.error ||
          error.message ||
          errorMessage
      }
    }

    return Promise.reject(new Error(errorMessage))
  }
)

// ✅ Function that Orval looks for
export const apiClient = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const source = axios.CancelToken.source()
  const promise = apiInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  })

  // Attach cancel method so callers can abort in-flight requests
  ;(promise as any).cancel = () => {
    source.cancel('Request cancelled')
  }

  return promise
}
