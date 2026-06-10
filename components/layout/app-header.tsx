"use client";

export default function DashboardHeader() {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="font-semibold text-slate-900">
          Dashboard
        </h1>
      </div>

      <div className="text-sm text-slate-500">
        franccesco.admin@hmsoft.pe
      </div>
    </header>
  );
}