import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const clientEnv = {
  NEXT_PUBLIC_BETTER_AUTH_URL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,

  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL,

  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const env = createEnv({
  server: {
    MONGODB_URI: z.string().url(),

    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET: z.string().min(1),

    RESEND_API_KEY: z.string().min(1),
    EMAIL_SENDER_ADDRESS: z.string().email(),

    ESEWA_MERCHANT_CODE: z.string().min(1),
    ESEWA_SECRET_KEY: z.string().min(1),

    KHALTI_SECRET_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL:
      z.string().url(),

    NEXT_PUBLIC_SUPABASE_URL:
      z.string().url(),

    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      z.string().min(1),
  },

  experimental__runtimeEnv: clientEnv,

  emptyStringAsUndefined: true,

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true",
});