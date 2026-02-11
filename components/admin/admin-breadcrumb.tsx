"use client"

import { ChevronRight, Home } from "lucide-react"

export type AdminPage =
  | "home"
  | "students"
  | "belts"
  | "checkins"
  | "classes"
  | "promotions"
  | "instructors"
  | "reports"
  | "settings"

interface AdminBreadcrumbProps {
  currentPage: AdminPage // ✅ Corrigido
  pageLabels: Record<AdminPage, string> // ✅ Corrigido
}

export function AdminBreadcrumb({ currentPage, pageLabels }: AdminBreadcrumbProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Home className="h-4 w-4 text-muted-foreground" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium text-foreground">
          {pageLabels[currentPage]} {/* ✅ Corrigido */}
        </span>
      </nav>
    </div>
  )
}
