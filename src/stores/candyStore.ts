import toast from 'react-hot-toast'
import { create } from 'zustand'
import { api } from '../api/http'
import type { CandyStoreState } from '../types/api'
import type { Candy } from '../types/domain'

export const useCandyStore = create<CandyStoreState>((set) => ({
  candies: [],
  loading: false,
  async fetchCandies() {
    set({ loading: true })

    try {
      const response = await api.get<Candy[]>('/candies')
      set({ candies: response.data })

      return response.data
    } finally {
      set({ loading: false })
    }
  },
  async createCandy(payload) {
    set({ loading: true })

    try {
      await api.post('/candies', payload)
      toast.success('Candy created')
      const response = await api.get<Candy[]>('/candies')
      set({ candies: response.data })
    } finally {
      set({ loading: false })
    }
  },
  async updateCandy(id, payload) {
    set({ loading: true })

    try {
      await api.patch(`/candies/${id}`, payload)
      toast.success('Candy updated')
      const response = await api.get<Candy[]>('/candies')
      set({ candies: response.data })
    } finally {
      set({ loading: false })
    }
  },
}))
