import { headers } from "next/headers";
import { auth, Session } from "./auth";

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
