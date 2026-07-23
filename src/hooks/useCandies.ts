import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createCandy, getCandies, updateCandy } from '../api/candies'
import { candyKeys, mutationKeys } from '../queries/queryKeys'

export function useCandiesQuery() {
  return useQuery({
    queryKey: candyKeys.all,
    queryFn: ({ signal }) => getCandies(signal),
  })
}

export function useCreateCandyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.createCandy,
    mutationFn: createCandy,
    onSuccess: async () => {
      toast.success('Candy created')
      await queryClient.invalidateQueries({ queryKey: candyKeys.all })
    },
  })
}

export function useUpdateCandyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.updateCandy,
    mutationFn: updateCandy,
    onSuccess: async () => {
      toast.success('Candy updated')
      await queryClient.invalidateQueries({ queryKey: candyKeys.all })
    },
  })
}
