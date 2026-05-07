import { redirect } from "next/navigation";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { Role } from "@/features/auth/rbac/access";
import SupportChat from "@/features/support/components/support-chat";
import SupportInbox from "@/features/support/components/support-inbox";

export default async function SupportPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  const isAdmin = session.user.role === Role.ADMIN;
  const qc = getQueryClient();

  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  if (isAdmin) {
    await qc.prefetchQuery({
      queryKey: ["support", "inbox"],
      queryFn:  async () => {
        const res = await fetch(`${base}/api/support/inbox`);
        if (!res.ok) return { conversations: [] };
        return res.json();
      },
    });
    return (
      <HydrationBoundary state={dehydrate(qc)}>
        <SupportInbox />
      </HydrationBoundary>
    );
  }

  await qc.prefetchQuery({
    queryKey: ["support", "thread", ""],
    queryFn:  async () => {
      const res = await fetch(`${base}/api/support`, {
        headers: { Cookie: (await import("next/headers")).cookies().toString() },
      });
      if (!res.ok) return { messages: [] };
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <SupportChat />
    </HydrationBoundary>
  );
}
