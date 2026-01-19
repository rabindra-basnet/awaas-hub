import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { connectToDatabase } from "./db";
import { admin } from "better-auth/plugins";

import { lastLoginMethod, openAPI } from "better-auth/plugins";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("❌ BETTER_AUTH_SECRET is not defined");
}

if (!process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined");
}

// Connect to DB once at startup (Next.js module scope is reused in production)
const { db, client } = await connectToDatabase();

const adminids = { adminUserIds: ["6968f2f22fff902bf245f308"] };

export const auth = betterAuth({
  database: mongodbAdapter(db, { client, debugLogs: false, usePlural: true }),
  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  plugins: [nextCookies(), lastLoginMethod(), admin()],

  user: {
    additionalFields: {
      role: {
        type: "string",
        default: null,
      },
    },
    constraints: {
      email: {
        unique: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
