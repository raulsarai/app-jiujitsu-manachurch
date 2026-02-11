'use client'

import { useState } from 'react'
import { useCheckins, useApproveCheckin } from '@/hooks/use-checkins'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function AdminCheckins() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { checkins, isLoading, isError, mutate } = useCheckins()
  const approveCheckin = useApproveCheckin()

  // Filtrar localmente
  const filteredCheckins = statusFilter === 'all' 
    ? checkins 
    : checkins?.filter((c: any) => c.status === statusFilter)

  const handleApprove = async (id: string) => {
    try {
      await approveCheckin(id, 'APPROVED')
      toast.success('Check-in aprovado!')
      mutate()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar check-in')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await approveCheckin(id, 'REJECTED')
      toast.success('Check-in rejeitado!')
      mutate()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao rejeitar check-in')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar check-ins</p>
        <Button onClick={() => mutate()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Check-ins</h2>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="APPROVED">Aprovados</SelectItem>
            <SelectItem value="REJECTED">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCheckins?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum check-in encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredCheckins?.map((checkin: any) => (
                <TableRow key={checkin.id}>
                  <TableCell>
                    {format(new Date(checkin.created_at), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(checkin.created_at), 'HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{checkin.name || 'Sem nome'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
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
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {checkin.status === 'PENDING' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(checkin.id)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(checkin.id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
