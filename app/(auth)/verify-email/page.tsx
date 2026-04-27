"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await authClient.email.verifyEmail({
          token,
        });

        setStatus("success");

        // redirect after success
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-[340px] rounded-xl bg-white p-6 shadow text-center">
        {status === "loading" && (
          <p className="text-gray-600">Verifying your email...</p>
        )}

        {status === "success" && (
          <p className="text-green-600 font-medium">
            Email verified successfully 🎉 Redirecting...
          </p>
        )}

        {status === "error" && (
          <p className="text-red-600 font-medium">
            Verification failed or link expired.
          </p>
        )}
      </div>
    </div>
  );
}
