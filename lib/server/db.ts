import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

let cached: {
  conn: typeof mongoose | null;
  client: any | null;
  db: any | null;
} = (global as any)._mongoose || { conn: null, client: null, db: null };

export async function connectToDatabase() {
  if (cached.conn) {
    return { mongoose: cached.conn, client: cached.client!, db: cached.db! };
  }

  const conn = await mongoose.connect(MONGODB_URI, {
    dbName: "aawas-hub",
    autoIndex: true,
  });

  const client = mongoose.connection.getClient(); // raw MongoClient
  const db = mongoose.connection.db; // native Db

  cached = { conn, client, db };
  (global as any)._mongoose = cached;

  console.log("✅ Connected to MongoDB (Mongoose + native client)");
  return { mongoose: conn, client, db };
}

// Optional helpers
export async function getClient() {
  const { client } = await connectToDatabase();
  return client;
}

export async function getDb() {
  const { db } = await connectToDatabase();
  return db;
}
