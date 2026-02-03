import { subscriptionService } from '../../../src/services/subscription.service';
import { subscriptionRepository } from '../../../src/repositories/subscription.repository';
import { accountService } from '../../../src/services/account.service';
import { ValidationError } from '../../../src/middleware/error.middleware';

// Mock dependencies
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

jest.mock('../../../src/services/account.service', () => ({
  accountService: {
    validateAccountOwnership: jest.fn(),
  },
}));

describe('Subscription Service', () => {
  const mockUserId = 'user-123';
  const mockToken = 'token-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should create subscription', async () => {
      const input = {
        accountId: 'acc-1',
        name: 'Netflix',
        amount: 15,
        billingCycle: 'monthly' as const,
        nextBillingDate: '2023-01-01',
      };
      const mockCreated = { id: 'sub-1', ...input };
      
      (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue({ id: 'acc-1' });
      (subscriptionRepository.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await subscriptionService.createSubscription(mockUserId, input, mockToken);

      expect(result).toEqual(mockCreated);
    });

    it('should throw ValidationError if amount is non-positive', async () => {
      const input = {
        accountId: 'acc-1',
        name: 'Netflix',
        amount: 0,
        billingCycle: 'monthly' as const,
        nextBillingDate: '2023-01-01',
      };
      
      (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue({ id: 'acc-1' });

      await expect(
        subscriptionService.createSubscription(mockUserId, input, mockToken)
      ).rejects.toThrow(ValidationError);
    });
  });
});
