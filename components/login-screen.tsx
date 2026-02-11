"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface LoginScreenProps {
  onNavigateToRegister: () => void
}

export function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const { loginWithEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica local para evitar erros desnecessários de rede
    if (!email.includes("@") || !email.includes(".")) {
      return toast.error("Por favor, insira um e-mail válido.")
    }

    setLoading(true)
    try {
      await loginWithEmail(email, password)
      toast.success("Bem-vindo!")
    } catch (err: any) {
      // Tratamento para o erro de rate limit observado no log
      if (err.message?.includes("rate limit")) {
        toast.error("Muitas tentativas de login. Aguarde um pouco.")
      } else {
        toast.error(err.message || "E-mail ou senha inválidos.")
      }
      // O estado (email/password) não é resetado aqui para permitir correção rápida
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 bg-[url('/bg-red-texture.jpg')] bg-cover">
      <Card className="w-full max-w-md border-none bg-zinc-900/90 text-white backdrop-blur-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-700 flex items-center justify-center text-2xl shadow-lg shadow-red-900/50">
            🥋
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Jiu Jitsu | Maná Church
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                required
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 h-12 text-white focus-visible:ring-red-600 focus-visible:border-red-600"
              />
            </div>
            <div className="space-y-2">
              <Input
                required
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 h-12 text-white focus-visible:ring-red-600 focus-visible:border-red-600"
              />
            </div>
            <Button
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 h-12 uppercase font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="text-center text-sm text-zinc-400">
            Não tem uma conta?{" "}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-red-500 font-bold hover:underline transition-colors"
            >
              Cadastre-se aqui
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}