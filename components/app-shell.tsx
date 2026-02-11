"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/login-screen";
import { DashboardScreen } from "@/components/dashboard-screen";
import { ScheduleScreen } from "@/components/schedule-screen";
import { EvolutionScreen } from "@/components/evolution-screen";
import { ProfileScreen } from "@/components/profile-screen";
import { BottomNav } from "@/components/bottom-nav";
import { useState } from "react";
import { AdminDashboard } from "./admin/admin-dashboard";

type Screen = "dashboard" | "schedule" | "evolution" | "profile";

export function AppShell() {
  const { user, isAuthenticated, role, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");

  // OBRIGATÓRIO: Impede que o LoginScreen apareça por 1 segundo enquanto o Supabase checa o cookie
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }



  // 3. Interface do estudante (Baseado no Role vindo do banco/e-mail)
  if (role === "STUDENT") {
    return (
      <div className="min-h-screen pb-20 bg-black text-white">
        {currentScreen === "dashboard" && <DashboardScreen />}
        {currentScreen === "schedule" && <ScheduleScreen />}
        {currentScreen === "evolution" && <EvolutionScreen />}
        {currentScreen === "profile" && <ProfileScreen />}
        
        <BottomNav currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
      </div>
    );
  }

  // 4. Interface Admin (Chama o AdminDashboard que você criou do zero)
  if (role === "ADMIN" || role === "INSTRUCTOR") {
    return <AdminDashboard />;
  }

  return null;
}