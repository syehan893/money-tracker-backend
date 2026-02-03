import { accountService } from '../../../src/services/account.service';
import { accountRepository } from '../../../src/repositories/account.repository';
import { NotFoundError } from '../../../src/middleware/error.middleware';

// Mock dependencies
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

describe('Account Service', () => {
  const mockUserId = 'user-123';
  const mockToken = 'token-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create account', async () => {
      const input = { name: 'Bank', accountType: 'saving' as const, balance: 100, currency: 'USD' };
      const mockCreated = { id: '1', ...input };
      (accountRepository.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await accountService.createAccount(mockUserId, input, mockToken);

      expect(result).toEqual(mockCreated);
    });
  });

  describe('validateAccountOwnership', () => {
    it('should return account if owned by user', async () => {
      const mockAccount = { id: 'acc-1', user_id: mockUserId, is_active: true };
      (accountRepository.findById as jest.Mock).mockResolvedValue(mockAccount);

      const result = await accountService.validateAccountOwnership(mockUserId, 'acc-1', mockToken);

      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundError if account not found', async () => {
      (accountRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        accountService.validateAccountOwnership(mockUserId, 'acc-1', mockToken)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
