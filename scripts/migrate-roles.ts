/**
 * One-time migration: buyer + seller → user
 *
 * Run: bun --env-file=.env.local scripts/migrate-roles.ts
 *
 * Safe to run multiple times (idempotent).
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URII;
if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

const client = new MongoClient(uri);

async function migrate() {
  await client.connect();
  const db = client.db();
  const users = db.collection("users");

  const result = await users.updateMany(
    { role: { $in: ["buyer", "seller"] } },
    { $set: { role: "user" } },
  );

  console.log(`✅ Migrated ${result.modifiedCount} user(s) to role "user"`);

  const remaining = await users.countDocuments({ role: { $in: ["buyer", "seller"] } });
  if (remaining > 0) {
    console.warn(`⚠️  ${remaining} document(s) still have old roles — check manually`);
  } else {
    console.log("✅ No old buyer/seller roles remain");
  }

  await client.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
