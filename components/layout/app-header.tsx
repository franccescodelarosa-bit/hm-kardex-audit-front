"use client";

import {
  useAuth,
} from "@/contexts/auth-context";

export default function DashboardHeader() {
  const { user } =
    useAuth();

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="font-semibold text-slate-900">
          Bienvenido
        </h1>

        <p className="text-sm text-slate-500">
          HM Kardex Audit
        </p>
      </div>

      <div className="text-right">
        <div className="font-medium">
          {user?.full_name ??
            "Cargando..."}
        </div>

        <div className="text-xs text-slate-500">
          {user?.role}
        </div>
      </div>
    </header>
  );
}