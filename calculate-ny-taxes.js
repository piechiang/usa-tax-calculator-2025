// Calculate correct NY tax for all test scenarios

const brackets = {
  single: [
    { min: 0, max: 850000, rate: 0.0400 },
    { min: 850000, max: 1170000, rate: 0.0450 },
    { min: 1170000, max: 1390000, rate: 0.0525 },
    { min: 1390000, max: 8065000, rate: 0.0550 },
    { min: 8065000, max: 21540000, rate: 0.0600 },
    { min: 21540000, max: 107755000, rate: 0.0685 },
    { min: 107755000, max: 500000000, rate: 0.0965 },
    { min: 500000000, max: 2500000000, rate: 0.1030 },
    { min: 2500000000, max: Infinity, rate: 0.1090 }
  ],
  marriedJointly: [
    { min: 0, max: 1715000, rate: 0.0400 },
    { min: 1715000, max: 2360000, rate: 0.0450 },
    { min: 2360000, max: 2790000, rate: 0.0525 },
    { min: 2790000, max: 16155000, rate: 0.0550 },
    { min: 16155000, max: 32320000, rate: 0.0600 },
    { min: 32320000, max: 215535000, rate: 0.0685 },
    { min: 215535000, max: 500000000, rate: 0.0965 },
    { min: 500000000, max: 2500000000, rate: 0.1030 },
    { min: 2500000000, max: Infinity, rate: 0.1090 }
  ]
};

const deductions = {
  single: 800000,
  marriedJointly: 1605000
};

function calculateTax(taxableIncome, bracketSet) {
  if (taxableIncome <= 0) return 0;

  let totalTax = 0;

  for (const bracket of bracketSet) {
    if (taxableIncome <= bracket.min) break;

    const incomeInBracket = Math.min(
      taxableIncome - bracket.min,
      bracket.max - bracket.min
    );

    totalTax += Math.round(incomeInBracket * bracket.rate);

    if (taxableIncome <= bracket.max) break;
  }

  return totalTax;
}

const testCases = [
  { desc: 'Single $25k', income: 2500000, filing: 'single', deduction: 800000 },
  { desc: 'Single $75k', income: 7500000, filing: 'single', deduction: 800000 },
  { desc: 'MFJ $120k', income: 12000000, filing: 'marriedJointly', deduction: 1605000 },
  { desc: 'Single $200k', income: 20000000, filing: 'single', deduction: 800000 },
  { desc: 'MFJ $500k', income: 50000000, filing: 'marriedJointly', deduction: 1605000 },
  { desc: 'Single $1M', income: 100000000, filing: 'single', deduction: 800000 }
];

console.log('=== Correct NY Tax Calculations ===\n');

for (const testCase of testCases) {
  const taxableIncome = testCase.income - testCase.deduction;
  const tax = calculateTax(taxableIncome, brackets[testCase.filing]);

  console.log(`${testCase.desc}:`);
  console.log(`  Gross Income: $${testCase.income / 100}`);
  console.log(`  Deduction: $${testCase.deduction / 100}`);
  console.log(`  Taxable Income: $${taxableIncome / 100}`);
  console.log(`  **Tax: $${(tax / 100).toFixed(2)}**`);
  console.log('');
}
