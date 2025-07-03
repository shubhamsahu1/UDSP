// Jest setup file for global test configuration

// Set test timeout
jest.setTimeout(30000);

// Mock console.log/error during tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Global test utilities
global.testUtils = {
  createValidLabTest: () => ({
    name: 'Test Lab Test'
  }),
  
  createValidTestData: (userId, labTestId) => ({
    userId,
    date: new Date(),
    labTestId,
    sampleTaken: 100,
    samplePositive: 5
  }),
  
  createValidUser: (role = 'staff') => ({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    mobile: `123456${Math.floor(Math.random() * 10000)}`,
    role
  })
};

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRE = '1h';