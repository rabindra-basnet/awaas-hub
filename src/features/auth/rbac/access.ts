import { createAccessControl } from "better-auth/plugins/access";
import { adminAc } from "better-auth/plugins/admin/access";

const statement = {
  property:    ["create", "read", "view", "update", "delete", "share", "print", "copy", "duplicate"] as const,
  appointment: ["create", "read", "view", "update", "delete"] as const,
  file:        ["create", "read", "view", "update", "delete", "copy", "duplicate"] as const,
  favorite:    ["create", "read", "view", "delete"] as const,
  user:        ["create", "read", "update", "delete", "ban"] as const,
  analytics:   ["read", "view"] as const,
  ads:         ["create", "read", "view", "update", "delete", "duplicate"] as const,
  support:     ["create", "read", "view", "update", "delete"] as const,
};

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
  property:    ["create", "read", "view", "update", "delete", "share"],
  appointment: ["create", "read", "view", "update", "delete"],
  file:        ["create", "read", "view", "update", "delete"],
  favorite:    ["create", "read", "view", "delete"],
  support:     ["create", "read", "view"],
});

export const adminRole = ac.newRole({
  ...adminAc.statements,
  property:    ["create", "read", "view", "update", "delete", "share", "print", "copy", "duplicate"],
  appointment: ["create", "read", "view", "update", "delete"],
  file:        ["create", "read", "view", "update", "delete", "copy", "duplicate"],
  favorite:    ["create", "read", "view", "delete"],
  user:        ["create", "read", "update", "delete", "ban"],
  analytics:   ["read", "view"],
  ads:         ["create", "read", "view", "update", "delete", "duplicate"],
  support:     ["create", "read", "view", "update", "delete"],
});

export enum Role {
  USER  = "user",
  ADMIN = "admin",
}
