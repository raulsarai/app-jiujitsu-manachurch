"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginScreen } from "@/components/login-screen"
import { DashboardScreen } from "@/components/dashboard-screen"
import { ScheduleScreen } from "@/components/schedule-screen"
import { EvolutionScreen } from "@/components/evolution-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { BottomNav } from "@/components/bottom-nav"
import { useState } from "react"

type Screen = "dashboard" | "schedule" | "evolution" | "profile"

export function AppShell() {
  const { user, isAuthenticated, isLoading, role } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard")

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Interface do estudante
  if (role === "STUDENT") {
    return (
      <div className="min-h-screen pb-20">
        {currentScreen === "dashboard" && <DashboardScreen />}
        {currentScreen === "schedule" && <ScheduleScreen />}
        {currentScreen === "evolution" && <EvolutionScreen />}
        {currentScreen === "profile" && <ProfileScreen />}
        
        <BottomNav currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
      </div>
    )
  }

  // TODO: Interface Admin/Instrutor
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Área Administrativa</h1>
      <p>Bem-vindo, {user?.name}</p>
      <p>Role: {role}</p>
    </div>
  )
}
