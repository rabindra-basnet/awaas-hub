"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSession } from "@/lib/client/auth-client";
import { hasPermission, Permission, Role } from "@/lib/rbac";

type SessionAccessContextType = {
  session: any;
  isPending: boolean;
  isAnonymous: boolean;
  role: Role | null;
  canManageProperties: boolean;
};

const SessionAccessContext = createContext<SessionAccessContextType | null>(
  null,
);

export function SessionAccessProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();

  const value = useMemo(() => {
    const isAnonymous = session?.user?.isAnonymous === true;
    const role = session?.user?.role ? (session.user.role as Role) : null;

    const canManageProperties =
      !isPending &&
      !!session &&
      !isAnonymous &&
      !!role &&
      hasPermission(role, Permission.MANAGE_PROPERTIES);

    return {
      session,
      isPending,
      isAnonymous,
      role,
      canManageProperties,
    };
  }, [session, isPending]);

  return (
    <SessionAccessContext.Provider value={value}>
      {children}
    </SessionAccessContext.Provider>
  );
}

export function useSessionAccess() {
  const context = useContext(SessionAccessContext);

  if (!context) {
    throw new Error(
      "useSessionAccess must be used inside SessionAccessProvider",
    );
  }

  return context;
}
