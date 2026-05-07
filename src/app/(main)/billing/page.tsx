import { redirect } from "next/navigation";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import BillingContent from "@/features/billing/components/billing-content";
import { connectToDatabase } from "@/shared/lib/db";
import { Subscription } from "@/features/billing/models/subscription.model";
import { Types } from "mongoose";

export default async function BillingPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: ["billing", "balance"],
    queryFn: async () => {
      await connectToDatabase();
      const agg = await Subscription.aggregate([
        { $match: { userId: new Types.ObjectId(session.user.id), status: "paid" } },
        { $group: { _id: null, total: { $sum: "$credits" }, used: { $sum: "$usedCredits" } } },
      ]);
      const total     = agg[0]?.total ?? 0;
      const used      = agg[0]?.used  ?? 0;
      const history = await Subscription.find({ userId: session.user.id })
        .sort({ createdAt: -1 }).limit(10).lean();
      return {
        remaining: total - used, total, used,
        history: history.map((s) => ({
          _id: s._id.toString(), credits: s.credits, creditsToAdd: s.creditsToAdd,
          usedCredits: s.usedCredits, amount: s.amount, status: s.status,
          paymentMethod: s.paymentMethod, createdAt: s.createdAt.toISOString(),
        })),
      };
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <HydrationBoundary state={dehydrate(qc)}>
        <BillingContent />
      </HydrationBoundary>
    </div>
  );
}
