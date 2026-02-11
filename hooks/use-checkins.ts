'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

interface CheckinFilters {
  class_id?: string
  status?: string
  start_date?: string
  end_date?: string
}

export function useCheckins(filters?: CheckinFilters) {
  const params = new URLSearchParams()
  if (filters?.class_id) params.append('class_id', filters.class_id)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.start_date) params.append('start_date', filters.start_date)
  if (filters?.end_date) params.append('end_date', filters.end_date)

  const url = `/api/checkins${params.toString() ? `?${params.toString()}` : ''}`
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  return {
    checkins: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCreateCheckin() {
  return async (classId: string) => {
    const response = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create checkin')
    }
    
    return response.json()
  }
}

export function useApproveCheckin() {
  return async (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    const response = await fetch(`/api/checkins/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update checkin')
    }
    
    return response.json()
  }
}

export function useDeleteCheckin() {
  return async (id: string) => {
    const response = await fetch(`/api/checkins/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete checkin')
    }
    
    return response.json()
  }
}
