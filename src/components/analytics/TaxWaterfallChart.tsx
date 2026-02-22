import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TaxResult } from '../../types/CommonTypes';
import { formatCurrency } from '../../utils/formatters';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface WaterfallBarDatum {
  name: string;
  transparentBase: number;
  amount: number;
  fill: string;
  isSubtotal: boolean;
  tooltip: string;
}

interface WaterfallTooltipPayload {
  name: string;
  value: number;
  payload: WaterfallBarDatum;
  fill: string;
}

interface WaterfallTooltipProps {
  active?: boolean;
  payload?: WaterfallTooltipPayload[];
}

interface CustomTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TaxWaterfallChartProps {
  taxResult: TaxResult;
}

// ---------------------------------------------------------------------------
// Data transformation
// ---------------------------------------------------------------------------

function buildWaterfallData(taxResult: TaxResult): WaterfallBarDatum[] {
  // TODO: Bar 1 is AGI. True gross income (AGI + above-line deductions) is not
  // available on TaxResult. Adding a grossIncome prop in future would allow an
  // "Adjustments" bar between gross income and AGI.
  const agi = Math.max(0, taxResult.adjustedGrossIncome || 0);

  const deduction =
    taxResult.deductionType === 'itemized'
      ? Math.max(0, taxResult.itemizedDeduction || 0)
      : Math.max(0, taxResult.standardDeduction || 0);

  const taxableIncome = Math.max(0, taxResult.taxableIncome || 0);
  const federalTax = Math.max(0, taxResult.federalTax || 0);
  const stateTax = Math.max(0, taxResult.stateTax || 0);
  const localTax = Math.max(0, taxResult.localTax || 0);
  const afterTaxIncome = Math.max(0, taxResult.afterTaxIncome || 0);

  // Additional taxes (SE tax, NIIT, Medicare surtax)
  const seTax = Math.max(0, taxResult.selfEmploymentTax ?? taxResult.additionalTaxes?.seTax ?? 0);
  const niit = Math.max(
    0,
    taxResult.netInvestmentIncomeTax ?? taxResult.additionalTaxes?.niit ?? 0
  );
  const addlMedicare = Math.max(
    0,
    taxResult.additionalMedicareTax ?? taxResult.additionalTaxes?.medicareSurtax ?? 0
  );
  const additionalTaxTotal = seTax + niit + addlMedicare;

  // Credits: try detailed credits object first, fall back to legacy individual fields
  const ctc = taxResult.credits?.ctc ?? taxResult.childTaxCredit ?? 0;
  const eitc = taxResult.credits?.eitc ?? taxResult.earnedIncomeCredit ?? 0;
  const edu =
    (taxResult.credits?.aotc ?? 0) +
    (taxResult.credits?.llc ?? 0) +
    ((!taxResult.credits?.aotc && !taxResult.credits?.llc && taxResult.educationCredits) || 0);
  const other =
    (taxResult.credits?.otherNonRefundable ?? 0) + (taxResult.credits?.otherRefundable ?? 0);
  const totalCredits = Math.max(0, ctc + eitc + edu + other);

  const bars: WaterfallBarDatum[] = [];

  // Bar 1: AGI — subtotal, full-height column from axis
  bars.push({
    name: 'AGI',
    transparentBase: 0,
    amount: agi,
    fill: '#3B82F6',
    isSubtotal: true,
    tooltip: 'Adjusted Gross Income',
  });

  // Bar 2: Deduction — floats at taxableIncome, spans up by deduction amount
  bars.push({
    name: 'Deduction',
    transparentBase: taxableIncome,
    amount: deduction,
    fill: '#EF4444',
    isSubtotal: false,
    tooltip: taxResult.deductionType === 'itemized' ? 'Itemized Deduction' : 'Standard Deduction',
  });

  // Bar 3: Taxable Income — subtotal
  bars.push({
    name: 'Taxable\nIncome',
    transparentBase: 0,
    amount: taxableIncome,
    fill: '#3B82F6',
    isSubtotal: true,
    tooltip: 'Taxable Income',
  });

  // Bar 4: Federal Tax — floats above everything below it
  bars.push({
    name: 'Federal\nTax',
    transparentBase: afterTaxIncome + stateTax + localTax + additionalTaxTotal + totalCredits,
    amount: federalTax,
    fill: '#EF4444',
    isSubtotal: false,
    tooltip: 'Federal Income Tax',
  });

  // Bar 5: Additional taxes — only if present
  if (additionalTaxTotal > 0) {
    bars.push({
      name: "Add'l\nTaxes",
      transparentBase: afterTaxIncome + stateTax + localTax + totalCredits,
      amount: additionalTaxTotal,
      fill: '#EF4444',
      isSubtotal: false,
      tooltip: 'SE Tax / NIIT / Medicare Surtax',
    });
  }

  // Bar 6: Credits — positive flow (green, floats above state/local)
  if (totalCredits > 0) {
    bars.push({
      name: 'Credits',
      transparentBase: afterTaxIncome + stateTax + localTax,
      amount: totalCredits,
      fill: '#10B981',
      isSubtotal: false,
      tooltip: 'Total Tax Credits',
    });
  }

  // Bar 7: State Tax — only if applicable
  if (stateTax > 0) {
    bars.push({
      name: 'State\nTax',
      transparentBase: afterTaxIncome + localTax,
      amount: stateTax,
      fill: '#EF4444',
      isSubtotal: false,
      tooltip: 'State Income Tax',
    });
  }

  // Bar 8: Local Tax — only if applicable
  if (localTax > 0) {
    bars.push({
      name: 'Local\nTax',
      transparentBase: afterTaxIncome,
      amount: localTax,
      fill: '#EF4444',
      isSubtotal: false,
      tooltip: 'Local / County Tax',
    });
  }

  // Bar 9: Take Home — subtotal, full-height column from axis
  bars.push({
    name: 'Take\nHome',
    transparentBase: 0,
    amount: afterTaxIncome,
    fill: '#10B981',
    isSubtotal: true,
    tooltip: 'After-Tax Income',
  });

  return bars;
}

// ---------------------------------------------------------------------------
// Static sub-renderers (defined outside component to avoid recreation on render)
// ---------------------------------------------------------------------------

/** Renders the tooltip, filtering out the invisible spacer bar. */
function renderWaterfallTooltip({ active, payload }: WaterfallTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload.find((p) => p.name === 'amount');
  if (!entry) return null;
  return (
    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-lg text-sm min-w-[160px]">
      <p className="font-semibold text-gray-800 mb-1">{entry.payload.tooltip}</p>
      <p className="font-bold" style={{ color: entry.fill }}>
        {formatCurrency(entry.payload.amount)}
      </p>
    </div>
  );
}

/** Factory: returns an XAxis tick renderer that closes over the waterfall data. */
function makeXTickRenderer(waterfallData: WaterfallBarDatum[]) {
  return function XTick({ x = 0, y = 0, payload }: CustomTickProps) {
    const datum = waterfallData.find((d) => d.name === payload?.value);
    const color = datum?.isSubtotal ? '#3B82F6' : (datum?.fill ?? '#6B7280');
    const lines = (payload?.value ?? '').split('\n');
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, i) => (
          <text
            key={i}
            x={0}
            dy={i * 14 + 12}
            textAnchor="middle"
            fill={color}
            fontSize={11}
            fontWeight={datum?.isSubtotal ? 600 : 400}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const TaxWaterfallChart: React.FC<TaxWaterfallChartProps> = ({ taxResult }) => {
  const waterfallData = useMemo(() => buildWaterfallData(taxResult), [taxResult]);

  // Memoize the tick renderer so its identity is stable across re-renders
  const XTick = useMemo(() => makeXTickRenderer(waterfallData), [waterfallData]);

  // Zero-data guard
  if (!taxResult.adjustedGrossIncome) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Enter income data to see your tax waterfall
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={waterfallData}
          margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
          barCategoryGap="20%"
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={XTick} interval={0} height={50} />
          <YAxis
            tickFormatter={(v: number) => formatCurrency(v)}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            width={80}
          />
          <Tooltip content={renderWaterfallTooltip} cursor={{ fill: 'rgba(79,70,229,0.05)' }} />
          {/* Invisible spacer bar — pushes visible bar to float position.
              isAnimationActive=false prevents a double-animation artifact. */}
          <Bar
            dataKey="transparentBase"
            stackId="w"
            fill="transparent"
            legendType="none"
            isAnimationActive={false}
          />
          {/* Visible bar — each cell gets its fill from datum.fill */}
          <Bar
            dataKey="amount"
            stackId="w"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={600}
          >
            {waterfallData.map((entry, i) => (
              <Cell key={`c-${i}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
