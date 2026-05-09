import axios from 'axios'
import toast from 'react-hot-toast'

const AUTH_STORAGE_KEY = 'candy-shop-auth'

function readToken() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { state?: { token?: string | null } }

    return parsed.state?.token ?? null
  } catch {
    return null
  }
}

function redirectToLogin() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)

  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  const token = readToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined
    const message =
      (error.response?.data?.message as string | string[] | undefined) ??
      'Unexpected request failure'

    if (status === 401) {
      redirectToLogin()
    }

    toast.error(Array.isArray(message) ? message.join(', ') : message)

    return Promise.reject(error)
  },
)

export { AUTH_STORAGE_KEY }
