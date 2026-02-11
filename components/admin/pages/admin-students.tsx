'use client'

import { useState } from 'react'
import { useStudents, useUpdateStudent, useDeleteStudent } from '@/hooks/use-students'
import { useBelts } from '@/hooks/use-belts'
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
import { Pencil, Trash2, Loader2 } from 'lucide-react'

export function AdminStudents() {
  const { students, isLoading, isError, mutate } = useStudents()
  const { belts } = useBelts()
  const updateStudent = useUpdateStudent()
  const deleteStudent = useDeleteStudent()

  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateStudent(editingStudent.id, {
        name: editingStudent.name,
        phone: editingStudent.phone,
        belt_id: editingStudent.belt_id,
        status: editingStudent.status,
      })
      
      toast.success('Estudante atualizado com sucesso!')
      mutate() // Revalidar cache
      setEditingStudent(null)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar estudante')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar ${name}?`)) return

    try {
      await deleteStudent(id)
      toast.success('Estudante deletado com sucesso!')
      mutate()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar estudante')
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
        <p className="text-red-500">Erro ao carregar estudantes</p>
        <Button onClick={() => mutate()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  const filteredStudents = students?.filter((student: any) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Estudantes</h2>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cinto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum estudante encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents?.map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone || '-'}</TableCell>
                  <TableCell>
                    <span
                      className="px-2 py-1 rounded text-sm"
                      style={{ backgroundColor: student.belt?.color }}
                    >
                      {student.belt?.name || 'Não definido'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        student.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}
                    >
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStudent(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Estudante</DialogTitle>
                        </DialogHeader>
                        {editingStudent && (
                          <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Nome</label>
                              <Input
                                value={editingStudent.name}
                                onChange={(e) =>
                                  setEditingStudent({
                                    ...editingStudent,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Telefone</label>
                              <Input
                                value={editingStudent.phone || ''}
                                onChange={(e) =>
                                  setEditingStudent({
                                    ...editingStudent,
                                    phone: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Cinto</label>
                              <Select
                                value={editingStudent.belt_id?.toString()}
                                onValueChange={(value) =>
                                  setEditingStudent({
                                    ...editingStudent,
                                    belt_id: parseInt(value),
                                  })
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
                              <label className="text-sm font-medium">Status</label>
                              <Select
                                value={editingStudent.status}
                                onValueChange={(value) =>
                                  setEditingStudent({
                                    ...editingStudent,
                                    status: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                                  <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar'}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingStudent(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(student.id, student.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
