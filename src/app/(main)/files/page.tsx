import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import FilesContent from "@/features/files/components/files-content";

export default async function FilesPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: ["files", "list"],
    queryFn:  async () => {
      const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/files`);
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <FilesContent />
    </HydrationBoundary>
  );
}
