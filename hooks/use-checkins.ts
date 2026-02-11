// hooks/use-checkins.ts - Atualizar completo

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useCheckins(userId?: string | null) {
  const [checkins, setCheckins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const mutate = async () => {
    await fetchCheckins()
  }

  const fetchCheckins = async () => {
    try {
      setIsLoading(true)
      let query = supabase.from('check_ins').select('*')
      
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      setCheckins(data || [])
      setIsError(false)
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCheckins()
  }, [userId])

  return { checkins, isLoading, isError, mutate }
}

export function useApproveCheckin() {
  const approveCheckin = async (checkinId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const { error } = await supabase
        .from('check_ins')
        .update({ status })
        .eq('id', checkinId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao atualizar check-in:', error)
      throw error
    }
  }

  return approveCheckin
}

// hooks/use-checkins.ts - Adicionar ao final

export function useCreateCheckin() {
  const createCheckin = async (classId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.id) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('check_ins')
        .insert([
          {
            user_id: user.id,
            class_id: classId,
            status: 'APPROVED',
            created_at: new Date().toISOString(),
          },
        ])

      if (error) {
        if (error.message.includes('duplicate')) {
          throw new Error('Você já fez check-in para esta aula hoje')
        }
        throw error
      }
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao criar check-in:', error)
      throw error
    }
  }

  return createCheckin
}

