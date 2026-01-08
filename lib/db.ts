import { MongoClient, type Db } from "mongodb"

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/realestate"
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(mongoUri)
  await client.connect()
  const db = client.db("realestate")

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}
