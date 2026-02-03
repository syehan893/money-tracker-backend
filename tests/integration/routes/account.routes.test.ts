import request from 'supertest';
import { createApp } from '../../../src/app';
import { accountRepository } from '../../../src/repositories/account.repository';

// Mock Auth Middleware
jest.mock('../../../src/middleware/auth.middleware', () => ({
  authenticateUser: (req: any, _res: any, next: any) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' };
    req.accessToken = 'mock-token';
    next();
  },
}));

// Mock Repository
jest.mock('../../../src/repositories/account.repository', () => ({
  accountRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getSummary: jest.fn(),
  },
}));

const app = createApp();

describe('Account Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/accounts', () => {
    it('should return 200 and accounts', async () => {
      const mockAccounts = [{ id: '123e4567-e89b-12d3-a456-426614174001', name: 'Main Bank' }];
      (accountRepository.findAll as jest.Mock).mockResolvedValue(mockAccounts);

      const res = await request(app).get('/api/v1/accounts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockAccounts);
    });
  });

  describe('POST /api/v1/accounts', () => {
    it('should create account', async () => {
      const input = { name: 'Savings', accountType: 'saving', balance: 1000, currency: 'USD' };
      const created = { id: '123e4567-e89b-12d3-a456-426614174002', ...input };
      (accountRepository.create as jest.Mock).mockResolvedValue(created);

      const res = await request(app).post('/api/v1/accounts').send(input);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(created);
    });
  });

  describe('GET /api/v1/accounts/summary', () => {
    it('should return summary', async () => {
      const summary = { totalBalance: 1000, accounts: [] };
      (accountRepository.getSummary as jest.Mock).mockResolvedValue(summary);

      const res = await request(app).get('/api/v1/accounts/summary');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(summary);
    });
  });
});
