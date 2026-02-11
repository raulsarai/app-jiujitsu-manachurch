"use client"

import { useAuth } from '@/lib/auth-context'
import { useStudentByUserId } from '@/hooks/use-students'
import { useCheckins } from '@/hooks/use-checkins'
import { usePromotions } from '@/hooks/use-belts'
import { Card } from '@/components/ui/card'
import { Loader2, TrendingUp, Award, Calendar, Target } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function EvolutionScreen() {
  const { user } = useAuth()
  const { student, isLoading: studentLoading } = useStudentByUserId(user?.id || null)
  const { checkins, isLoading: checkinsLoading } = useCheckins(user?.id)
  const { promotions, isLoading: promotionsLoading } = usePromotions(student?.id)

  if (studentLoading || checkinsLoading || promotionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  const totalCheckins = checkins?.length || 0
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

  const progress = (totalCheckins / 50) * 100

  const currentMonth = new Date()
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const checkinDates = new Set(
    checkins?.map((c: any) => format(new Date(c.created_at), 'yyyy-MM-dd')) || []
  )

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minha Evolução</h1>
          <p className="text-zinc-500">Acompanhe seu progresso no Jiu-Jitsu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Total de Treinos</h3>
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-4xl font-bold mb-2">{totalCheckins}</p>
            <p className="text-sm text-zinc-500">Check-ins realizados</p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Faixa Atual</h3>
              <Award className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-4xl font-bold mb-2">{student?.belt || 'Branca'}</p>
            <p className="text-sm text-zinc-500">Grau {student?.degree || 0}</p>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Progresso para Próximo Cinto</h3>
            <Target className="h-5 w-5 text-red-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{totalCheckins} treinos</span>
              <span>50 treinos necessários</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-red-600 h-full transition-all" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-zinc-500">{Math.min(Number(progress.toFixed(0)), 100)}% concluído</p>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
          <h3 className="font-bold mb-4">Check-ins nos Últimos 6 Meses</h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {last6Months.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-red-600/20 rounded-t relative transition-all"
                  style={{ 
                    height: `${Math.max((month.count / Math.max(...last6Months.map(m => m.count), 1)) * 100, 5)}%`,
                    minHeight: '20px'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">
                    {month.count}
                  </div>
                </div>
                <span className="text-xs mt-2 text-zinc-500">{month.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">
              Calendário - {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <Calendar className="h-5 w-5 text-red-600" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-bold text-zinc-500 p-2">
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
                    ${hasCheckin ? 'bg-red-600 text-white font-bold' : ''}
                    ${isToday && !hasCheckin ? 'border-2 border-red-600' : 'border border-zinc-800'}
                    ${!hasCheckin && !isToday ? 'text-zinc-500' : ''}
                  `}
                >
                  {format(day, 'd')}
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="font-bold mb-4">Histórico de Promoções</h3>
          {promotions?.length === 0 ? (
            <p className="text-center text-zinc-500 py-4">Nenhuma promoção registrada ainda</p>
          ) : (
            <div className="space-y-3">
              {promotions?.map((promotion: any) => (
                <div key={promotion.id} className="flex items-center justify-between p-4 border border-zinc-800 rounded">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-600" />
                      <span className="text-2xl">→</span>
                      <div className="w-8 h-8 rounded-full bg-red-700" />
                    </div>
                    <div>
                      <p className="font-medium">{promotion.from_belt?.name} → {promotion.to_belt?.name}</p>
                      <p className="text-sm text-zinc-500">
                        {format(new Date(promotion.promotion_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {promotion.notes && <p className="text-sm text-zinc-500 italic">{promotion.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
