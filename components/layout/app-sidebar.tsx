"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  FileBarChart2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

import {
  useAuth,
} from "@/contexts/auth-context";

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { user } =
    useAuth();

  const [collapsed, setCollapsed] = useState(false);

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

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      await signOut();

      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 bg-slate-950 text-white border-r border-slate-800 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
        className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-6 border-b border-slate-800 overflow-hidden">
        <h1 className="text-xl font-bold whitespace-nowrap">
          {collapsed ? "HM" : "HMSoft"}
        </h1>

        {!collapsed && (
          <p className="text-sm text-slate-400 whitespace-nowrap">
            Kardex Audit
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const Icon =
            item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />

              {!collapsed && (
                <span className="whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={
            handleLogout
          }
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 rounded-lg px-4 py-3 text-sm transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={16} className="shrink-0" />

          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}