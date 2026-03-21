"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/client/auth-client";
import { toast } from "sonner";

type Props = {
  children: React.ReactNode;
};

export function AnonymousProvider({ children }: Props) {
  useEffect(() => {
    const init = async () => {
      try {
        const sessionResult = await authClient.getSession();
        console.log(sessionResult);

        if (!sessionResult?.data == null) {
          const signInResult = await authClient.signIn.anonymous();
          const userId = signInResult?.data?.user?.id;

          if (!userId) {
            toast.error("Anonymous login failed");
            return;
          }

          console.log("Anonymous user:", userId);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize anonymous session");
      }
    };

    init();
  }, []);

  return <>{children}</>;
}
