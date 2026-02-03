import { incomeTypeService, incomeService } from '../../../src/services/income.service';
import { incomeTypeRepository, incomeRepository } from '../../../src/repositories/income.repository';
import { accountService } from '../../../src/services/account.service';
import { NotFoundError, ValidationError } from '../../../src/middleware/error.middleware';

// Mock dependencies
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

jest.mock('../../../src/services/account.service', () => ({
  accountService: {
    validateAccountOwnership: jest.fn(),
  },
}));

describe('Income Services', () => {
  const mockUserId = 'user-123';
  const mockToken = 'token-123';
  const mockDate = new Date().toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('IncomeTypeService', () => {
    describe('getIncomeTypes', () => {
      it('should return all income types', async () => {
        const mockTypes = [{ id: '1', name: 'Salary', user_id: mockUserId }];
        (incomeTypeRepository.findAll as jest.Mock).mockResolvedValue(mockTypes);

        const result = await incomeTypeService.getIncomeTypes(mockUserId, mockToken);

        expect(result).toEqual(mockTypes);
        expect(incomeTypeRepository.findAll).toHaveBeenCalledWith(mockUserId, mockToken);
      });
    });

    describe('getIncomeTypeById', () => {
      it('should return income type if exists', async () => {
        const mockType = { id: '1', name: 'Salary' };
        (incomeTypeRepository.findById as jest.Mock).mockResolvedValue(mockType);

        const result = await incomeTypeService.getIncomeTypeById(mockUserId, '1', mockToken);

        expect(result).toEqual(mockType);
      });

      it('should throw NotFoundError if not found', async () => {
        (incomeTypeRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(
          incomeTypeService.getIncomeTypeById(mockUserId, '1', mockToken)
        ).rejects.toThrow(NotFoundError);
      });
    });

    describe('createIncomeType', () => {
      it('should create income type', async () => {
        const input = { name: 'Salary', description: 'Monthly' };
        const mockCreated = { id: '1', ...input };
        (incomeTypeRepository.create as jest.Mock).mockResolvedValue(mockCreated);

        const result = await incomeTypeService.createIncomeType(mockUserId, input, mockToken);

        expect(result).toEqual(mockCreated);
        expect(incomeTypeRepository.create).toHaveBeenCalledWith(
          mockUserId,
          { name: 'Salary', description: 'Monthly', target_amount: null },
          mockToken
        );
      });
    });
  });

  describe('IncomeService', () => {
    describe('createIncome', () => {
      const input = {
        accountId: 'acc-1',
        incomeTypeId: 'type-1',
        amount: 1000,
        date: mockDate,
        description: 'Salary',
      };

      it('should create income successfully', async () => {
        const mockIncome = { id: 'inc-1', ...input };
        
        // Mock successful account validation
        (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue({ id: 'acc-1' });
        // Mock income type exists
        (incomeTypeRepository.findById as jest.Mock).mockResolvedValue({ id: 'type-1' });
        // Mock create
        (incomeRepository.create as jest.Mock).mockResolvedValue(mockIncome);

        const result = await incomeService.createIncome(mockUserId, input, mockToken);

        expect(result).toEqual(mockIncome);
        expect(accountService.validateAccountOwnership).toHaveBeenCalledWith(mockUserId, 'acc-1', mockToken);
      });

      it('should throw ValidationError if amount is negative', async () => {
        await expect(
          incomeService.createIncome(mockUserId, { ...input, amount: -100 }, mockToken)
        ).rejects.toThrow(ValidationError);
      });

      it('should throw if income type not found', async () => {
        (accountService.validateAccountOwnership as jest.Mock).mockResolvedValue({ id: 'acc-1' });
        (incomeTypeRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(
          incomeService.createIncome(mockUserId, input, mockToken)
        ).rejects.toThrow(ValidationError);
      });
    });

    describe('getIncomes', () => {
      it('should return paginated incomes', async () => {
        const mockIncomes = [{ id: '1', amount: 100 }];
        (incomeRepository.findAll as jest.Mock).mockResolvedValue({
          incomes: mockIncomes,
          total: 1,
        });

        const result = await incomeService.getIncomes(mockUserId, mockToken, { page: 1, limit: 10 });

        expect(result.items).toEqual(mockIncomes);
        expect(result.pagination.total).toBe(1);
      });
    });
  });
});
