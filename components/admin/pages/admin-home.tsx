'use client'

import { useStudents } from '@/hooks/use-students'
import { useCheckins } from '@/hooks/use-checkins'
import { useClasses } from '@/hooks/use-classes'
import { Card } from '@/components/ui/card'
import { Users, CheckCircle, Calendar, TrendingUp, Loader2 } from 'lucide-react'
import { startOfMonth } from 'date-fns'

export function AdminHome() {
  const { students, isLoading: studentsLoading } = useStudents()
  const { checkins, isLoading: checkinsLoading } = useCheckins()
  const { classes, isLoading: classesLoading } = useClasses()

  if (studentsLoading || checkinsLoading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Calcular estatísticas
  const totalStudents = students?.length || 0
  const activeStudents = students?.filter((s: any) => s.status === 'ACTIVE').length || 0
  const totalClasses = classes?.length || 0
  
  // Check-ins deste mês
  const startOfCurrentMonth = startOfMonth(new Date())
  const monthlyCheckins = checkins?.filter((c: any) => 
    new Date(c.created_at) >= startOfCurrentMonth
  ).length || 0

  // Check-ins pendentes
  const pendingCheckins = checkins?.filter((c: any) => c.status === 'PENDING').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard Admin</h2>
        <p className="text-muted-foreground">
          Visão geral da academia
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Alunos</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeStudents} ativos
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-ins do Mês</p>
              <p className="text-2xl font-bold">{monthlyCheckins}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingCheckins} pendentes
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aulas Ativas</p>
              <p className="text-2xl font-bold">{totalClasses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média de Treinos</p>
              <p className="text-2xl font-bold">
                {totalStudents > 0 ? (monthlyCheckins / totalStudents).toFixed(1) : 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                por aluno/mês
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Check-ins Recentes</h3>
          <div className="space-y-3">
            {checkins?.slice(0, 5).map((checkin: any) => (
              <div key={checkin.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{checkin.class?.name || 'Treino livre'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(checkin.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    checkin.status === 'APPROVED'
                      ? 'bg-green-500/20 text-green-500'
                      : checkin.status === 'REJECTED'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}
                >
                  {checkin.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Próximas Aulas</h3>
          <div className="space-y-3">
            {classes?.slice(0, 5).map((classData: any) => (
              <div key={classData.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{classData.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {classData.schedule_day} às {classData.schedule_time}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {classData.instructor_name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
