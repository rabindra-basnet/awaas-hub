import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { connectToDatabase } from "./db";
import { admin, anonymous } from "better-auth/plugins";
import { lastLoginMethod } from "better-auth/plugins";
import { hashPassword, verifyPassword } from "./password";
import { sendResetPasswordEmail } from "../emails/send-reset-email";
import { sendVerifyEmail } from "../emails/send-verify-email";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("❌ BETTER_AUTH_SECRET is not defined");
}

if (!process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined");
}

// Connect to DB once at startup (Next.js module scope is reused in production)
const { db, client } = await connectToDatabase();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client, debugLogs: false, usePlural: true }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerifyEmail({
        email: user.email,
        name: user.name ?? "Customer",
        url: url as string,
      });
    },
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }, _request) => {
      await sendResetPasswordEmail({
        email: user.email,
        name: user.name ?? "Customer",
        url,
      });
    },
    onPasswordReset: async ({ user }, _request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  plugins: [
    nextCookies(),
    lastLoginMethod(),
    anonymous({
      generateName: () => "Guest",
      emailDomainName: "awaashub.com",
    }),
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        default: null,
        input: true,
      },
      // subscription: {
      //   type: "string",
      //   default: null,
      //   input: true,
      // },
    },
    constraints: {
      email: {
        unique: true,
      },
    },
  },
});

// Type for session
export type Session = typeof auth.$Infer.Session;
