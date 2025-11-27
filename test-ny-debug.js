// Debug NY tax calculation
const brackets = [
  { min: 0, max: 850000, rate: 0.0400 },
  { min: 850000, max: 1170000, rate: 0.0450 },
  { min: 1170000, max: 1390000, rate: 0.0525 },
  { min: 1390000, max: 8065000, rate: 0.0550 }
];

function calculateTaxFromBrackets(taxableIncome, brackets) {
  if (taxableIncome <= 0) return 0;

  let totalTax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) {
      break;
    }

    const incomeInBracket = Math.min(
      taxableIncome - bracket.min,
      bracket.max - bracket.min
    );

    const tax = Math.round(incomeInBracket * bracket.rate);
    totalTax += tax;

    console.log(`Bracket $${bracket.min/100}-$${bracket.max/100} at ${(bracket.rate * 100).toFixed(2)}%:`);
    console.log(`  Income in bracket: $${incomeInBracket/100}`);
    console.log(`  Tax: $${tax/100}`);
    console.log(`  Running total: $${totalTax/100}`);

    if (taxableIncome <= bracket.max) {
      break;
    }
  }

  return totalTax;
}

const taxableIncome = 1700000; // $17,000 in cents
console.log('\n=== NY Tax Calculation for $17,000 Taxable Income ===\n');
const tax = calculateTaxFromBrackets(taxableIncome, brackets);
console.log(`\n**Final Tax: $${tax/100}**`);
console.log(`Expected (per test): ~$722.50`);
console.log(`Difference: $${(tax/100 - 722.50).toFixed(2)}`);
