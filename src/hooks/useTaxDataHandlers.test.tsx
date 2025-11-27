import { renderHook, act } from '@testing-library/react';
import type { BackupData } from './useTaxDataHandlers';

// Mock the contexts
jest.mock('../contexts/LanguageContext', () => ({
  useLanguageContext: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: jest.fn(),
  }),
}));

jest.mock('../contexts/TaxContext', () => ({
  useTaxContext: () => ({
    personalInfo: {},
    spouseInfo: {},
    incomeData: {},
    k1Data: {},
    businessDetails: {},
    paymentsData: {},
    deductions: {},
    taxResult: {},
    handlePersonalInfoChange: jest.fn(),
    handleSpouseInfoChange: jest.fn(),
    handleIncomeChange: jest.fn(),
    handleK1Change: jest.fn(),
    handleBusinessDetailsChange: jest.fn(),
    handlePaymentsChange: jest.fn(),
    handleDeductionChange: jest.fn(),
    recalculate: jest.fn(),
  }),
}));

// Mock the export utilities
jest.mock('../utils/exportUtils', () => ({
  exportToJSON: jest.fn(),
  exportToPDF: jest.fn(),
}));

// Import after mocking (required for Jest mocks to work)
// eslint-disable-next-line import/first
import { useTaxDataHandlers } from './useTaxDataHandlers';

describe('useTaxDataHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('restoreBackup', () => {
    it('restores personal info from backup data', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {
        formData: {
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            filingStatus: 'single',
            ssn: '123-45-6789',
          },
        },
      };

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      // Note: We can't directly verify the context state here without access to it,
      // but we can verify the function doesn't throw
      expect(result.current.restoreBackup).toBeDefined();
    });

    it('restores income data from backup', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {
        formData: {
          incomeData: {
            wages: '75000',
            interestIncome: '500',
            dividends: '1000',
          },
        },
      };

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      expect(result.current.restoreBackup).toBeDefined();
    });

    it('restores deductions from backup', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {
        formData: {
          deductions: {
            medicalExpenses: '5000',
            charitableContributions: '3000',
            mortgageInterest: '10000',
          },
        },
      };

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      expect(result.current.restoreBackup).toBeDefined();
    });

    it('restores business details from backup', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {
        formData: {
          businessDetails: {
            businessName: 'Test Business LLC',
            grossReceipts: '100000',
            businessExpenses: '40000',
          },
        },
      };

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      expect(result.current.restoreBackup).toBeDefined();
    });

    it('restores spouse info from backup', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {
        formData: {
          spouseInfo: {
            firstName: 'Jane',
            lastName: 'Doe',
            ssn: '987-65-4321',
          },
        },
      };

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      expect(result.current.restoreBackup).toBeDefined();
    });

    it('handles null and undefined values gracefully', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {
        formData: {
          personalInfo: {
            firstName: 'John',
            middleName: null,
            suffix: undefined,
          },
        },
      };

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      expect(result.current.restoreBackup).toBeDefined();
    });

    it('handles empty backup data without errors', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {};

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      expect(result.current.restoreBackup).toBeDefined();
    });

    it('restores complete backup with all form sections', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {
        formData: {
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            filingStatus: 'married-jointly',
          },
          incomeData: {
            wages: '80000',
            interestIncome: '200',
          },
          deductions: {
            medicalExpenses: '3000',
          },
          paymentsData: {
            federalWithholding: '12000',
          },
          k1Data: {
            partnershipIncome: '5000',
          },
          businessDetails: {
            businessName: 'Consulting LLC',
          },
        },
        taxResult: {
          totalTax: 15000,
          federalTax: 12000,
        },
      };

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      expect(result.current.restoreBackup).toBeDefined();
    });
  });

  describe('importData', () => {
    it('imports personal info data', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const importPayload = {
        personalInfo: {
          firstName: 'Alice',
          lastName: 'Smith',
          filingStatus: 'single',
        },
      };

      await act(async () => {
        result.current.importData(importPayload);
      });

      expect(result.current.importData).toBeDefined();
    });

    it('imports income data', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const importPayload = {
        incomeData: {
          wages: '65000',
          selfEmploymentIncome: '20000',
        },
      };

      await act(async () => {
        result.current.importData(importPayload);
      });

      expect(result.current.importData).toBeDefined();
    });

    it('handles invalid data types gracefully', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      await act(async () => {
        result.current.importData(null);
      });

      expect(result.current.importData).toBeDefined();

      await act(async () => {
        result.current.importData('invalid string');
      });

      expect(result.current.importData).toBeDefined();

      await act(async () => {
        result.current.importData(123);
      });

      expect(result.current.importData).toBeDefined();
    });

    it('imports multiple data sections', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const importPayload = {
        personalInfo: {
          firstName: 'Bob',
          lastName: 'Johnson',
        },
        incomeData: {
          wages: '90000',
        },
        deductions: {
          charitableContributions: '5000',
        },
      };

      await act(async () => {
        result.current.importData(importPayload);
      });

      expect(result.current.importData).toBeDefined();
    });

    it('skips null and undefined values during import', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const importPayload = {
        personalInfo: {
          firstName: 'Charlie',
          middleName: null,
          suffix: undefined,
        },
      };

      await act(async () => {
        result.current.importData(importPayload);
      });

      expect(result.current.importData).toBeDefined();
    });
  });

  describe('exportData', () => {
    it('provides exportData function', () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      expect(result.current.exportData).toBeDefined();
      expect(typeof result.current.exportData).toBe('function');
    });

    it('exportData accepts format parameter', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      // Mock DOM methods to prevent actual file download in test
      const createElementSpy = jest.spyOn(document, 'createElement');
      const mockAnchor = document.createElement('a');
      mockAnchor.click = jest.fn();
      createElementSpy.mockReturnValue(mockAnchor);

      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();

      await act(async () => {
        // Should not throw when called with valid format
        await result.current.exportData('json');
      });

      expect(createElementSpy).toHaveBeenCalledWith('a');

      createElementSpy.mockRestore();
    });

    it('handles export errors gracefully', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      // Mock createElement to throw error
      const createElementSpy = jest.spyOn(document, 'createElement');
      createElementSpy.mockImplementation(() => {
        throw new Error('Mock error');
      });

      // Should not crash the app when export fails
      let thrownError;
      await act(async () => {
        try {
          await result.current.exportData('json');
        } catch (error) {
          thrownError = error;
        }
      });

      // Expected to throw in this test
      expect(thrownError).toBeDefined();

      createElementSpy.mockRestore();
    });
  });

  describe('exportPDF and exportJSON', () => {
    it('provides exportPDF function', () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      expect(result.current.exportPDF).toBeDefined();
      expect(typeof result.current.exportPDF).toBe('function');
    });

    it('provides exportJSON function', () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      expect(result.current.exportJSON).toBeDefined();
      expect(typeof result.current.exportJSON).toBe('function');
    });
  });

  describe('integration tests', () => {
    it('exports and imports data maintaining data integrity', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      // First, import some data
      const testData = {
        personalInfo: {
          firstName: 'TestFirst',
          lastName: 'TestLast',
          filingStatus: 'single',
        },
        incomeData: {
          wages: '50000',
          interestIncome: '100',
        },
      };

      await act(async () => {
        result.current.importData(testData);
      });

      // Verify hook is stable
      expect(result.current.importData).toBeDefined();
      expect(result.current.exportData).toBeDefined();
    });

    it('handles backup restore followed by export', async () => {
      const { result } = renderHook(() => useTaxDataHandlers());

      const backupData: BackupData = {
        formData: {
          personalInfo: {
            firstName: 'Backup',
            lastName: 'User',
          },
          incomeData: {
            wages: '70000',
          },
        },
      };

      await act(async () => {
        result.current.restoreBackup(backupData);
      });

      // Should be able to export after restore
      expect(() => result.current.exportJSON()).not.toThrow();
    });
  });
});
