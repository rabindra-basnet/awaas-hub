import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { nextCookies } from "better-auth/next-js"

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/realestate"
const client = new MongoClient(mongoUri)

async function getDatabase() {
  await client.connect()
  return client.db("realestate")
}

let db: ReturnType<typeof client.db> | null = null

export const auth = betterAuth({
  database: mongodbAdapter(client),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },

  plugins: [nextCookies()],

  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "buyer",
        required: false,
      },
    },
  },
})

export async function connectDB() {
  if (!db) {
    db = await getDatabase()
  }
  return db
}

export { client as mongoClient }
