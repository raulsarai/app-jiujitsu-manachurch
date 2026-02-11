'use client'

import { useAuth } from '@/lib/auth-context'
import { useStudent, useStudentByUserId } from '@/hooks/use-students'
import { useCheckins } from '@/hooks/use-checkins'
import { useClasses } from '@/hooks/use-classes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, Award, Clock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function DashboardScreen() {
  const { user } = useAuth()
  const { classes } = useClasses()
  const { checkins, isLoading: checkinsLoading } = useCheckins()
  
  // Buscar dados do estudante pelo user_id
  const { student, isLoading: studentLoading } = useStudentByUserId(user?.id || null)


  if (studentLoading || checkinsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Calcular estatísticas
  const totalCheckins = checkins?.length || 0
  const thisMonthCheckins = checkins?.filter((c: any) => {
    const checkinDate = new Date(c.created_at)
    const now = new Date()
    return checkinDate.getMonth() === now.getMonth() && 
           checkinDate.getFullYear() === now.getFullYear()
  }).length || 0

  // Próximas aulas (hoje)
  const today = format(new Date(), 'EEEE', { locale: ptBR })
const todayClasses = classes?.filter((c: any) => 
  c.day_of_week?.toLowerCase().includes(today.toLowerCase()) // ✅ Corrigido
) || []

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Olá, {student?.name?.split(' ')[0] || 'Atleta'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de treinamento
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-ins este mês</p>
              <p className="text-2xl font-bold">{thisMonthCheckins}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de treinos</p>
              <p className="text-2xl font-bold">{totalCheckins}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${student?.belt?.color}33` }}
            >
              <Award className="h-6 w-6" style={{ color: student?.belt?.color }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seu cinto</p>
              <p className="text-2xl font-bold">{student?.belt?.name || 'Não definido'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Aulas de Hoje */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Aulas de Hoje</h2>
        {todayClasses.length === 0 ? (
          <Card className="p-6 text-center">
            <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma aula programada para hoje</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {todayClasses.map((classData: any) => (
              <Card key={classData.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{classData.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Instrutor: {classData.instructor_name}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{classData.start_time}</span>
                      <span className="text-muted-foreground">
                        • {classData.duration_minutes} min
                      </span>
                    </div>
                  </div>
                  <Button size="sm">
                    Check-in
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Últimos Check-ins */}
      <div>
        <h2 className="text-xl font-bold mb-4">Últimos Check-ins</h2>
        {checkins?.length === 0 ? (
          <Card className="p-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Você ainda não fez nenhum check-in</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {checkins?.slice(0, 5).map((checkin: any) => (
              <Card key={checkin.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{checkin.class?.name || 'Treino livre'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(checkin.created_at), "dd 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      checkin.status === 'APPROVED'
                        ? 'bg-green-500/20 text-green-500'
                        : checkin.status === 'REJECTED'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {checkin.status === 'APPROVED'
                      ? 'Aprovado'
                      : checkin.status === 'REJECTED'
                      ? 'Rejeitado'
                      : 'Pendente'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
