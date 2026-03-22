"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/client/auth-client";

type Props = {
  children: React.ReactNode;
};

export function AnonymousProvider({ children }: Props) {
  const { data: session, isPending } = authClient.useSession();
  const isSigningInRef = useRef(false);

  useEffect(() => {
    const signInAnonymousIfNeeded = async () => {
      if (isPending) return;
      if (session) return; // includes anonymous session
      if (isSigningInRef.current) return;

      isSigningInRef.current = true;

      try {
        const result = await authClient.signIn.anonymous();

        console.log("he", result);

        if (result?.error) {
          console.error("Anonymous sign-in failed:", result.error);
        }
      } catch (error) {
        console.error("Anonymous sign-in error:", error);
      } finally {
        isSigningInRef.current = false;
      }
    };

    signInAnonymousIfNeeded();
  }, [session, isPending]);

  return <>{children}</>;
}
