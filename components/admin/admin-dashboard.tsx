"use client";

import { useState } from "react";
import { AdminSidebar, type AdminPage } from "./admin-sidebar";
import { AdminBreadcrumb } from "./admin-breadcrumb";
import { AdminHome } from "./pages/admin-home"; // ✅ Corrigido
import { AdminStudents } from "./pages/admin-students"; // ✅ Corrigido
import { AdminBelts } from "./pages/admin-belts"; // ✅ Corrigido
import { AdminCheckins } from "./pages/admin-checkins"; // ✅ Corrigido
import { AdminClasses } from "./pages/admin-classes"; // ✅ Corrigido
import { Toaster } from "@/components/ui/sonner";

const pageLabels: Record<AdminPage, string> = {
  home: "Dashboard",
  students: "Alunos",
  belts: "Cintos",
  checkins: "Check-ins",
  classes: "Aulas",
  promotions: "Promoções",
  instructors: "Instrutores",
  reports: "Relatórios",
  settings: "Configurações",
};

export function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<AdminPage>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <AdminHome />; // ✅ Corrigido
      case "students":
        return <AdminStudents />; // ✅ Corrigido
      case "belts":
        return <AdminBelts />; // ✅ Corrigido
      case "checkins":
        return <AdminCheckins />; // ✅ Corrigido
      case "classes":
        return <AdminClasses />; // ✅ Corrigido
      case "promotions":
        return <div className="p-6">Página de Promoções - Em desenvolvimento</div>;
      case "instructors":
        return <div className="p-6">Página de Instrutores - Em desenvolvimento</div>;
      case "reports":
        return <div className="p-6">Página de Relatórios - Em desenvolvimento</div>;
      case "settings":
        return <div className="p-6">Página de Configurações - Em desenvolvimento</div>;
      default:
        return <AdminHome />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminBreadcrumb currentPage={currentPage} pageLabels={pageLabels} />

        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
