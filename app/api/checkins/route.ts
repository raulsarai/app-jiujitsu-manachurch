import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createCheckinSchema } from '@/lib/validations/checkin'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('check_ins')
      .select(`
        *,
        class:class_id (
          id,
          name,
          day_of_week,
          start_time,
          instructor_name,
          duration_minutes
        )
      `)
      .order('created_at', { ascending: false })

    // Filtros opcionais
    const classId = searchParams.get('class_id')
    if (classId) {
      query = query.eq('class_id', classId)
    }

    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }

    const startDate = searchParams.get('start_date')
    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    const endDate = searchParams.get('end_date')
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: checkins, error } = await query

    if (error) {
      console.error('Error fetching checkins:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(checkins)
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

    const body = await request.json()
    const validation = createCheckinSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Verificar se já fez check-in hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: existingCheckin } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('class_id', validation.data.class_id)
      .gte('created_at', today.toISOString())
      .single()

    if (existingCheckin) {
      return NextResponse.json(
        { error: 'Check-in already exists for this class today' }, 
        { status: 409 }
      )
    }

    // Criar check-in
    const { data: checkin, error } = await supabase
      .from('check_ins')
      .insert({
        user_id: session.user.id,
        class_id: validation.data.class_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating checkin:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(checkin, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
