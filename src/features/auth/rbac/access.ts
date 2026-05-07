import { createAccessControl } from "better-auth/plugins/access";
import { adminAc } from "better-auth/plugins/admin/access";

const statement = {
  property:    ["create", "read", "update", "delete", "share"] as const,
  appointment: ["create", "read", "update", "delete"] as const,
  file:        ["create", "read", "update", "delete"] as const,
  favorite:    ["create", "read", "delete"] as const,
  user:        ["create", "read", "update", "delete", "ban"] as const,
  analytics:   ["read"] as const,
  ads:         ["create", "read", "update", "delete"] as const,
  support:     ["create", "read", "update", "delete"] as const,
};

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
  property:    ["create", "read", "update", "delete", "share"],
  appointment: ["create", "read", "update", "delete"],
  file:        ["create", "read", "update", "delete"],
  favorite:    ["create", "read", "delete"],
  support:     ["create", "read"],
});

export const adminRole = ac.newRole({
  ...adminAc.statements,
  property:    ["create", "read", "update", "delete", "share"],
  appointment: ["create", "read", "update", "delete"],
  file:        ["create", "read", "update", "delete"],
  favorite:    ["create", "read", "delete"],
  user:        ["create", "read", "update", "delete", "ban"],
  analytics:   ["read"],
  ads:         ["create", "read", "update", "delete"],
  support:     ["create", "read", "update", "delete"],
});

export enum Role {
  USER  = "user",
  ADMIN = "admin",
}

export function checkAcPermission(
  role: Role,
  permissions: Parameters<typeof ac.hasPermission>[1],
) {
  return ac.hasPermission({ role, permissions });
}
