"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, User, Mail, Phone, Calendar, LogOut, Camera, ShieldCheck, Award } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ProfileScreen() {
  const { user, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    birth_date: '',
    whatsapp: '',
    guardian_name: '',
    belt: '',
    degree: '',
    avatar_url: '',
    user_classification: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        
        setProfile(data)
        setFormData({
          full_name: data?.full_name || '',
          phone_number: data?.phone_number || '',
          birth_date: data?.birth_date || '',
          whatsapp: data?.whatsapp || '',
          guardian_name: data?.guardian_name || '',
          belt: data?.belt || 'Branca',
          degree: data?.degree || '0',
          avatar_url: data?.avatar_url || '',
          user_classification: data?.user_classification || 'Adulto'
        })
      } catch (error) {
        toast.error('Erro ao carregar perfil')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [user?.id])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    try {
      setIsSubmitting(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Foto atualizada!')
    } catch (error) {
      toast.error('Erro no upload')
    } finally {
      setIsSubmitting(false)
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  try {
    // Atualiza a tabela profiles. A Trigger no banco cuidará da tabela students.
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        whatsapp: formData.whatsapp,
        birth_date: formData.birth_date,
        guardian_name: formData.guardian_name,
        user_classification: formData.user_classification,
        phone_number: formData.phone_number // Mantenha o nome exato da coluna
      })
      .eq('id', user?.id)

    if (error) throw error
    
    setProfile({ ...profile, ...formData })
    toast.success('Perfil e registro de atleta sincronizados!')
    setIsEditing(false)
  } catch (error: any) {
    toast.error('Erro na sincronização: ' + error.message)
  } finally {
    setIsSubmitting(false)
  }
}

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Visual */}
        <div className="relative flex flex-col items-center pt-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-zinc-800 shadow-2xl">
              <AvatarImage src={formData.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-zinc-900 text-4xl text-red-600 font-bold">
                {formData.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()} 
              className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition-colors"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">{formData.full_name || 'Usuário'}</h2>
          <p className="text-zinc-500 font-medium">{profile?.email}</p>
        </div>

        {/* Info de Graduação (Bloqueado) */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 p-4 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-zinc-500" />
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Faixa Atual</p>
            </div>
            <p className="text-lg font-bold text-red-600 tracking-tight">{formData.belt}</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-zinc-500" />
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Graduação</p>
            </div>
            <p className="text-lg font-bold text-red-600 tracking-tight">{formData.degree}º Grau</p>
          </Card>
        </div>

        {/* Formulário Principal */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seletor de Perfil (Adulto/Infantil) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Perfil de Conta</Label>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setFormData({...formData, user_classification: 'Adulto'})}
                  className={`flex-1 h-12 rounded-full border transition-all ${
                    formData.user_classification === 'Adulto' 
                    ? "bg-transparent border-red-600 text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]" 
                    : "bg-transparent border-zinc-800 text-zinc-500"
                  }`}
                >
                  Adulto
                </Button>
                <Button 
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setFormData({...formData, user_classification: 'Infantil'})}
                  className={`flex-1 h-12 rounded-full border transition-all ${
                    formData.user_classification === 'Infantil' 
                    ? "bg-transparent border-red-600 text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]" 
                    : "bg-transparent border-zinc-800 text-zinc-500"
                  }`}
                >
                  Infantil
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-bold flex items-center gap-2">
                  <User className="h-3 w-3" /> Nome Completo
                </Label>
                <Input 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  disabled={!isEditing}
                  className="bg-zinc-800 border-zinc-700 focus:border-red-600 h-11"
                />
              </div>

              {/* Email - Bloqueado */}
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-bold flex items-center gap-2">
                  <Mail className="h-3 w-3" /> E-mail (Não editável)
                </Label>
                <Input value={profile?.email || ''} disabled className="bg-zinc-950 border-zinc-800 text-zinc-500 h-11 cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-bold flex items-center gap-2">
                  <Phone className="h-3 w-3" /> WhatsApp
                </Label>
                <Input 
                  value={formData.whatsapp} 
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  disabled={!isEditing}
                  placeholder="(00) 00000-0000"
                  className="bg-zinc-800 border-zinc-700 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-bold flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Telefone Adicional
                </Label>
                <Input 
                  value={formData.phone_number} 
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  disabled={!isEditing}
                  placeholder="(00) 00000-0000"
                  className="bg-zinc-800 border-zinc-700 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-bold flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Nascimento
                </Label>
                <Input 
                  type="date"
                  value={formData.birth_date} 
                  onChange={e => setFormData({...formData, birth_date: e.target.value})}
                  disabled={!isEditing}
                  className="bg-zinc-800 border-zinc-700 h-11"
                />
              </div>

              {/* Responsável (Condicional) */}
              {formData.user_classification === 'Infantil' && (
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase font-bold flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Nome do Responsável
                  </Label>
                  <Input 
                    value={formData.guardian_name} 
                    onChange={e => setFormData({...formData, guardian_name: e.target.value})}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 h-11"
                  />
                </div>
              )}
            </div>

            {/* Botões de Ação Corrigidos */}
            <div className="pt-4 flex gap-3">
              {!isEditing ? (
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault(); // Prevenção extra
                    setIsEditing(true);
                  }} 
                  className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase py-6"
                >
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700 font-bold uppercase py-6">
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Salvar Alterações'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 border-zinc-700 text-zinc-400 py-6 font-bold uppercase">
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </form>
        </Card>

        {/* Informações da Conta */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Informações da Conta</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
              <span className="text-zinc-500">Membro desde</span>
              <span className="font-bold text-zinc-300">
                {profile?.created_at ? format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Button variant="ghost" onClick={() => logout()} className="w-full text-zinc-600 hover:text-red-500 hover:bg-red-500/10 py-8 mb-10">
          <LogOut className="h-4 w-4 mr-2" />
          Sair do Aplicativo
        </Button>
      </div>
    </div>
  )
}