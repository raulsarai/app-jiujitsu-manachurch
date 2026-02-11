'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useStudent, useStudentByUserId, useUpdateStudent } from '@/hooks/use-students'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, User, Mail, Phone, Calendar, Award, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ProfileScreen() {
  const { user, logout } = useAuth()
const { student, isLoading, mutate } = useStudentByUserId(user?.id || null)  
const updateStudent = useUpdateStudent()

  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthdate: '',
  })

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        phone: student.phone || '',
        birthdate: student.birthdate || '',
      })
    }
  }, [student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateStudent(student.id, formData)
      toast.success('Perfil atualizado com sucesso!')
      mutate()
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('Tem certeza que deseja sair?')) return
    
    try {
      await logout()
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Avatar */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student?.profile_image} />
              <AvatarFallback className="text-2xl">
                {student?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{student?.name}</h2>
              <p className="text-muted-foreground">{student?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${student?.belt?.color}33`,
                    color: student?.belt?.color 
                  }}
                >
                  <Award className="h-4 w-4 inline mr-1" />
                  {student?.belt?.name || 'Sem cinto'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <Label htmlFor="name">
                  <User className="h-4 w-4 inline mr-2" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={student?.email || ''}
                  disabled
                  className="mt-1"
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="(00) 00000-0000"
                  className="mt-1"
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <Label htmlFor="birthdate">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Data de Nascimento
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          name: student?.name || '',
                          phone: student?.phone || '',
                          birthdate: student?.birthdate || '',
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </Card>

        {/* Informações da Conta */}
        <Card className="p-6 mb-6">
          <h3 className="font-bold mb-4">Informações da Conta</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{student?.status || 'Ativo'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membro desde</span>
              <span className="font-medium">
                {student?.created_at
                  ? format(new Date(student.created_at), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })
                  : '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </div>
  )
}
