// // "use client";

// // import { useSession } from "@/lib/client/auth-client";
// // import { useRouter } from "next/navigation";
// // import { useEffect } from "react";
// // import { SidebarProvider } from "@/components/ui/sidebar";
// // import AppSidebar from "./_components/app-sidebar";
// // import DashboardHeader from "./_components/dashboard-header";

// // import { Role, Permission, hasPermission } from "@/lib/rbac";
// // import AccessDeniedPage from "@/components/access-denied";

// // export default function DashboardLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   const { data: session, isPending } = useSession();
// //   const router = useRouter();

// //   // 1️⃣ Not logged in → login
// //   useEffect(() => {
// //     if (!isPending && !session) {
// //       router.replace("/login");
// //     }
// //   }, [session, isPending, router]);

// //   if (isPending) return null;
// //   if (!session) return null;

// //   const role = session.user.role as Role;

// //   // 2️⃣ Logged in but no dashboard permission
// //   if (!hasPermission(role, Permission.VIEW_DASHBOARD)) {
// //     return <AccessDeniedPage />;
// //   }

// //   return (
// //     <SidebarProvider defaultOpen={false}>
// //       <div className="flex h-screen w-full">
// //         {/* Sidebar */}
// //         <AppSidebar session={session} />

// //         {/* Main */}
// //         <main className="flex-1 flex flex-col">
// //           {/* Sticky Header */}
// //           <DashboardHeader />

// //           {/* Scrollable content */}
// //           <div className="flex-1 overflow-y-auto">
// //             {children}
// //           </div>
// //         </main>
// //       </div>
// //     </SidebarProvider>
// //   );
// // }

// "use client";

// import { useSession } from "@/lib/client/auth-client";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import AppSidebar from "./_components/app-sidebar";
// import DashboardHeader from "./_components/dashboard-header";
// import AccessDeniedPage from "@/components/access-denied";
// import { Role, Permission, hasPermission } from "@/lib/rbac";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { data: session, isPending } = useSession();

//   // Show spinner while session is loading
//   if (isPending) {
//     return (
//       <div className="flex h-screen w-full items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   const role: Role = (session?.user?.role as Role) ?? Role.GUEST;

//   // Guests or users without VIEW_DASHBOARD cannot access
//   if (role === Role.GUEST || !hasPermission(role, Permission.VIEW_DASHBOARD)) {
//     return <AccessDeniedPage />;
//   }

//   return (
//     <SidebarProvider defaultOpen={false}>
//       <div className="flex h-screen w-full">
//         <AppSidebar session={session} />
//         <main className="flex-1 flex flex-col">
//           <DashboardHeader />
//           <div className="flex-1 overflow-y-auto">{children}</div>
//         </main>
//       </div>
//     </SidebarProvider>
//   );
// }

"use client";

import { useSession } from "@/lib/client/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import DashboardHeader from "./_components/dashboard-header";
import AccessDeniedPage from "@/components/access-denied";
import { Role, Permission, hasPermission } from "@/lib/rbac";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // 1️⃣ Not logged in → login
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) return null;
  if (!session) return null;

  const role = session.user.role as Role;

  // 2️⃣ Logged in but no dashboard permission
  if (!hasPermission(role, Permission.VIEW_DASHBOARD)) {
    return <AccessDeniedPage />;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar session={session} />

        {/* Main */}
        <main className="flex-1 flex flex-col">
          {/* Sticky Header */}
          <DashboardHeader />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
