// Demo script to showcase the tax engine functionality
const { 
  FEDERAL_BRACKETS_2025, 
  STANDARD_DEDUCTION_2025,
  MD_RULES_2025,
  calculateTaxFromBrackets,
  dollarsToCents,
  formatCents 
} = require('./build/engine');

console.log('🚀 USA Tax Calculator 2025 Engine Demo\n');

// Demo 1: Federal tax calculation for single filer
const singleIncome = dollarsToCents(75000);
const singleTaxableIncome = singleIncome - STANDARD_DEDUCTION_2025.single;
const singleFederalTax = calculateTaxFromBrackets(singleTaxableIncome, FEDERAL_BRACKETS_2025.single);

console.log('📊 Single Filer with $75,000 income:');
console.log(`   Gross Income: ${formatCents(singleIncome)}`);
console.log(`   Standard Deduction: ${formatCents(STANDARD_DEDUCTION_2025.single)}`);
console.log(`   Taxable Income: ${formatCents(singleTaxableIncome)}`);
console.log(`   Federal Tax: ${formatCents(singleFederalTax)}\n`);

// Demo 2: Federal tax calculation for married filing jointly
const mjfIncome = dollarsToCents(150000);
const mjfTaxableIncome = mjfIncome - STANDARD_DEDUCTION_2025.marriedJointly;
const mjfFederalTax = calculateTaxFromBrackets(mjfTaxableIncome, FEDERAL_BRACKETS_2025.marriedJointly);

console.log('💑 Married Filing Jointly with $150,000 income:');
console.log(`   Gross Income: ${formatCents(mjfIncome)}`);
console.log(`   Standard Deduction: ${formatCents(STANDARD_DEDUCTION_2025.marriedJointly)}`);
console.log(`   Taxable Income: ${formatCents(mjfTaxableIncome)}`);
console.log(`   Federal Tax: ${formatCents(mjfFederalTax)}\n`);

// Demo 3: Maryland state tax calculation
const mdTaxableIncome = Math.max(0, mjfIncome - MD_RULES_2025.standardDeduction.marriedJointly);
const mdStateTax = calculateTaxFromBrackets(mdTaxableIncome, MD_RULES_2025.brackets);
const mdLocalTax = Math.round(mdTaxableIncome * MD_RULES_2025.defaultLocalRate);

console.log('🏛️  Maryland State Tax (Married Filing Jointly):');
console.log(`   MD Taxable Income: ${formatCents(mdTaxableIncome)}`);
console.log(`   MD State Tax: ${formatCents(mdStateTax)}`);
console.log(`   MD Local Tax (3.2%): ${formatCents(mdLocalTax)}`);
console.log(`   Total MD Tax: ${formatCents(mdStateTax + mdLocalTax)}\n`);

// Demo 4: Tax brackets info
console.log('📋 Federal Tax Brackets 2025 (Single):');
FEDERAL_BRACKETS_2025.single.forEach((bracket, i) => {
  const min = formatCents(bracket.min);
  const max = bracket.max === Infinity ? '∞' : formatCents(bracket.max);
  const rate = (bracket.rate * 100).toFixed(1) + '%';
  console.log(`   ${i + 1}. ${min} - ${max}: ${rate}`);
});

console.log('\n✅ Engine demo completed successfully!');
console.log('\n🔧 Available npm scripts:');
console.log('   npm run test:engine     - Run golden and property tests');
console.log('   npm run build:engine    - Build TypeScript to JavaScript');
console.log('   npm run test:engine:watch - Run tests in watch mode');