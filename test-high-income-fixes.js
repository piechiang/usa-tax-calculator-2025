/**
 * Test script to verify fixes for high-income tax calculation issues
 */

const { computeFederal2025 } = require('./src/engine-dist/federal/2025/computeFederal2025.js');

function formatCurrency(cents) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

console.log('Testing high-income tax calculation fixes...\n');

// Test 1: Million-dollar wage detection fix
console.log('=== Test 1: Million-dollar wage input (should be treated as dollars, not cents) ===');
const test1Input = {
  filingStatus: 'marriedJointly',
  income: {
    wages: 1200000, // $1.2M wage - should NOT be treated as cents anymore
  },
  payments: {
    federalWithheld: 300000, // $300k withheld
  }
};

const result1 = computeFederal2025(test1Input);
console.log(`AGI: ${formatCurrency(result1.agi)}`);
console.log(`Tax Before Credits: ${formatCurrency(result1.taxBeforeCredits)}`);
console.log(`Expected AGI around $1.2M (not $12k): ${result1.agi > 100000000 ? 'PASS ✓' : 'FAIL ✗'}`);

// Test 2: Additional taxes respecting input units
console.log('\n=== Test 2: Additional taxes with high self-employment income ===');
const test2Input = {
  filingStatus: 'single',
  income: {
    wages: 200000, // $200k wages
    scheduleCNet: 300000, // $300k SE income
  }
};

const result2 = computeFederal2025(test2Input);
console.log(`AGI: ${formatCurrency(result2.agi)}`);
console.log(`SE Tax: ${formatCurrency(result2.additionalTaxes?.seTax || 0)}`);
console.log(`Medicare Surtax: ${formatCurrency(result2.additionalTaxes?.medicareSurtax || 0)}`);
console.log(`SE Tax reasonable (not 100x too high): ${(result2.additionalTaxes?.seTax || 0) < 10000000 ? 'PASS ✓' : 'FAIL ✗'}`);

// Test 3: Child Tax Credit after other non-refundable credits
console.log('\n=== Test 3: CTC calculation after education credits ===');
const test3Input = {
  filingStatus: 'marriedJointly',
  dependents: 2, // 2 qualifying children
  income: {
    wages: 90000, // $90k wages - moderate income
  },
  educationExpenses: [{
    studentName: 'Child 1',
    tuitionAndFees: 8000, // $8k tuition - eligible for AOTC
    isEligibleInstitution: true,
    isHalfTimeStudent: true,
    yearsOfPostSecondaryEducation: 1,
    hasNeverClaimedAOTC: true
  }],
  payments: {
    federalWithheld: 12000,
  }
};

const result3 = computeFederal2025(test3Input);
console.log(`Tax Before Credits: ${formatCurrency(result3.taxBeforeCredits)}`);
console.log(`AOTC: ${formatCurrency(result3.credits?.aotc || 0)}`);
console.log(`CTC: ${formatCurrency(result3.credits?.ctc || 0)}`);
console.log(`Total Non-Refundable Credits: ${formatCurrency((result3.credits?.ctc || 0) + (result3.credits?.aotc || 0) + (result3.credits?.llc || 0))}`);
console.log(`Refundable Credits: ${formatCurrency(result3.credits?.otherRefundable || 0)}`);

// The CTC should be properly limited by remaining tax after AOTC
const maxPossibleCTC = 200000 * 2; // $2k per child in cents
const remainingTaxAfterAOTC = Math.max(0, result3.taxBeforeCredits - (result3.credits?.aotc || 0));
const expectedCTC = Math.min(maxPossibleCTC, remainingTaxAfterAOTC);
console.log(`CTC properly limited by remaining tax: ${Math.abs((result3.credits?.ctc || 0) - expectedCTC) < 100 ? 'PASS ✓' : 'FAIL ✗'}`);

// Test 4: Verify cents mode detection works for clearly-in-cents input
console.log('\n=== Test 4: Input clearly in cents (large value with non-zero cents) ===');
const test4Input = {
  filingStatus: 'single',
  income: {
    wages: 5000075, // $50,000.75 in cents - should be detected as cents
  }
};

const result4 = computeFederal2025(test4Input);
console.log(`AGI: ${formatCurrency(result4.agi)}`);
console.log(`AGI should be around $50k: ${Math.abs(result4.agi - 5000075) < 100 ? 'PASS ✓' : 'FAIL ✗'}`);

console.log('\n=== Summary ===');
console.log('All fixes tested. Check PASS/FAIL indicators above.');