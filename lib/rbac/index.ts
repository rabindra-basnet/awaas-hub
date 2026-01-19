export enum Role {
  ADMIN = "admin",
  SELLER = "seller",
  BUYER = "buyer",
  GUEST = "guest",
}

export enum Permission {
  VIEW_PROPERTIES = "view_properties",
  MANAGE_PROPERTIES = "manage_properties",
  VIEW_FAVORITES = "view_favorites",
  // CREATE_PROPERTIES = "create_properties",      // new
  // EDIT_PROPERTIES = "edit_properties",          // new
  // DELETE_PROPERTIES = "delete_properties",      // new

  MANAGE_APPOINTMENTS = "manage_appointments",
  //   VIEW_APPOINTMENTS = "view_appointments",
  MANAGE_USERS = "manage_users",
  VIEW_ANALYTICS = "view_analytics",

  VIEW_DASHBOARD = "view_dashboard",

  VIEW_PROFILE = "view_profile",
  MANAGE_SETTINGS = "manage_settings",
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.GUEST]: [Permission.VIEW_PROPERTIES],

  [Role.SELLER]: [
    Permission.VIEW_PROPERTIES,
    // Permission.CREATE_PROPERTIES,
    // Permission.EDIT_PROPERTIES,
    // Permission.DELETE_PROPERTIES,
    Permission.MANAGE_PROPERTIES,

    Permission.MANAGE_APPOINTMENTS,
    Permission.VIEW_PROFILE,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_DASHBOARD,
  ],

  [Role.BUYER]: [
    Permission.VIEW_PROPERTIES,
    Permission.VIEW_FAVORITES,
    // Permission.VIEW_APPOINTMENTS,
    Permission.MANAGE_APPOINTMENTS,
    Permission.VIEW_PROFILE,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_DASHBOARD,
  ],
};

/**
 * Checks if a role has a given permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Checks if a role has ALL permissions
 */
export function hasAllPermissions(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Checks if a role has ANY permission
 */
export function hasAnyPermission(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function requirePermission(role: Role, permission: Permission) {
  if (!hasPermission(role, permission)) {
    throw new Error("Forbidden");
  }
}
