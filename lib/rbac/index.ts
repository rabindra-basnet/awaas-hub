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
  MANAGE_FAVORITES = "manage_favorites",
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

  VIEW_FILES = "view_files", // view-only
  MANAGE_FILES = "manage_files", // add/upload/delete
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
    Permission.VIEW_FAVORITES,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FILES,
    Permission.MANAGE_FILES,
  ],

  [Role.BUYER]: [
    Permission.VIEW_PROPERTIES,
    Permission.VIEW_FAVORITES,
    // Permission.VIEW_APPOINTMENTS,
    Permission.MANAGE_APPOINTMENTS,
    Permission.VIEW_PROFILE,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FILES,
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

/**
 * Checks if a user can manage a resource
 * @param role - current user's role
 * @param resourceOwnerId - the owner of the resource (file, property, etc.)
 * @param currentUserId - the id of the current user
 * @param requiredPermission - permission that allows managing this resource (default: MANAGE_FILES)
 * @returns boolean
 */
export function canManageResource(
  role: Role,
  resourceOwnerId: string,
  currentUserId: string,
  requiredPermission: Permission,
): boolean {
  // Owner can always manage their own resource
  if (resourceOwnerId === currentUserId) return true;

  // Users with the required permission can manage others' resources
  if (hasPermission(role, requiredPermission)) return true;

  return false;
}

/**
 * Require management permission, throws if not allowed
 */
export function requireManageResource(
  role: Role,
  resourceOwnerId: string,
  currentUserId: string,
  requiredPermission: Permission,
) {
  if (
    !canManageResource(role, resourceOwnerId, currentUserId, requiredPermission)
  ) {
    throw new Error("Forbidden");
  }
}
