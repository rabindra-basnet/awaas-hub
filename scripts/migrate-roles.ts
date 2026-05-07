// bun --env-file=.env.local scripts/migrate-roles.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: "awaas-hub" });
  const db = mongoose.connection.db!;

  const result = await db.collection("users").updateMany(
    { role: { $in: ["buyer", "seller"] } },
    { $set: { role: "user" } },
  );

  console.log(`Migrated ${result.modifiedCount} users from buyer/seller → user`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
