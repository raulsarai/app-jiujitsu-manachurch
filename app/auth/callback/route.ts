import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('🔄 Callback recebido, code:', code ? 'sim' : 'não')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('🔐 Exchange result:', { user: data?.user?.email, error })
  }

  // Redirecionar para home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
