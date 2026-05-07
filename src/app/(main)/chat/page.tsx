import { redirect } from "next/navigation";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import SellerChatInbox from "@/features/chat/components/seller-chat-inbox";

export default async function ChatPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: ["chat", "inbox"],
    queryFn:  async () => {
      const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/property-chat/seller-inbox`);
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <SellerChatInbox />
    </HydrationBoundary>
  );
}
