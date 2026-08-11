import axios from 'axios'

export const AUTH_STORAGE_KEY = 'candy-shop-auth'

function readStoredToken() {
  try {
    const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!rawAuth) return null

    const storedAuth = JSON.parse(rawAuth) as { state?: { token?: string | null } }
    return storedAuth.state?.token ?? null
  } catch {
    return null
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  const token = readStoredToken()

  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined
    if (status === 401) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)
