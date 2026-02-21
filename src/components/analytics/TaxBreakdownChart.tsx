import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TaxResult } from '../../types/CommonTypes';
import { formatCurrency } from '../../utils/formatters';

interface TaxBreakdownChartProps {
  taxResult: TaxResult;
}

export const TaxBreakdownChart: React.FC<TaxBreakdownChartProps> = ({ taxResult }) => {
  const data = useMemo(() => {
    // Ensure we don't have negative values for the chart
    const federalTax = Math.max(0, taxResult.federalTax || 0);
    const stateTax = Math.max(0, taxResult.stateTax || 0);
    const afterTaxIncome = Math.max(0, taxResult.afterTaxIncome || 0);

    // If we have no data, show a placeholder segment
    if (federalTax === 0 && stateTax === 0 && afterTaxIncome === 0) {
      return [{ name: 'No Data', value: 1, color: '#E5E7EB' }]; // gray-200
    }

    return [
      { name: 'Federal Tax', value: federalTax, color: '#EF4444' }, // status-error (Red)
      { name: 'State Tax', value: stateTax, color: '#F59E0B' }, // status-warning (Amber)
      { name: 'Net Pay', value: afterTaxIncome, color: '#10B981' }, // status-success (Green)
    ];
  }, [taxResult]);

  const hasData =
    taxResult.federalTax > 0 || taxResult.stateTax > 0 || taxResult.afterTaxIncome > 0;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '0.5rem',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          {hasData && <Legend verticalAlign="bottom" height={36} iconType="circle" />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
