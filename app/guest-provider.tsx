"use client";
import { useEffect } from "react";
import { authClient } from "@/lib/client/auth-client";
import { useRouter } from "next/navigation";
import { useUpdateRoleMutation } from "@/lib/client/queries/roles.queries";
import { toast } from "sonner";

export function AnonymousProvider() {
  const router = useRouter();
  const updateRoleMutation = useUpdateRoleMutation();

  useEffect(() => {
    const init = async () => {
      const anonLoggedIn = sessionStorage.getItem("anonLoggedIn");

      if (anonLoggedIn) return;

      const sessionResult = await authClient.getSession();

      if (!sessionResult?.data?.user) {
        try {
          const signInResult = await authClient.signIn.anonymous();

          if (signInResult?.data) {
            console.log(signInResult.data);
            const userId = signInResult?.data?.user.id;

            if (!userId) return;

            updateRoleMutation.mutate({ userId, role: "guest" });
            sessionStorage.setItem("anonLoggedIn", "true");
          }
        } catch (err) {
          toast.error("Failed to initialize anonymous session");
        }
      }
    };

    init();
  }, [router, updateRoleMutation]);

  return null;
}
