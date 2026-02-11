import { z } from 'zod'

export const createCheckinSchema = z.object({
  class_id: z.string().uuid('ID da classe inválido'),
})

export const updateCheckinSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  notes: z.string().optional(),
})

export type CreateCheckinInput = z.infer<typeof createCheckinSchema>
export type UpdateCheckinInput = z.infer<typeof updateCheckinSchema>
