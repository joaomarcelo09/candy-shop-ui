import { useMutation } from '@tanstack/react-query'
import { appDependencies } from '../api/dependencies'
import { useAuthStore } from '../stores/authStore'

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: appDependencies.authApi.login,
    onSuccess: (session, credentials) => {
      setSession(session.token, session.user ?? { email: credentials.email })
    },
  })
}
