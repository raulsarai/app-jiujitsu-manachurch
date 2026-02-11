import { z } from 'zod'

export const createClassSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  instructor_name: z.string().min(2, 'Nome do instrutor é obrigatório'),
  day_of_week: z.string().min(1, 'Dia é obrigatório'),
  start_time: z.string().min(1, 'Horário inicial é obrigatório'),
  end_time: z.string().optional(),
  duration_minutes: z.number().min(30).max(180).default(60),
  max_students: z.number().min(1).optional().nullable(),
  belt_level: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export const updateClassSchema = createClassSchema.partial()

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
