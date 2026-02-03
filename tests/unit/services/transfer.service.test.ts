import { transferService } from '../../../src/services/transfer.service';
import { transferRepository } from '../../../src/repositories/transfer.repository';
import { accountService } from '../../../src/services/account.service';
import { ValidationError, InsufficientBalanceError } from '../../../src/middleware/error.middleware';

// Mock dependencies
jest.mock('../../../src/repositories/transfer.repository', () => ({
  transferRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../../src/services/account.service', () => ({
  accountService: {
    validateAccountOwnership: jest.fn(),
  },
}));

describe('Transfer Service', () => {
  const mockUserId = 'user-123';
  const mockToken = 'token-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransfer', () => {
    const input = {
      fromAccountId: 'acc-1',
      toAccountId: 'acc-2',
      amount: 100,
      date: '2023-01-01',
    };

    it('should create transfer', async () => {
      const mockCreated = { id: 'tr-1', ...input };
      
      // Mock account validation
      (accountService.validateAccountOwnership as jest.Mock).mockImplementation((_uid, accId) => {
        if (accId === 'acc-1') return Promise.resolve({ id: 'acc-1', balance: 500 });
        if (accId === 'acc-2') return Promise.resolve({ id: 'acc-2' });
        return Promise.reject();
      });

      (transferRepository.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await transferService.createTransfer(mockUserId, input, mockToken);

      expect(result).toEqual(mockCreated);
    });

    it('should throw ValidationError if same account', async () => {
      await expect(
        transferService.createTransfer(mockUserId, { ...input, toAccountId: 'acc-1' }, mockToken)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw InsufficientBalanceError', async () => {
      (accountService.validateAccountOwnership as jest.Mock).mockImplementation((_uid, accId) => {
        if (accId === 'acc-1') return Promise.resolve({ id: 'acc-1', balance: 50 }); // Less than 100
        if (accId === 'acc-2') return Promise.resolve({ id: 'acc-2' });
        return Promise.reject();
      });

      await expect(
        transferService.createTransfer(mockUserId, input, mockToken)
      ).rejects.toThrow(InsufficientBalanceError);
    });
  });
});
