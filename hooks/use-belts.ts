'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export function useBelts() {
  const { data, error, isLoading, mutate } = useSWR('/api/belts', fetcher)

  return {
    belts: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCreateBelt() {
  return async (data: any) => {
    const response = await fetch('/api/belts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create belt')
    }
    
    return response.json()
  }
}

export function useUpdateBelt() {
  return async (id: string, data: any) => {
    const response = await fetch(`/api/belts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update belt')
    }
    
    return response.json()
  }
}

export function usePromotions(studentId?: number) {
  const url = studentId 
    ? `/api/promotions?student_id=${studentId}`
    : '/api/promotions'
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  return {
    promotions: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePromoteStudent() {
  return async (data: { student_id: number; to_belt_id: number; notes?: string }) => {
    const response = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to promote student')
    }
    
    return response.json()
  }
}
