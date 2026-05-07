import { createAuthClient } from "better-auth/react";
import { adminClient, anonymousClient, inferAdditionalFields } from "better-auth/client/plugins";
import { env } from "@/env";
import type { Auth } from "@/features/auth/server/auth";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<Auth>(),
    anonymousClient(),
    adminClient(),
  ],
});

export const {
  useSession,
  signIn,
  signOut,
  signUp,
} = authClient;
