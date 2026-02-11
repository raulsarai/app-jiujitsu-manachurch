"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Clock, Loader2, UserIcon, Calendar } from "lucide-react";
import Image from "next/image";

export function DashboardScreen() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!authUser?.id) {
        console.log("❌ Sem UUID");
        setLoading(false);
        return;
      }

      try {
        console.log("🚀 Carregando para UUID:", authUser.id);

        // 1. Buscar check-ins direto pelo user_id (agora é profiles.id)
        const { data: checkinsData } = await supabase
          .from("check_ins")
          .select("*")
          .eq("user_id", authUser.id.toString());

        console.log("✅ Check-ins:", checkinsData?.length || 0);
        setCheckins(checkinsData || []);

        // 2. Buscar classes de hoje
        const today = new Date();
        const dayOfWeek = today.getDay();

        const dayMappings: Record<number, string[]> = {
          0: ["Domingo"],
          1: ["Segunda", "Segunda-feira"],
          2: ["Terça", "Terça-feira"],
          3: ["Quarta", "Quarta-feira"],
          4: ["Quinta", "Quinta-feira"],
          5: ["Sexta", "Sexta-feira"],
          6: ["Sábado"],
        };

        const possibleDays = dayMappings[dayOfWeek];

        const { data: allClasses, error: classError } = await supabase
          .from("classes")
          .select("*")
          .eq("is_active", true);

        console.log("❌ Erro classes:", classError);
        console.log("✅ Todas as aulas:", allClasses?.length);
        console.log("📋 Classes data:", allClasses);
        const classesFilter =
          allClasses?.filter((cls) => {
            if (!cls.day_of_week) return false;
            const dayLower = cls.day_of_week.toLowerCase();
            return possibleDays.some((day) =>
              dayLower.includes(day.toLowerCase()),
            );
          }) || [];

        console.log("🏫 Aulas de hoje:", classesFilter.length);
        setClasses(classesFilter);
      } catch (error) {
        console.error("❌ Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authUser?.id]);

  const stats = useMemo(() => {
    const total = checkins.filter((c) => c.status === "APPROVED").length;
    const thisMonth = checkins.filter((c) => {
      const date = new Date(c.created_at);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
    const meta = 50;
    const progresso = total % meta;
    return {
      total,
      mensal: thisMonth,
      restantes: meta - progresso,
      porcentagem: (progresso / meta) * 100,
    };
  }, [checkins]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="flex items-center gap-4 mb-6 pt-4">
        <Avatar className="h-16 w-16 border-2 border-red-600">
          <AvatarImage src={authUser?.avatar} className="object-cover" />
          <AvatarFallback className="bg-zinc-900 text-red-600 font-bold">
            {authUser?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{authUser?.name}</h1>
          <p className="text-red-600 text-[11px] font-bold uppercase">
            {authUser?.user_classification}
          </p>
        </div>
      </div>

      <div className="w-full mb-6 flex flex-col items-center">
        <div className="relative w-full max-w-[720px] h-40 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
          <Image
            src="https://bjjfanatics.com.br/cdn/shop/articles/faixxa_1024x1024.jpg?v=1547833767"
            alt="Faixa"
            fill
            className="object-cover opacity-90"
            unoptimized
          />
        </div>
        <p className="text-center text-lg font-black uppercase italic mt-3">
          Faixa {authUser?.belt} - {authUser?.degree}º Grau
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <span className="text-xs font-black uppercase">
              Próxima Graduação
            </span>
          </div>
          <span className="text-[10px] text-zinc-500">
            {stats.total} treinos
          </span>
        </div>
        <p className="text-3xl font-black mb-4">{stats.restantes} aulas</p>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-red-600 h-full"
            style={{ width: `${Math.min(stats.porcentagem, 100)}%` }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 uppercase font-black">
            Este Mês
          </p>
          <p className="text-2xl font-bold text-red-600">{stats.mensal}</p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 uppercase font-black">
            Total
          </p>
          <p className="text-2xl font-bold text-green-500">{stats.total}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-red-600" /> Aulas de Hoje (
          {classes.length})
        </h2>
        {classes.length === 0 ? (
          <Card className="bg-zinc-900/30 border-dashed border-zinc-800 p-8 text-center">
            <p className="text-zinc-500">Nenhuma aula hoje</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className="bg-zinc-900 border-zinc-800 p-4 hover:border-red-600/50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{cls.name || cls.type}</h3>
                    <div className="text-[11px] text-zinc-500 mt-1">
                      ⏰ {cls.start_time}{" "}
                      {cls.instructor_name && `👨‍🏫 ${cls.instructor_name}`}
                    </div>
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700 h-8 text-xs px-3">
                    Check-in
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-3 bg-zinc-900/50 border border-zinc-800 rounded text-[10px] text-zinc-500">
        <p className="font-bold text-red-500 mb-2">🔍 DEBUG</p>
        <p>UUID: {authUser?.id}</p>
        <p>Nome: {authUser?.name}</p>
        <p>Check-ins: {checkins.length}</p>
        <p>Aulas hoje: {classes.length}</p>
      </div>
    </div>
  );
}
