// hooks/use-students.ts - Atualizar completo

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useStudentByUserId(userId: string | null) {
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchStudent = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        setStudent(data)
      } catch (error) {
        console.error('Erro ao buscar student:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [userId])

  return { student, isLoading }
}

export function useStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const mutate = async () => {
    await fetchStudents()
  }

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_type', 'STUDENT')

      if (error) throw error
      setStudents(data || [])
      setIsError(false)
    } catch (error) {
      console.error('Erro ao buscar estudantes:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return { students, isLoading, isError, mutate }
}

// hooks/use-students.ts - Adicionar ao final

export function useUpdateStudent() {
  const updateStudent = async (studentId: string, data: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', studentId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao atualizar estudante:', error)
      throw error
    }
  }

  return updateStudent
}

export function useDeleteStudent() {
  const deleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao deletar estudante:', error)
      throw error
    }
  }

  return deleteStudent
}

