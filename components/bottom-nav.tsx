"use client"

import { Home, Calendar, TrendingUp, User } from "lucide-react"

export type Screen = "dashboard" | "schedule" | "evolution" | "profile"

interface BottomNavProps {
  currentScreen: Screen // ✅ Corrigido
  onScreenChange: (screen: Screen) => void
}

const navItems: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Início", icon: Home },
  { id: "schedule", label: "Horários", icon: Calendar },
  { id: "evolution", label: "Evolução", icon: TrendingUp },
  { id: "profile", label: "Perfil", icon: User },
]

export function BottomNav({ currentScreen, onScreenChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
