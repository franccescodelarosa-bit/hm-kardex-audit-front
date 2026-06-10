import AppSidebar from "@/components/layout/app-sidebar";
import DashboardHeader from "@/components/layout/app-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar />

      <main className="flex-1">
        <DashboardHeader />

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}