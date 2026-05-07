"use client";

import { useEffect } from "react";
import { authClient } from "@/features/auth/client/auth-client";

export default function AnonymousSessionProvider() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      authClient.signIn.anonymous();
    }
  }, [session, isPending]);

  return null;
}
