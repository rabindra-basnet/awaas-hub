import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import AppSidebar from "@/shared/components/app-sidebar";
import DashboardHeader from "@/shared/components/dashboard-header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
