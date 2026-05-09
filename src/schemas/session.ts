import { z } from 'zod'

export const sessionSaleSchema = z.object({
  candy_id: z.uuid(),
  quantity: z.number().int().positive(),
})

export const sessionOrderSchema = z.object({
  items: z
    .array(
      z.object({
        candy_id: z.uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
})

export const closeSessionSchema = z.object({
  sessionId: z.uuid(),
})
