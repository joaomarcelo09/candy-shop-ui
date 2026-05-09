import { z } from 'zod'

export const candySchema = z.object({
  name: z.string().trim().min(2, 'Candy name is too short'),
  price: z.number().positive('Price must be greater than zero'),
})

export type CandySchema = z.infer<typeof candySchema>
