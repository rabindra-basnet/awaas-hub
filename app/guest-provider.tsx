"use client";
import { useEffect } from "react";
import { authClient } from "@/lib/client/auth-client";
import { toast } from "sonner";

export function AnonymousProvider() {
  useEffect(() => {
    const init = async () => {
      const anonLoggedIn = sessionStorage.getItem("anonLoggedIn");
      if (anonLoggedIn) return;

      const sessionResult = await authClient.getSession();
      if (!sessionResult?.data?.user) {
        try {
          const signInResult = await authClient.signIn.anonymous();
          const userId = signInResult?.data?.user?.id;
          if (!userId) return;

          sessionStorage.setItem("anonLoggedIn", "true");
          sessionStorage.setItem("userId", userId);
        } catch (err) {
          toast.error("Failed to initialize anonymous session");
        }
      }
    };

    init();
  }, []);

  return null;
}
