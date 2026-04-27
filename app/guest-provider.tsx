"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/client/auth-client";

type Props = {
  children: React.ReactNode;
};

export function AnonymousProvider({ children }: Props) {
  const { data: session, isPending } = authClient.useSession();

  const signInAnonymously = useMutation({
    mutationFn: () => authClient.signIn.anonymous(),
    onError: (error) => {
      console.error("Anonymous sign-in error:", error);
    },
  });
  console.log(signInAnonymously);

  useEffect(() => {
    if (isPending) return;
    if (session) return;
    if (signInAnonymously.isPending || signInAnonymously.isSuccess) return;

    signInAnonymously.mutate();
  }, [isPending, session]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
