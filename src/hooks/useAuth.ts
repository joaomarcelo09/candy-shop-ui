import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth'
import { mutationKeys } from '../queries/queryKeys'
import { useAuthStore } from '../stores/authStore'
import { decodeUserFromToken } from '../utils/jwt'

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationKey: mutationKeys.login,
    mutationFn: login,
    onSuccess: ({ token }) => {
      setAuth(token, decodeUserFromToken(token))
    },
  })
}
