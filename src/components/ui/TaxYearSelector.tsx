import React from 'react';
import { Select } from 'antd';
import { useTaxYearContext } from '../../contexts/TaxDataContext';
import type { SupportedTaxYear } from '../../engine/rules/taxYearConfig';

const { Option } = Select;

interface TaxYearSelectorProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Tax Year Selector Component
 *
 * Allows users to select which tax year to calculate for.
 * Integrates with TaxYearContext to update calculations when the year changes.
 */
export const TaxYearSelector: React.FC<TaxYearSelectorProps> = ({ className, style }) => {
  const { taxYear, setTaxYear, availableYears, isCurrentYearSupported } = useTaxYearContext();

  const handleChange = (value: number) => {
    setTaxYear(value as SupportedTaxYear);
  };

  return (
    <div className={className} style={style}>
      <label htmlFor="tax-year-selector" style={{ marginRight: '8px', fontWeight: 500 }}>
        Tax Year:
      </label>
      <Select
        id="tax-year-selector"
        value={taxYear}
        onChange={handleChange}
        style={{ width: 120 }}
        aria-label="Select tax year"
      >
        {availableYears.map((year) => (
          <Option key={year} value={year}>
            {year}
            {!isCurrentYearSupported && year === new Date().getFullYear() && ' (Preview)'}
          </Option>
        ))}
      </Select>
    </div>
  );
};
