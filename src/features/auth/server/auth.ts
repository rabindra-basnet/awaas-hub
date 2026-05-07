import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, lastLoginMethod } from "better-auth/plugins";

import { env } from "@/env";
import { getDb } from "@/shared/lib/db";
import {
  ac,
  adminRole,
  userRole,
} from "@/features/auth/rbac/access";

let authInstance:
  | Awaited<ReturnType<typeof initAuth>>
  | null = null;

async function initAuth() {
  const db = await getDb();

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(db),

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,

        clientSecret:
          env.GOOGLE_CLIENT_SECRET,

        redirectURI:
          `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
      },
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    user: {
      additionalFields: {
        role: {
          type: "string",
          default: "user",
          input: true,
        },
      },
    },

    plugins: [
      nextCookies(),
      lastLoginMethod(),

      anonymous({
        generateName: () => "Guest",
        emailDomainName: "awaashub.com",
      }),

      admin({
        ac,

        roles: {
          admin: adminRole,
          user: userRole,
        },

        defaultRole: "user",
      }),
    ],

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
  });
}

export async function getAuth() {
  if (!authInstance) {
    authInstance = await initAuth();
  }

  return authInstance;
}

export type Auth = Awaited<
  ReturnType<typeof getAuth>
>;

export type Session =
  Auth["$Infer"]["Session"];

export type User =
  Session["user"]