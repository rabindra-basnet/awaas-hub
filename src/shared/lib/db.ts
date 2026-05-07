import mongoose, { type Mongoose } from "mongoose";
import type { Db, MongoClient } from "mongodb";
import { env } from "@/env";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
  client: MongoClient | null;
  db: Db | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache;
}

if (!global._mongooseCache) {
  global._mongooseCache = { conn: null, promise: null, client: null, db: null };
}

const cache = global._mongooseCache;

export async function connectToDatabase(): Promise<{
  mongoose: Mongoose;
  client: MongoClient;
  db: Db;
  mongodb: Db;
}> {
  if (cache.conn && cache.client && cache.db) {
    return { mongoose: cache.conn, client: cache.client, db: cache.db, mongodb: cache.db };
  }

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);

    cache.promise = mongoose.connect(env.MONGODB_URI, {
      dbName: "awaas-hub",
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== "production",
    });
  }

  cache.conn = await cache.promise;
  cache.client = mongoose.connection.getClient() as unknown as MongoClient;
  cache.db = mongoose.connection.db as unknown as Db;

  return { mongoose: cache.conn, client: cache.client, db: cache.db, mongodb: cache.db };
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
