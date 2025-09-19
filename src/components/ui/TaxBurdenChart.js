import React from 'react';
import { TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const TaxBurdenChart = ({ taxResult, language }) => {
  const chartData = [
    {
      name: language === 'zh' ? '联邦税' : language === 'es' ? 'Impuesto Federal' : 'Federal Tax',
      value: taxResult.federalTax,
      color: '#2563eb'
    },
    {
      name: language === 'zh' ? '州税' : language === 'es' ? 'Impuesto Estatal' : 'State Tax',
      value: taxResult.marylandTax,
      color: '#dc2626'
    },
    {
      name: language === 'zh' ? '地方税' : language === 'es' ? 'Impuesto Local' : 'Local Tax',
      value: taxResult.localTax,
      color: '#059669'
    },
    {
      name: language === 'zh' ? '税后收入' : language === 'es' ? 'Ingresos Después de Impuestos' : 'After-Tax Income',
      value: taxResult.afterTaxIncome,
      color: '#10b981'
    }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.payload.color }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            {((data.value / taxResult.adjustedGrossIncome) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        {language === 'zh' ? '税负分布' : language === 'es' ? 'Distribución de Impuestos' : 'Tax Burden Distribution'}
      </h3>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color, fontSize: '12px' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-600">{item.name}</span>
            </div>
            <span className="font-semibold">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxBurdenChart;