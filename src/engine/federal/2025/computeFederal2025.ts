import { TaxPayerInput, FederalResult2025 } from '../../types';
import { computeFederal } from '../computeFederal';

export function computeFederal2025(input: TaxPayerInput): FederalResult2025 {
  return computeFederal(2025, input);
}
