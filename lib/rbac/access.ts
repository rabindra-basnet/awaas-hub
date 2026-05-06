import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Fine-grained actions available across all resources.
 * read      — list / query
 * view      — open a specific record
 * update    — edit / patch
 * delete    — remove
 * share     — share a link or with another user
 * print     — print-friendly output
 * copy      — copy content / ID
 * duplicate — clone a record
 */
const statement = {
  ...defaultStatements,
  property:    ["read", "view", "update", "delete", "share", "print", "copy", "duplicate"],
  appointment: ["read", "view", "update", "delete"],
  file:        ["read", "view", "update", "delete", "copy", "duplicate"],
  favorite:    ["read", "view", "delete"],
  analytics:   ["read", "view"],
  ads:         ["read", "view", "update", "delete", "duplicate"],
  support:     ["read", "view", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

/** Regular authenticated user — full property lifecycle, own data only */
export const userRole = ac.newRole({
  property:    ["read", "view", "update", "delete", "share", "print", "copy", "duplicate"],
  appointment: ["read", "view", "update", "delete"],
  file:        ["read", "view", "delete", "copy"],
  favorite:    ["read", "view", "delete"],
  support:     ["read", "view"],
});

/** Admin — inherits better-auth built-in admin permissions + all resources */
export const adminRole = ac.newRole({
  ...adminAc.statements,
  property:    ["read", "view", "update", "delete", "share", "print", "copy", "duplicate"],
  appointment: ["read", "view", "update", "delete"],
  file:        ["read", "view", "update", "delete", "copy", "duplicate"],
  favorite:    ["read", "view", "delete"],
  analytics:   ["read", "view"],
  ads:         ["read", "view", "update", "delete", "duplicate"],
  support:     ["read", "view", "update", "delete"],
});
