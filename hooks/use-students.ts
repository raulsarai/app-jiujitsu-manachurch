'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

// ✅ ADICIONAR esta função
export function useStudents() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/students',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    students: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useStudent(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/students/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    student: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useStudentByUserId(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/students?user_id=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    student: data?.[0],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useUpdateStudent() {
  return async (id: string, data: any) => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update student')
    }
    
    return response.json()
  }
}

export function useDeleteStudent() {
  return async (id: string) => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete student')
    }
    
    return response.json()
  }
}
