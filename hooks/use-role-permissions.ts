"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/client/auth-client";
import { Role, Permission, hasPermission } from "@/lib/rbac";

export function useRolePermissions() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: session } = await getSession();

        // Assign Role.GUEST if no session
        const userRole = (session?.user?.role as Role) ?? Role.GUEST;

        setRole(userRole);
      } catch (err) {
        console.error(err);
        setRole(Role.GUEST);
      }
    };

    init();
  }, []);

  // Checks if current role has a specific permission
  const can = (permission: Permission) => {
    if (!role) return false;
    return hasPermission(role, permission);
  };

  return { role, can };
}
