import { headers } from "next/headers";
import { auth, Session } from "./auth";
import { hasPermission, Permission, Role } from "../rbac";
import { forbidden, unauthorized } from "../error";
/**
 * Server-side helper to get Better Auth session
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session ?? null;
  } catch (err) {
    console.error("Failed to get session:", err);
    return null;
  }
}

/*
 * Generic session check for any permission
 * @param session - the current user session
 * @param requiredPermission - the permission to check
 */
export async function handleSessionCheck(requiredPermission: Permission) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const role = session.user.role as Role;
  if (!hasPermission(role, requiredPermission)) return forbidden();

  return session;
}
