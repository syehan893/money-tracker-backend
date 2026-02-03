// Setup test environment
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_ANON_KEY = 'mock-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Global mocks if needed
jest.mock('../src/config/database', () => ({
  getSupabaseClient: jest.fn(),
  getSupabaseClientWithAuth: jest.fn(),
  testDatabaseConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/utils/logger.util', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));
