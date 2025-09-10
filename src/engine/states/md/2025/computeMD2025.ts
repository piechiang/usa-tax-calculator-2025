import { TaxPayerInput, StateResult, FederalResult2025 } from '../../../types';
import { computeMD } from '../computeMD';

export function computeMD2025(input: TaxPayerInput, federalResult: FederalResult2025): StateResult {
  return computeMD(2025, input, federalResult);
}

export { isMarylandResident, getMarylandCounties, getMDLocalRate } from '../computeMD';
