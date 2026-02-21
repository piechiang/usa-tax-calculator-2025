import { useCallback } from 'react';

import { useLanguageContext } from '../contexts/LanguageContext';
import { useTaxContext } from '../contexts/TaxContext';
import { exportToJSON, exportToPDF } from '../utils/exportUtils';
import { importDataSchema, backupDataSchema, type BackupData } from '../utils/schemas';
import { logger } from '../utils/logger';

export interface UseTaxDataHandlersResult {
  exportPDF: () => void;
  exportJSON: () => void;
  restoreBackup: (data: BackupData) => void;
  importData: (data: unknown) => void;
  exportData: (format: string) => Promise<void>;
}

export function useTaxDataHandlers(): UseTaxDataHandlersResult {
  const { t } = useLanguageContext();
  const {
    personalInfo,
    spouseInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    taxResult,
    handlePersonalInfoChange,
    handleSpouseInfoChange,
    handleIncomeChange,
    handleK1Change,
    handleBusinessDetailsChange,
    handlePaymentsChange,
    handleDeductionChange,
    recalculate,
  } = useTaxContext();

  const exportPDF = useCallback(() => {
    exportToPDF(taxResult, t);
  }, [taxResult, t]);

  const exportJSON = useCallback(() => {
    exportToJSON(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      taxResult
    );
  }, [personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, taxResult]);

  const restoreBackup = useCallback(
    (data: unknown) => {
      try {
        // Validate the backup data structure using Zod schema
        const validatedData = backupDataSchema.parse(data);

        if (validatedData.formData?.personalInfo) {
          Object.entries(validatedData.formData.personalInfo).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handlePersonalInfoChange(key as keyof typeof personalInfo, String(value));
            }
          });
        }

        if (validatedData.formData?.spouseInfo) {
          Object.entries(validatedData.formData.spouseInfo).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleSpouseInfoChange(key as keyof typeof spouseInfo, String(value));
            }
          });
        }

        if (validatedData.formData?.incomeData) {
          Object.entries(validatedData.formData.incomeData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleIncomeChange(key, String(value));
            }
          });
        }

        if (validatedData.formData?.k1Data) {
          Object.entries(validatedData.formData.k1Data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleK1Change(key, String(value));
            }
          });
        }

        if (validatedData.formData?.businessDetails) {
          Object.entries(validatedData.formData.businessDetails).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleBusinessDetailsChange(key as string, String(value));
            }
          });
        }

        if (validatedData.formData?.paymentsData) {
          Object.entries(validatedData.formData.paymentsData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handlePaymentsChange(key, String(value));
            }
          });
        }

        if (validatedData.formData?.deductions) {
          Object.entries(validatedData.formData.deductions).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleDeductionChange(key as keyof typeof deductions, String(value));
            }
          });
        }

        recalculate();
      } catch (error) {
        logger.error(
          'Error restoring backup data (validation failed)',
          error instanceof Error ? error : undefined
        );
        throw new Error('Invalid backup data format. Please check the backup file.');
      }
    },
    [
      handleBusinessDetailsChange,
      handleDeductionChange,
      handleIncomeChange,
      handleK1Change,
      handlePaymentsChange,
      handlePersonalInfoChange,
      handleSpouseInfoChange,
      recalculate,
    ]
  );

  const importData = useCallback(
    (data: unknown) => {
      try {
        // Validate the import data structure using Zod schema
        const validatedData = importDataSchema.parse(data);
        const payload = validatedData;

        if (payload.personalInfo) {
          Object.entries(payload.personalInfo).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handlePersonalInfoChange(key as keyof typeof personalInfo, String(value));
            }
          });
        }

        if (payload.spouseInfo) {
          Object.entries(payload.spouseInfo).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleSpouseInfoChange(key as keyof typeof spouseInfo, String(value));
            }
          });
        }

        if (payload.incomeData) {
          Object.entries(payload.incomeData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleIncomeChange(key, String(value));
            }
          });
        }

        if (payload.k1Data) {
          Object.entries(payload.k1Data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleK1Change(key, String(value));
            }
          });
        }

        if (payload.businessDetails) {
          Object.entries(payload.businessDetails).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleBusinessDetailsChange(key as string, String(value));
            }
          });
        }

        if (payload.paymentsData) {
          Object.entries(payload.paymentsData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handlePaymentsChange(key, String(value));
            }
          });
        }

        if (payload.deductions) {
          Object.entries(payload.deductions).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              handleDeductionChange(key as keyof typeof deductions, String(value));
            }
          });
        }
      } catch (error) {
        logger.error('Invalid import data format', error instanceof Error ? error : undefined);
        throw new Error('Invalid data format. Please check the imported file.');
      }
    },
    [
      handleBusinessDetailsChange,
      handleDeductionChange,
      handleIncomeChange,
      handleK1Change,
      handlePaymentsChange,
      handlePersonalInfoChange,
      handleSpouseInfoChange,
    ]
  );

  const exportData = useCallback(
    async (format: string) => {
      const exportPayload = {
        personalInfo,
        spouseInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        taxResult,
        timestamp: new Date().toISOString(),
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `tax-data-${new Date().getFullYear()}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }
    },
    [
      businessDetails,
      deductions,
      incomeData,
      k1Data,
      paymentsData,
      personalInfo,
      spouseInfo,
      taxResult,
    ]
  );

  return {
    exportPDF,
    exportJSON,
    restoreBackup,
    importData,
    exportData,
  };
}
