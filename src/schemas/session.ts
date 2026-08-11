import { z } from 'zod'

export const orderLineSchema = z.object({
  candyId: z.string().min(1),
  quantity: z.number().int().min(1),
})

export const createOrderSchema = z.object({
  lines: z.array(orderLineSchema).min(1, 'Adicione ao menos um doce'),
  pixReceiptUrl: z.string().url().optional(),
})
