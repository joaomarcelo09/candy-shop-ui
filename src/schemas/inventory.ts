import { z } from 'zod'

export const stockEntrySchema = z.object({
  candyName: z.string().trim().min(2, 'Informe o nome do doce'),
  quantity: z
    .number({ error: 'Informe a quantidade' })
    .int('Use apenas números inteiros')
    .min(1, 'A quantidade mínima é 1'),
  unitSalePrice: z
    .number({ error: 'Informe o preço de venda' })
    .positive('O preço deve ser maior que zero'),
  saleIncrement: z.union([z.literal(1), z.literal(5)]),
})

export type StockEntryFormValues = z.infer<typeof stockEntrySchema>

export const stockQuantityCorrectionSchema = z.object({
  quantity: z
    .number({ error: 'Informe a quantidade correta' })
    .int('Use apenas números inteiros')
    .min(0, 'A quantidade não pode ser negativa'),
})

export type StockQuantityCorrectionFormValues = z.infer<typeof stockQuantityCorrectionSchema>
