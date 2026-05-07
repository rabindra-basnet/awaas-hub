import { getAuth } from "@/features/auth/server/auth";

export async function GET(req: Request) {
  const auth = await getAuth();
  return auth.handler(req);
}

export async function POST(req: Request) {
  const auth = await getAuth();
  return auth.handler(req);
}
