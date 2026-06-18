"use client";

import {
  useAuth,
} from "@/contexts/auth-context";

export default function DashboardPage() {
  const { user } =
    useAuth();

  return (
    <div className="grid grid-cols-4 gap-6">

      <div className="col-span-4 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold">
          Bienvenido {user?.full_name}
        </h2>

        <p className="mt-2 text-slate-500">
          Rol:
          {" "}
          {user?.role}
        </p>
      </div>

    </div>
  );
}