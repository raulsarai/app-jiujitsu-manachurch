import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Se tem user_id no query, buscar esse estudante específico
    if (userId) {
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          belt:belt_id (
            id,
            name,
            color,
            order_number
          )
        `)
        .eq('user_id', userId)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json([student]) // Retorna como array
    }

    // Senão, verificar se é admin e listar todos
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!adminData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        belt:belt_id (
          id,
          name,
          color,
          order_number
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(students)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

