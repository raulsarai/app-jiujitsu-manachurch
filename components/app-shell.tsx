"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/login-screen";
import { RegisterScreen } from "@/components/register-screen";
import { DashboardScreen } from "@/components/dashboard-screen";
import { ScheduleScreen } from "@/components/schedule-screen";
import { EvolutionScreen } from "@/components/evolution-screen";
import { ProfileScreen } from "@/components/profile-screen";
import { BottomNav } from "@/components/bottom-nav";
import { AdminDashboard } from "./admin/admin-dashboard";
import { useState } from "react";

type Screen = "dashboard" | "schedule" | "evolution" | "profile";
type AuthMode = "login" | "register";

export function AppShell() {
  const { user, isAuthenticated, role, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  // Se não estiver logado, alterna entre Login e Registro
  if (!isAuthenticated || !user) {
    return authMode === "login" ? (
      <LoginScreen onNavigateToRegister={() => setAuthMode("register")} />
    ) : (
      <RegisterScreen onNavigateToLogin={() => setAuthMode("login")} />
    );
  }

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

  if (role === "ADMIN" || role === "INSTRUCTOR") {
    return <AdminDashboard />;
  }

  return null;
}