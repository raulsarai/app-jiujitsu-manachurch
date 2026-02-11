"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { X, Eye, EyeOff } from "lucide-react"

interface RegisterScreenProps {
  onNavigateToLogin: () => void
}

export function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const { signupWithEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    perfil: "Adulto",
    nome: "",
    email: "",
    password: "",
    dataNascimento: "",
    whatsapp: ""
  })

  // Máscara de WhatsApp: (00) 00000-0000
  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 11) {
      return digits
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15)
    }
    return value.substring(0, 15)
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setFormData({ ...formData, whatsapp: formatted })
  }

  // Validação em tempo real para habilitar o botão
  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const whatsappDigits = formData.whatsapp.replace(/\D/g, "")
    
    return (
      formData.nome.trim().length >= 3 &&
      emailRegex.test(formData.email) &&
      formData.password.length >= 6 &&
      whatsappDigits.length >= 10 && // Aceita fixo ou celular (mínimo DDD + 8 dígitos)
      formData.dataNascimento !== ""
    )
  }, [formData])

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!isFormValid) return

  setLoading(true)
  try {
    await signupWithEmail(formData.email, formData.password, {
      full_name: formData.nome,  // ✅ Correto
      whatsapp: formData.whatsapp,  // ✅ Correto
      birth_date: formData.dataNascimento,  // ✅ Correto (formato: "1991-11-01")
      user_classification: formData.perfil,  // ✅ Correto ("Adulto" ou "Infantil")
    })
    
    toast.success("Cadastro realizado com sucesso! Faça login para continuar.")
    onNavigateToLogin()
  } catch (err: any) {
    console.error("Erro detalhado:", err)
    if (err.message?.includes("rate limit")) {
      toast.error("Muitas tentativas. Por favor, aguarde alguns minutos.")
    } else if (err.message?.includes("Duplicate")) {
      toast.error("Este e-mail já está registrado.")
    } else {
      toast.error(err.message || "Erro ao realizar o cadastro.")
    }
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 bg-[url('/bg-red-texture.jpg')] bg-cover bg-center">
      <Card className="w-full max-w-lg border-none bg-[#121212] text-white backdrop-blur-md max-h-[95vh] overflow-y-auto shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 px-6 py-4">
          <CardTitle className="text-lg font-bold">Criar Conta</CardTitle>
          <button type="button" onClick={onNavigateToLogin} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Perfil */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold text-white">Perfil</Label>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Necessário</span>
              </div>
              <div className="flex gap-2">
                {["Adulto", "Infantil"].map((p) => (
                  <Button 
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, perfil: p})}
                    className={`flex-1 h-10 rounded-full border transition-all ${
                      formData.perfil === p 
                      ? "bg-transparent border-red-600 text-red-600 shadow-[0_0_8px_rgba(220,38,38,0.3)]" 
                      : "bg-transparent border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-white">Nome Completo</Label>
              <Input 
                required
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="bg-[#1A1A1A] border-zinc-800 h-11 text-white focus-visible:ring-1 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all" 
                placeholder="Ex: Raul Mauro Sarai" 
              />
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-white">E-mail</Label>
              <Input 
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-[#1A1A1A] border-zinc-800 h-11 text-white focus-visible:ring-1 focus-visible:ring-red-600" 
                placeholder="seu@email.com" 
              />
            </div>

            {/* Senha com Toggle de Visualização */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-white">Senha</Label>
              <div className="relative">
                <Input 
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-[#1A1A1A] border-zinc-800 h-11 text-white pr-10 focus-visible:ring-1 focus-visible:ring-red-600" 
                  placeholder="Mínimo 6 caracteres" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* WhatsApp e Nascimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-white">WhatsApp</Label>
                <Input 
                  required
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  className="bg-[#1A1A1A] border-zinc-800 h-11 text-white focus-visible:ring-1 focus-visible:ring-red-600" 
                  placeholder="(00) 00000-0000" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-white">Data Nascimento</Label>
                <Input 
                  required
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                  className="bg-[#1A1A1A] border-zinc-800 h-11 text-white focus-visible:ring-1 focus-visible:ring-red-600" 
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t border-zinc-800">
              <Button 
                type="button"
                variant="outline"
                onClick={onNavigateToLogin}
                className="flex-1 bg-[#262626] border-none text-white h-12 font-bold hover:bg-[#333333] transition-colors"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={loading || !isFormValid}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 font-bold uppercase transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}