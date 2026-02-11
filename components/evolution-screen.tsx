'use client'

import { useAuth } from '@/lib/auth-context'
import { useStudent, useStudentByUserId } from '@/hooks/use-students'
import { useCheckins } from '@/hooks/use-checkins'
import { usePromotions } from '@/hooks/use-belts'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, TrendingUp, Award, Calendar, Target } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function EvolutionScreen() {
  const { user } = useAuth()
const { student, isLoading: studentLoading } = useStudentByUserId(user?.id || null)
  const { checkins, isLoading: checkinsLoading } = useCheckins()
  const { promotions, isLoading: promotionsLoading } = usePromotions(student?.id)

  if (studentLoading || checkinsLoading || promotionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Calcular estatísticas
  const totalCheckins = checkins?.length || 0
  
  // Check-ins por mês (últimos 6 meses)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      month: format(date, 'MMM', { locale: ptBR }),
      count: checkins?.filter((c: any) => {
        const checkinDate = new Date(c.created_at)
        return (
          checkinDate.getMonth() === date.getMonth() &&
          checkinDate.getFullYear() === date.getFullYear()
        )
      }).length || 0,
    }
  }).reverse()

  // Progresso para próximo cinto
  const currentBeltDays = student?.belt?.min_training_days || 0
  const progress = currentBeltDays > 0 
    ? Math.min((totalCheckins / currentBeltDays) * 100, 100)
    : 0

  // Calendário do mês atual
  const currentMonth = new Date()
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const checkinDates = new Set(
    checkins?.map((c: any) => format(new Date(c.created_at), 'yyyy-MM-dd')) || []
  )

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minha Evolução</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso no Jiu-Jitsu
          </p>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Total de Treinos</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-4xl font-bold mb-2">{totalCheckins}</p>
            <p className="text-sm text-muted-foreground">
              Check-ins realizados
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Cinto Atual</h3>
              <Award className="h-5 w-5" style={{ color: student?.belt?.color }} />
            </div>
            <p className="text-4xl font-bold mb-2" style={{ color: student?.belt?.color }}>
              {student?.belt?.name || 'Não definido'}
            </p>
            <p className="text-sm text-muted-foreground">
              Faixa {student?.belt?.order_number || 0}
            </p>
          </Card>
        </div>

        {/* Progresso para Próximo Cinto */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Progresso para Próximo Cinto</h3>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{totalCheckins} treinos</span>
              <span>{currentBeltDays} treinos necessários</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {progress.toFixed(0)}% concluído
            </p>
          </div>
        </Card>

        {/* Check-ins por Mês */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold mb-4">Check-ins nos Últimos 6 Meses</h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {last6Months.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-primary/20 rounded-t relative" style={{ height: `${(month.count / Math.max(...last6Months.map(m => m.count))) * 100}%`, minHeight: '20px' }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">
                    {month.count}
                  </div>
                </div>
                <span className="text-xs mt-2 text-muted-foreground">
                  {month.month}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Calendário do Mês */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">
              Calendário - {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-bold text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const hasCheckin = checkinDates.has(dateStr)
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

              return (
                <div
                  key={dateStr}
                  className={`
                    aspect-square flex items-center justify-center rounded text-sm
                    ${hasCheckin ? 'bg-primary text-primary-foreground font-bold' : ''}
                    ${isToday && !hasCheckin ? 'border-2 border-primary' : ''}
                    ${!hasCheckin && !isToday ? 'text-muted-foreground' : ''}
                  `}
                >
                  {format(day, 'd')}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Histórico de Promoções */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">Histórico de Promoções</h3>
          {promotions?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma promoção registrada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {promotions?.map((promotion: any) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between p-4 border rounded"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: promotion.from_belt?.color }}
                      />
                      <span className="text-2xl">→</span>
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: promotion.to_belt?.color }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {promotion.from_belt?.name} → {promotion.to_belt?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(promotion.promotion_date), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  {promotion.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {promotion.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
