import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createBeltSchema } from '@/lib/validations/belt'

export async function GET() {
  const supabase = await createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar todos os cintos ordenados
    const { data: belts, error } = await supabase
      .from('belts')
      .select('*')
      .order('order_number')

    if (error) {
      console.error('Error fetching belts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(belts)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apenas admin pode criar cintos
    const { data: isAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createBeltSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { data: belt, error } = await supabase
      .from('belts')
      .insert(validation.data)
      .select()
      .single()

    if (error) {
      console.error('Error creating belt:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(belt, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
