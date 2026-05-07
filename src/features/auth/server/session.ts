import { headers } from "next/headers";
import { getAuth } from "./auth";
import type { User } from "./auth";

export async function getServerSession() {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
}

/** Returns true when the session belongs to a real (non-anonymous) account. */
export function isRealSession(
  session: { user: Pick<User, "isAnonymous"> } | null,
): session is NonNullable<typeof session> {
  return !!session && !session.user.isAnonymous;
}

/**
 * Server-side permission check using better-auth's userHasPermission API.
 * Use this in API route handlers for granular resource/action checks.
 *
 * Example:
 *   const allowed = await checkPermission(session.user.id, { property: ["delete"] });
 */
export async function checkPermission(
  userId: string,
  permissions: Record<string, string[]>,
): Promise<boolean> {
  const auth = await getAuth();
  try {
    const result = await auth.api.userHasPermission({
      body: { userId, permissions },
    });
    return !!(result as any)?.success || !!(result as any)?.hasPermission;
  } catch {
    return false;
  }
}
