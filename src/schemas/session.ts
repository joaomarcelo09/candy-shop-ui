import { z } from 'zod'

export const sessionSaleSchema = z.object({
  candy_id: z.uuid(),
  quantity: z.number().int().positive(),
})

export const closeSessionSchema = z.object({
  sessionId: z.uuid(),
})
