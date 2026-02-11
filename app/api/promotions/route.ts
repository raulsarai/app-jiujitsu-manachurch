import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createPromotionSchema } from '@/lib/validations/promotion'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apenas admin pode promover
    const { data: isAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createPromotionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Buscar estudante e cinto atual
    const { data: student } = await supabase
      .from('students')
      .select('belt_id')
      .eq('id', validation.data.student_id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Criar registro de promoção na tabela student_progress
    const { data: promotion, error: promotionError } = await supabase
      .from('student_progress')
      .insert({
        student_id: validation.data.student_id,
        from_belt_id: student.belt_id,
        to_belt_id: validation.data.to_belt_id,
        promotion_date: new Date().toISOString().split('T')[0], // apenas data
        status: 'APPROVED',
        notes: validation.data.notes,
      })
      .select()
      .single()

    if (promotionError) {
      console.error('Error creating promotion:', promotionError)
      return NextResponse.json({ error: promotionError.message }, { status: 500 })
    }

    // Atualizar cinto do estudante
    const { error: updateError } = await supabase
      .from('students')
      .update({ 
        belt_id: validation.data.to_belt_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validation.data.student_id)

    if (updateError) {
      console.error('Error updating student belt:', updateError)
      // Rollback da promoção se falhar
      await supabase
        .from('student_progress')
        .delete()
        .eq('id', promotion.id)
      
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('student_progress')
      .select(`
        *,
        student:student_id (
          id,
          name,
          email
        ),
        from_belt:from_belt_id (
          name,
          color
        ),
        to_belt:to_belt_id (
          name,
          color
        )
      `)
      .order('promotion_date', { ascending: false })

    // Filtro por estudante específico
    const studentId = searchParams.get('student_id')
    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data: promotions, error } = await query

    if (error) {
      console.error('Error fetching promotions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
