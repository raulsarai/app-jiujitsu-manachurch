"use client";

import { useClasses } from "@/hooks/use-classes";
import { useCreateCheckin } from "@/hooks/use-checkins";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Clock, User, CheckCircle } from "lucide-react";

const daysOfWeek = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

export function ScheduleScreen() {
  const { classes, isLoading, isError, mutate } = useClasses();
  const createCheckin = useCreateCheckin();

  const handleCheckin = async (classId: string, className: string) => {
    try {
      await createCheckin(classId);
      toast.success(`Check-in realizado para ${className}!`);
      mutate();
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        toast.error("Você já fez check-in para esta aula hoje");
      } else {
        toast.error(error.message || "Erro ao fazer check-in");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center py-8">
          <p className="text-red-500">Erro ao carregar horários</p>
          <Button onClick={() => mutate()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const daysOfWeek = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ];

  // Agrupar aulas por dia
  const classesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] =
      classes?.filter(
        (c: any) => c.day_of_week?.toLowerCase().includes(day.toLowerCase()), // ✅ Corrigido
      ) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Horários de Aulas</h1>
          <p className="text-muted-foreground">
            Confira a programação semanal e faça seu check-in
          </p>
        </div>

        {/* Aulas por dia */}
        <div className="space-y-6">
          {daysOfWeek.map((day) => {
            const dayClasses = classesByDay[day];

            if (dayClasses.length === 0) return null;

            return (
              <div key={day}>
                <h2 className="text-xl font-bold mb-3">{day}</h2>
                <div className="grid gap-3">
                  {dayClasses.map((classData: any) => (
                    <Card key={classData.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2">
                            {classData.name}
                          </h3>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>
                                Instrutor: {classData.instructor_name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {classData.start_time} •{" "}
                                {classData.duration_minutes} min
                              </span>
                            </div>

                            {classData.description && (
                              <p className="mt-2">{classData.description}</p>
                            )}

                            {classData.belt_level && (
                              <div className="mt-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                  {classData.belt_level}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() =>
                            handleCheckin(classData.id, classData.name)
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Check-in
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {classes?.length === 0 && (
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhuma aula disponível no momento
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
