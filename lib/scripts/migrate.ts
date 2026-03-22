// scripts/backfill-verification-status.ts
// Run once: npx tsx scripts/backfill-verification-status.ts

import { getDb } from "@/lib/server/db";
import { Property } from "@/lib/models/Property";

async function main() {
  await getDb();

  // Set verificationStatus to "pending" for every doc that is missing it
  const result = await Property.updateMany(
    { verificationStatus: { $exists: false } },
    { $set: { verificationStatus: "pending" } },
  );

  console.log(
    `✅ Backfilled ${result.modifiedCount} properties with verificationStatus: "pending"`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
