// Main exports - backward compatible
export { TaxProvider, useTaxContext } from './TaxContext';
export type { TaxContextValue, TaxCalculatorSnapshot } from './TaxContext';

// Auth exports
export { AuthProvider, useAuth } from './AuthContext';
export type { UserProfile, UserPreferences } from './AuthContext';

// Fine-grained context hooks for better performance
export {
  // Context hooks (full context access)
  usePersonalInfoContext,
  useIncomeContext,
  useDeductionContext,
  useTaxResultContext,
  useValidationContext,
  useSnapshotContext,

  // Selector hooks (specific data access - preferred for components)
  usePersonalInfo,
  useSpouseInfo,
  useIncomeData,
  useK1Data,
  useBusinessDetails,
  usePaymentsData,
  useDeductions,
  useTaxResult,
  useFilingComparison,
  useTaxOptimizations,
} from './TaxDataContext';

// Provider for fine-grained contexts (use TaxProvider for backward compatibility)
export { TaxDataProvider } from './TaxDataContext';
