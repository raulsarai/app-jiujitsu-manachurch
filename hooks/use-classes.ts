'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export function useClasses() {
  const { data, error, isLoading, mutate } = useSWR('/api/classes', fetcher)

  return {
    classes: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useClass(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/classes/${id}` : null,
    fetcher
  )

  return {
    classData: data,
    isLoading,
    isError: error,
  }
}

export function useCreateClass() {
  return async (data: any) => {
    const response = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create class')
    }
    
    return response.json()
  }
}

export function useUpdateClass() {
  return async (id: string, data: any) => {
    const response = await fetch(`/api/classes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update class')
    }
    
    return response.json()
  }
}

export function useDeleteClass() {
  return async (id: string) => {
    const response = await fetch(`/api/classes/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete class')
    }
    
    return response.json()
  }
}
