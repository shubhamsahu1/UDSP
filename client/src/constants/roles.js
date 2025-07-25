// User Role Constants
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

// User Role Enum
export const UserRole = {
  ADMIN: USER_ROLES.ADMIN,
  STAFF: USER_ROLES.STAFF
};

// User Role Labels (for UI display)
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.STAFF]: 'Staff'
};

// User Role Colors (for UI components)
export const USER_ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'error', // red
  [USER_ROLES.STAFF]: 'primary' // blue
};

// User Role Permissions
export const USER_ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'user_management',
    'create_users',
    'edit_users',
    'delete_users',
    'change_user_passwords',
    'toggle_user_status',
    'view_all_users',
    'dashboard_access'
  ],
  [USER_ROLES.STAFF]: [
    'dashboard_access',
    'view_own_profile',
    'edit_own_profile',
    'change_own_password'
  ]
};

// Helper functions
export const isAdmin = (role) => role === USER_ROLES.ADMIN;
export const isStaff = (role) => role === USER_ROLES.STAFF;
export const hasPermission = (userRole, permission) => {
  return USER_ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Validation
export const isValidRole = (role) => Object.values(USER_ROLES).includes(role);

// Default role
export const DEFAULT_ROLE = USER_ROLES.STAFF; 