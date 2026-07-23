import type { CandyPayload, UpdateCandyVariables } from '../types/api'
import type { Candy } from '../types/domain'
import { api } from './http'

export async function getCandies(signal?: AbortSignal) {
  const response = await api.get<Candy[]>('/candies', { signal })

  return response.data
}

export async function createCandy(payload: CandyPayload) {
  await api.post('/candies', payload)
}

export async function updateCandy({ id, payload }: UpdateCandyVariables) {
  await api.patch(`/candies/${id}`, payload)
}
