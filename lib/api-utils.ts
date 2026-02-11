import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function validateAuth() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
      supabase,
    }
  }

  return { error: null, session, supabase }
}

export async function validateAdmin(supabase: any, userId: string) {
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .single()

  return !!adminData
}

export async function requireAdmin(supabase: any, userId: string) {
  const isAdmin = await validateAdmin(supabase, userId)
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  return null
}

export function handleError(error: any) {
  console.error('API Error:', error)
  
  if (error.code === '23505') {
    return NextResponse.json(
      { error: 'This record already exists' },
      { status: 409 }
    )
  }

  if (error.code === '23503') {
    return NextResponse.json(
      { error: 'Referenced record does not exist' },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: error.message || 'Internal server error' },
    { status: 500 }
  )
}
