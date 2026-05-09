import { useEffect } from 'react'
import { useCandyStore } from '../stores/candyStore'
import { useSessionStore } from '../stores/sessionStore'

export function useBootstrap() {
  const candies = useCandyStore((state) => state.candies)
  const fetchCandies = useCandyStore((state) => state.fetchCandies)
  const fetchCurrentSession = useSessionStore((state) => state.fetchCurrentSession)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const loadedCandies = await fetchCandies()

      if (!cancelled) {
        await fetchCurrentSession(loadedCandies)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [fetchCandies, fetchCurrentSession])

  return {
    candies,
  }
}
