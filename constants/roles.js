// User Role Constants
const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

// User Role Enum
const UserRole = {
  ADMIN: USER_ROLES.ADMIN,
  STAFF: USER_ROLES.STAFF
};

// User Role Labels (for UI display)
const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.STAFF]: 'Staff'
};

// User Role Colors (for UI components)
const USER_ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'error', // red
  [USER_ROLES.STAFF]: 'primary' // blue
};

// User Role Permissions
const USER_ROLE_PERMISSIONS = {
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
const isAdmin = (role) => role === USER_ROLES.ADMIN;
const isStaff = (role) => role === USER_ROLES.STAFF;
const hasPermission = (userRole, permission) => {
  return USER_ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Validation
const isValidRole = (role) => Object.values(USER_ROLES).includes(role);

// Default role
const DEFAULT_ROLE = USER_ROLES.STAFF;

module.exports = {
  USER_ROLES,
  UserRole,
  USER_ROLE_LABELS,
  USER_ROLE_COLORS,
  USER_ROLE_PERMISSIONS,
  isAdmin,
  isStaff,
  hasPermission,
  isValidRole,
  DEFAULT_ROLE
}; 