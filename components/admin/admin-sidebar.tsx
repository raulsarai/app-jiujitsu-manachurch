"use client"

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  CalendarDays,
  Award,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export type AdminPage =
  | "home" // ✅ Mudado de "dashboard" para "home"
  | "students"
  | "belts"
  | "checkins"
  | "classes"
  | "promotions"
  | "instructors"
  | "reports"
  | "settings"

interface AdminSidebarProps {
  currentPage: AdminPage // ✅ Corrigido
  onPageChange: (page: AdminPage) => void
}

const navItems: { id: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard }, // ✅ Corrigido
  { id: "students", label: "Alunos", icon: Users },
  { id: "belts", label: "Cintos", icon: GraduationCap },
  { id: "checkins", label: "Check-ins", icon: ClipboardCheck },
  { id: "classes", label: "Aulas", icon: CalendarDays },
  { id: "promotions", label: "Promoções", icon: Award },
  { id: "instructors", label: "Instrutores", icon: UserCog },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "settings", label: "Configurações", icon: Settings },
]

export function AdminSidebar({
  currentPage, // ✅ Corrigido
  onPageChange,
}: AdminSidebarProps) {
  const { logout, user } = useAuth()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">🥋</span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Admin</h2>
          <p className="text-xs text-muted-foreground">Jiu-Jitsu App</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = currentPage === item.id // ✅ Corrigido
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-border px-3 py-4">
        {user && (
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-medium text-foreground">
              {user.email}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Sair da conta"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
