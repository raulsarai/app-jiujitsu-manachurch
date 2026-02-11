import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('🔐 Callback recebido:', { code: code ? 'sim' : 'não', error, errorDescription })

  // Handle errors from OAuth provider
  if (error) {
    console.error('❌ OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  if (code) {
    try {
      const supabase = await createClient()
      
      console.log('🔄 Trocando código por sessão...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('❌ Erro ao trocar código:', exchangeError)
        return NextResponse.redirect(
          new URL('/?error=auth_error', requestUrl.origin)
        )
      }

      console.log('✅ Sessão criada para:', data?.user?.email)
      
      // Redirecionar com sucesso
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    } catch (error) {
      console.error('❌ Erro no callback:', error)
      return NextResponse.redirect(
        new URL('/?error=callback_error', requestUrl.origin)
      )
    }
  }

  // Sem code e sem error = URL inválida
  return NextResponse.redirect(new URL('/?error=no_code', requestUrl.origin))
}
