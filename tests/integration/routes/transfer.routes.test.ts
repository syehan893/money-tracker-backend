import request from 'supertest';
import { createApp } from '../../../src/app';
import { transferRepository } from '../../../src/repositories/transfer.repository';
import { accountService } from '../../../src/services/account.service';

// Mock Auth Middleware
jest.mock('../../../src/middleware/auth.middleware', () => ({
  authenticateUser: (req: any, _res: any, next: any) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' };
    req.accessToken = 'mock-token';
    next();
  },
}));

// Mock Repository
jest.mock('../../../src/repositories/transfer.repository', () => ({
  transferRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock Account Service
jest.mock('../../../src/services/account.service', () => ({
  accountService: {
    validateAccountOwnership: jest.fn(),
  },
}));

const app = createApp();

describe('Transfer Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/transfers', () => {
    it('should return 200 and transfers', async () => {
      const mockTransfers = [{ id: '123e4567-e89b-12d3-a456-426614174001', amount: 100 }];
      (transferRepository.findAll as jest.Mock).mockResolvedValue({
        transfers: mockTransfers,
        total: 1,
      });

      const res = await request(app).get('/api/v1/transfers');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual(mockTransfers);
    });
  });

  describe('POST /api/v1/transfers', () => {
    it('should create transfer', async () => {
      const input = {
        fromAccountId: '123e4567-e89b-12d3-a456-426614174002',
        toAccountId: '123e4567-e89b-12d3-a456-426614174003',
        amount: 50,
        date: '2023-01-01',
      };
      
      // Mock account validation (returns account with balance)
      (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue({ id: input.fromAccountId, balance: 100 });
      
      const created = { id: '123e4567-e89b-12d3-a456-426614174004', ...input };
      (transferRepository.create as jest.Mock).mockResolvedValue(created);

      const res = await request(app).post('/api/v1/transfers').send(input);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(created);
    });

    it('should fail if same account', async () => {
       const input = {
        fromAccountId: '123e4567-e89b-12d3-a456-426614174002',
        toAccountId: '123e4567-e89b-12d3-a456-426614174002', // Same
        amount: 50,
        date: '2023-01-01',
      };

      const res = await request(app).post('/api/v1/transfers').send(input);
      expect(res.status).toBe(400);
    });
  });
});
