import { z } from 'zod'

export const updateStudentSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .optional(),
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido. Use: (00) 00000-0000')
    .optional()
    .or(z.literal('')),
  birthdate: z
    .string()
    .refine((date) => {
      if (!date) return true
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 4 && age <= 100
    }, 'Data de nascimento inválida')
    .optional(),
  belt_id: z.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
