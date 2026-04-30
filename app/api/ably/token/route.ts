import { unauthorized } from "@/lib/error";
import { getServerSession } from "@/lib/server/getSession";
import Ably from "ably";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();

  const user = session.user;

  // 👇 role mapping
  const role =
    user.role === "admin"
      ? "admin"
      : user.role === "seller"
        ? "seller"
        : "buyer";

  const client = new Ably.Rest(process.env.ABLY_API_KEY!);

  const tokenRequest = await client.auth.createTokenRequest({
    clientId: user.id, // 👈 IMPORTANT: unique identity
    capability: {
      // property chat allowed for everyone logged in
      "property:*": ["publish", "subscribe"],

      // admin inbox ONLY admin
      "admin:inbox": role === "admin" ? ["subscribe", "publish"] : [],
    },
    metadata: {
      role,
      name: user.name,
    },
  });

  return NextResponse.json(tokenRequest);
}
