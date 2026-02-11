// hooks/use-belts.ts - Atualizar completo

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useBelts() {
  const [belts, setBelts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const mutate = async () => {
    await fetchBelts()
  }

  const fetchBelts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('belts')
        .select('*')
        .order('order_number')

      if (error) throw error
      setBelts(data || [])
      setIsError(false)
    } catch (error) {
      console.error('Erro ao buscar cintos:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBelts()
  }, [])

  return { belts, isLoading, isError, mutate }
}

export function useUpdateBelt() {
  const updateBelt = async (beltId: number, data: any) => {
    try {
      const { error } = await supabase
        .from('belts')
        .update(data)
        .eq('id', beltId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao atualizar cinto:', error)
      throw error
    }
  }

  return updateBelt
}

export function usePromoteStudent() {
  const promoteStudent = async (data: {
    student_id: number
    to_belt_id: number
    notes?: string
  }) => {
    try {
      // 1. Obter cinto atual do perfil
      const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select('belt, id')
        .eq('id', data.student_id)
        .single()

      if (studentError) throw studentError

      // 2. Obter ID do cinto atual
      const { data: currentBelt, error: beltError } = await supabase
        .from('belts')
        .select('id')
        .eq('name', student.belt)
        .single()

      if (beltError) throw beltError

      // 3. Inserir progresso
      const { error: progressError } = await supabase
        .from('student_progress')
        .insert([
          {
            student_id: data.student_id,
            from_belt_id: currentBelt.id,
            to_belt_id: data.to_belt_id,
            promotion_date: new Date().toISOString().split('T')[0],
            status: 'completed',
            notes: data.notes,
          },
        ])

      if (progressError) throw progressError

      // 4. Atualizar perfil com nova faixa
      const { data: newBelt, error: newBeltError } = await supabase
        .from('belts')
        .select('name')
        .eq('id', data.to_belt_id)
        .single()

      if (newBeltError) throw newBeltError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ belt: newBelt.name })
        .eq('id', data.student_id)

      if (updateError) throw updateError

      return { success: true }
    } catch (error: any) {
      console.error('Erro ao promover estudante:', error)
      throw error
    }
  }

  return promoteStudent
}

export function usePromotions(studentId?: string | null) {
  const [promotions, setPromotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        let query = supabase
          .from('student_progress')
          .select(`
            *,
            from_belt:from_belt_id(name, color, order_number),
            to_belt:to_belt_id(name, color, order_number)
          `)

        if (studentId) {
          query = query.eq('student_id', studentId)
        }

        const { data } = await query.eq('status', 'completed').order('promotion_date', { ascending: false })
        setPromotions(data || [])
      } catch (error) {
        console.error('Erro ao buscar promoções:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPromotions()
  }, [studentId])

  return { promotions, isLoading }
}
