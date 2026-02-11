import { z } from 'zod'

export const createPromotionSchema = z.object({
  student_id: z.number().int().positive(),
  to_belt_id: z.number().int().positive(),
  notes: z.string().optional(),
})

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>
