"use client";

import { useState } from "react";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "@/hooks/use-classes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

export function AdminClasses() {
  const { classes, isLoading, isError, mutate } = useClasses();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [editingClass, setEditingClass] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    instructor_name: "",
    day_of_week: "", // ✅ Corrigido
    start_time: "", // ✅ Corrigido
    duration_minutes: 60,
    max_students: null,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createClass(newClass);
      toast.success("Aula criada com sucesso!");
      mutate();
      setIsCreating(false);
      setNewClass({
        name: "",
        instructor_name: "",
        day_of_week: "", // ✅ Corrigido
        start_time: "", // ✅ Corrigido
        duration_minutes: 60,
        max_students: null,
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar aula");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateClass(editingClass.id, {
        name: editingClass.name,
        instructor_name: editingClass.instructor_name,
        day_of_week: editingClass.day_of_week, // ✅ Corrigido
        start_time: editingClass.start_time, // ✅ Corrigido
        duration_minutes: editingClass.duration_minutes,
        max_students: editingClass.max_students,
      });

      toast.success("Aula atualizada com sucesso!");
      mutate();
      setEditingClass(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar aula");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar a aula ${name}?`)) return;

    try {
      await deleteClass(id);
      toast.success("Aula deletada com sucesso!");
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar aula");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar aulas</p>
        <Button onClick={() => mutate()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Aulas</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Aula</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Aula</label>
                <Input
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                  placeholder="Ex: Gi Fundamentals"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Instrutor</label>
                <Input
                  value={newClass.instructor_name}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      instructor_name: e.target.value,
                    })
                  }
                  placeholder="Nome do instrutor"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dia da Semana</label>
                <Input
                  value={newClass.day_of_week} // ✅ Corrigido
                  onChange={
                    (e) =>
                      setNewClass({ ...newClass, day_of_week: e.target.value }) // ✅ Corrigido
                  }
                  placeholder="Ex: Segunda-feira"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Horário Inicial</label>
                <Input
                  type="time"
                  value={newClass.start_time} // ✅ Corrigido
                  onChange={
                    (e) =>
                      setNewClass({ ...newClass, start_time: e.target.value }) // ✅ Corrigido
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duração (minutos)</label>
                <Input
                  type="number"
                  value={newClass.duration_minutes}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      duration_minutes: parseInt(e.target.value),
                    })
                  }
                  min={30}
                  max={180}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
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
              <TableHead>Nome</TableHead>
              <TableHead>Instrutor</TableHead>
              <TableHead>Dia</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhuma aula encontrada
                </TableCell>
              </TableRow>
            ) : (
              classes?.map((classData: any) => (
                <TableRow key={classData.id}>
                  <TableCell className="font-medium">
                    {classData.name}
                  </TableCell>
                  <TableCell>{classData.instructor_name}</TableCell>
                  <TableCell>{classData.day_of_week }</TableCell>
                  <TableCell>{classData.start_time}</TableCell>
                  <TableCell>{classData.duration_minutes} min</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingClass(classData)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Aula</DialogTitle>
                        </DialogHeader>
                        {editingClass && (
                          <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Nome
                              </label>
                              <Input
                                value={editingClass.name}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Instrutor
                              </label>
                              <Input
                                value={editingClass.instructor_name}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    instructor_name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Dia</label>
                              <Input
                                value={editingClass.schedule_day}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    schedule_day: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Horário
                              </label>
                              <Input
                                type="time"
                                value={editingClass.schedule_time}
                                onChange={(e) =>
                                  setEditingClass({
                                    ...editingClass,
                                    schedule_time: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Salvando..." : "Salvar"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingClass(null)}
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
                      onClick={() => handleDelete(classData.id, classData.name)}
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
  );
}
