import request from 'supertest';
import { createApp } from '../../../src/app';
import { expenseTypeRepository, expenseRepository } from '../../../src/repositories/expense.repository';
import { accountService } from '../../../src/services/account.service';

// Mock Auth Middleware
jest.mock('../../../src/middleware/auth.middleware', () => ({
  authenticateUser: (req: any, _res: any, next: any) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' };
    req.accessToken = 'mock-token';
    next();
  },
}));

// Mock Repositories
jest.mock('../../../src/repositories/expense.repository', () => ({
  expenseTypeRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  expenseRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getMonthlySummary: jest.fn(),
    getBudgetStatus: jest.fn(),
  },
}));

// Mock Account Service
jest.mock('../../../src/services/account.service', () => ({
  accountService: {
    validateAccountOwnership: jest.fn(),
  },
}));

const app = createApp();

describe('Expense Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/expense-types', () => {
    it('should return 200 and expense types', async () => {
      const mockTypes = [{ id: '123e4567-e89b-12d3-a456-426614174001', name: 'Food' }];
      (expenseTypeRepository.findAll as jest.Mock).mockResolvedValue(mockTypes);

      const res = await request(app).get('/api/v1/expense-types');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockTypes);
    });
  });

  describe('POST /api/v1/expenses', () => {
    it('should create expense', async () => {
      const input = {
        accountId: '123e4567-e89b-12d3-a456-426614174002',
        expenseTypeId: '123e4567-e89b-12d3-a456-426614174003',
        amount: 50,
        date: '2023-01-01',
      };
      
      (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue({ id: input.accountId, balance: 1000 });
      (expenseTypeRepository.findById as jest.Mock).mockResolvedValue({ id: input.expenseTypeId });
      (expenseRepository.create as jest.Mock).mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174004', ...input });

      const res = await request(app).post('/api/v1/expenses').send(input);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', '123e4567-e89b-12d3-a456-426614174004');
    });

    it('should return 400 for insufficient balance', async () => {
       const input = {
        accountId: '123e4567-e89b-12d3-a456-426614174002',
        expenseTypeId: '123e4567-e89b-12d3-a456-426614174003',
        amount: 5000, // exceeds balance
        date: '2023-01-01',
      };
      
      (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue({ id: input.accountId, balance: 1000 });

      const res = await request(app).post('/api/v1/expenses').send(input);

      expect(res.status).toBe(400); // InsufficientBalanceError maps to 400
      expect(res.body.error.code).toBe('INSUFFICIENT_BALANCE');
    });
  });
});
