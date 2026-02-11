import { z } from 'zod'

export const createBeltSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  color: z.string().min(3, 'Cor é obrigatória'),
  order_number: z.number().int().positive('Ordem deve ser positiva'),
  min_training_days: z.number().int().min(0).optional(),
})

export const updateBeltSchema = createBeltSchema.partial()

export type CreateBeltInput = z.infer<typeof createBeltSchema>
export type UpdateBeltInput = z.infer<typeof updateBeltSchema>
