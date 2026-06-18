"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  FileBarChart2,
  Users,
  Settings,
} from "lucide-react";

import {
  useAuth,
} from "@/contexts/auth-context";

export default function AppSidebar() {
  const router = useRouter();

  const { user } =
    useAuth();

  const menu = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Clientes",
      href: "/dashboard/clients",
      icon: Building2,
    },
    {
      label: "Auditorías",
      href: "/dashboard/audits",
      icon: ClipboardList,
    },
    {
      label: "Reportes",
      href: "/dashboard/reports",
      icon: FileBarChart2,
    },
  ];

  if (
    user?.role ===
    "SUPER_ADMIN"
  ) {
    menu.push({
      label: "Usuarios",
      href: "/dashboard/users",
      icon: Users,
    });
  }

  menu.push({
    label: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  });

  const handleLogout = async () => {
    try {
      await signOut();

      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside className="relative w-64 bg-slate-950 text-white h-screen border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">
          HMSoft
        </h1>

        <p className="text-sm text-slate-400">
          Kardex Audit
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const Icon =
            item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
            >
              <Icon size={18} />

              <span>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={
            handleLogout
          }
          className="w-full bg-red-600 hover:bg-red-700 rounded-lg px-4 py-3 text-sm transition"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}