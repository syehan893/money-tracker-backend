import { expenseTypeService, expenseService } from '../../../src/services/expense.service';
import { expenseTypeRepository, expenseRepository } from '../../../src/repositories/expense.repository';
import { accountService } from '../../../src/services/account.service';
import { InsufficientBalanceError } from '../../../src/middleware/error.middleware';

// Mock dependencies
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

jest.mock('../../../src/services/account.service', () => ({
  accountService: {
    validateAccountOwnership: jest.fn(),
    getAccountById: jest.fn(),
  },
}));

describe('Expense Services', () => {
  const mockUserId = 'user-123';
  const mockToken = 'token-123';
  const mockDate = new Date().toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ExpenseTypeService', () => {
    describe('createExpenseType', () => {
      it('should create expense type', async () => {
        const input = { name: 'Food', budgetAmount: 500 };
        const mockCreated = { id: '1', ...input };
        (expenseTypeRepository.create as jest.Mock).mockResolvedValue(mockCreated);

        const result = await expenseTypeService.createExpenseType(mockUserId, input, mockToken);

        expect(result).toEqual(mockCreated);
      });
    });
  });

  describe('ExpenseService', () => {
    describe('createExpense', () => {
      const input = {
        accountId: 'acc-1',
        expenseTypeId: 'type-1',
        amount: 100,
        date: mockDate,
        description: 'Lunch',
      };

      it('should create expense successfully', async () => {
        const mockAccount = { id: 'acc-1', balance: 1000 };
        const mockExpense = { id: 'exp-1', ...input };

        (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue(mockAccount);
        (expenseTypeRepository.findById as jest.Mock).mockResolvedValue({ id: 'type-1' });
        (expenseRepository.create as jest.Mock).mockResolvedValue(mockExpense);

        const result = await expenseService.createExpense(mockUserId, input, mockToken);

        expect(result).toEqual(mockExpense);
      });

      it('should throw InsufficientBalanceError', async () => {
        const mockAccount = { id: 'acc-1', balance: 50 };
        (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue(mockAccount);

        await expect(
          expenseService.createExpense(mockUserId, input, mockToken)
        ).rejects.toThrow(InsufficientBalanceError);
      });
    });

    describe('updateExpense', () => {
      it('should check balance when increasing amount', async () => {
        const existing = { id: 'exp-1', amount: 100, account_id: 'acc-1' };
        const updateData = { amount: 200 };
        const mockAccount = { id: 'acc-1', balance: 50 }; // Available: 50 + 100 = 150 < 200

        (expenseRepository.findById as jest.Mock).mockResolvedValue(existing);
        (accountService.getAccountById as jest.Mock).mockResolvedValue(mockAccount);

        await expect(
          expenseService.updateExpense(mockUserId, 'exp-1', updateData, mockToken)
        ).rejects.toThrow(InsufficientBalanceError);
      });
    });
  });
});
