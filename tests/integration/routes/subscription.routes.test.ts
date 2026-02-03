import request from 'supertest';
import { createApp } from '../../../src/app';
import { subscriptionRepository } from '../../../src/repositories/subscription.repository';

// Mock Auth Middleware
jest.mock('../../../src/middleware/auth.middleware', () => ({
  authenticateUser: (req: any, _res: any, next: any) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' };
    req.accessToken = 'mock-token';
    next();
  },
}));

// Mock Repository
jest.mock('../../../src/repositories/subscription.repository', () => ({
  subscriptionRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findActive: jest.fn(),
    findUpcoming: jest.fn(),
  },
}));

// Mock Account Service
jest.mock('../../../src/services/account.service', () => ({
  accountService: {
    validateAccountOwnership: jest.fn(),
  },
}));

const app = createApp();

describe('Subscription Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/subscriptions', () => {
    it('should return 200 and subscriptions', async () => {
      const mockSubs = [{ id: '123e4567-e89b-12d3-a456-426614174001', name: 'Netflix' }];
      (subscriptionRepository.findAll as jest.Mock).mockResolvedValue({
        subscriptions: mockSubs,
        total: 1,
      });

      const res = await request(app).get('/api/v1/subscriptions');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual(mockSubs);
    });
  });

  describe('POST /api/v1/subscriptions', () => {
    it('should create subscription', async () => {
      const input = {
        accountId: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Spotify',
        amount: 10,
        billingCycle: 'monthly',
        nextBillingDate: '2023-02-01',
      };
      const created = { id: '123e4567-e89b-12d3-a456-426614174002', ...input };
      (subscriptionRepository.create as jest.Mock).mockResolvedValue(created);

      const res = await request(app).post('/api/v1/subscriptions').send(input);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(created);
    });
  });
});
