// Import shared constants
const roles = require('./roles.js');

// App Constants
const APP_NAME = 'Initial Dashboard';
const APP_VERSION = '1.0.0';

// API Constants
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  USER: {
    PROFILE: '/user/profile',
    ALL: '/user/all',
    CREATE: '/user/create',
    UPDATE: (id) => `/user/${id}`,
    DELETE: (id) => `/user/${id}`,
    CHANGE_PASSWORD: (id) => `/user/${id}/password`,
    TOGGLE_STATUS: (id) => `/user/${id}/status`
  }
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Local Storage Keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Validation Constants
const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
};

// UI Constants
const UI = {
  SNACKBAR_DURATION: 6000,
  DEBOUNCE_DELAY: 300,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50]
  }
};

module.exports = {
  ...roles,
  APP_NAME,
  APP_VERSION,
  API_ENDPOINTS,
  HTTP_STATUS,
  STORAGE_KEYS,
  VALIDATION,
  UI
}; 