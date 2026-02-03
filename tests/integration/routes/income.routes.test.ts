import request from 'supertest';
import { createApp } from '../../../src/app';
import { incomeTypeRepository, incomeRepository } from '../../../src/repositories/income.repository';
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
jest.mock('../../../src/repositories/income.repository', () => ({
  incomeTypeRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  incomeRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getMonthlySummary: jest.fn(),
    getTargetProgress: jest.fn(),
  },
}));

// Mock Account Service
jest.mock('../../../src/services/account.service', () => ({
  accountService: {
    validateAccountOwnership: jest.fn(),
  },
}));

const app = createApp();

describe('Income Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/income-types', () => {
    it('should return 200 and income types', async () => {
      const mockTypes = [{ id: '123e4567-e89b-12d3-a456-426614174001', name: 'Salary' }];
      (incomeTypeRepository.findAll as jest.Mock).mockResolvedValue(mockTypes);

      const res = await request(app).get('/api/v1/income-types');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockTypes);
    });
  });

  describe('POST /api/v1/income-types', () => {
    it('should create income type', async () => {
      const input = { name: 'Freelance', description: 'Side job' };
      const created = { id: '123e4567-e89b-12d3-a456-426614174002', ...input };
      (incomeTypeRepository.create as jest.Mock).mockResolvedValue(created);

      const res = await request(app).post('/api/v1/income-types').send(input);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(created);
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app).post('/api/v1/income-types').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/incomes', () => {
    it('should create income', async () => {
      const input = {
        accountId: '123e4567-e89b-12d3-a456-426614174003',
        incomeTypeId: '123e4567-e89b-12d3-a456-426614174004',
        amount: 500,
        date: '2023-01-01',
      };
      
      (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue({ id: input.accountId });
      (incomeTypeRepository.findById as jest.Mock).mockResolvedValue({ id: input.incomeTypeId });
      (incomeRepository.create as jest.Mock).mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174005', ...input });

      const res = await request(app).post('/api/v1/incomes').send(input);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', '123e4567-e89b-12d3-a456-426614174005');
    });
  });
});
