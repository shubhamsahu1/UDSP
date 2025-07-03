// Import shared constants
export * from './shared-constants.js';

// Frontend-specific constants
export const FRONTEND_CONFIG = {
  THEME: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  LANGUAGES: {
    EN: 'en',
    ES: 'es'
  }
};

// Route paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USER_MANAGEMENT: '/user-management',
  CHANGE_PASSWORD: '/change-password',
  PROFILE: '/profile'
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email',
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  PASSWORD_MATCH: 'Passwords must match',
  USERNAME_MIN: 'Username must be at least 3 characters',
  PASSWORD_MIN: 'Password must be at least 6 characters'
}; 