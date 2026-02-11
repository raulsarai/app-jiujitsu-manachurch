'use client'

import { useState } from 'react'
import { useBelts, useUpdateBelt, usePromoteStudent } from '@/hooks/use-belts'
import { useStudents } from '@/hooks/use-students'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, Award, Loader2 } from 'lucide-react'

export function AdminBelts() {
  const { belts, isLoading, isError, mutate } = useBelts()
  const { students } = useStudents()
  const updateBelt = useUpdateBelt()
  const promoteStudent = usePromoteStudent()

  const [editingBelt, setEditingBelt] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPromoting, setIsPromoting] = useState(false)
  const [promotionData, setPromotionData] = useState({
    student_id: '',
    to_belt_id: '',
    notes: '',
  })

  const handleUpdateBelt = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateBelt(editingBelt.id, {
        min_training_days: editingBelt.min_training_days,
      })
      
      toast.success('Cinto atualizado com sucesso!')
      mutate()
      setEditingBelt(null)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar cinto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await promoteStudent({
        student_id: parseInt(promotionData.student_id),
        to_belt_id: parseInt(promotionData.to_belt_id),
        notes: promotionData.notes,
      })
      
      toast.success('Estudante promovido com sucesso!')
      setIsPromoting(false)
      setPromotionData({ student_id: '', to_belt_id: '', notes: '' })
      // Revalidar estudantes para atualizar cintos
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao promover estudante')
    } finally {
      setIsSubmitting(false)
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
        <p className="text-red-500">Erro ao carregar cintos</p>
        <Button onClick={() => mutate()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Cintos</h2>
        <Dialog open={isPromoting} onOpenChange={setIsPromoting}>
          <DialogTrigger asChild>
            <Button>
              <Award className="h-4 w-4 mr-2" />
              Promover Estudante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promover Estudante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePromote} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Estudante</label>
                <Select
                  value={promotionData.student_id}
                  onValueChange={(value) =>
                    setPromotionData({ ...promotionData, student_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estudante" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student: any) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} - {student.belt?.name || 'Sem cinto'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Novo Cinto</label>
                <Select
                  value={promotionData.to_belt_id}
                  onValueChange={(value) =>
                    setPromotionData({ ...promotionData, to_belt_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cinto" />
                  </SelectTrigger>
                  <SelectContent>
                    {belts?.map((belt: any) => (
                      <SelectItem key={belt.id} value={belt.id.toString()}>
                        {belt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Observações (opcional)</label>
                <Input
                  value={promotionData.notes}
                  onChange={(e) =>
                    setPromotionData({ ...promotionData, notes: e.target.value })
                  }
                  placeholder="Motivo da promoção..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Promovendo...' : 'Promover'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPromoting(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Dias Mínimos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {belts?.map((belt: any) => (
              <TableRow key={belt.id}>
                <TableCell>{belt.order_number}</TableCell>
                <TableCell className="font-medium">{belt.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: belt.color }}
                    />
                    {belt.color}
                  </div>
                </TableCell>
                <TableCell>
                  {belt.min_training_days || 0} dias
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBelt(belt)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Requisitos - {belt.name}</DialogTitle>
                      </DialogHeader>
                      {editingBelt && (
                        <form onSubmit={handleUpdateBelt} className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Dias Mínimos de Treinamento
                            </label>
                            <Input
                              type="number"
                              value={editingBelt.min_training_days || 0}
                              onChange={(e) =>
                                setEditingBelt({
                                  ...editingBelt,
                                  min_training_days: parseInt(e.target.value),
                                })
                              }
                              min={0}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingBelt(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
