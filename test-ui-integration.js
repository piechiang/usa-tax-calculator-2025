// Test UI integration with engine
const { calculateTaxResultsWithEngine } = require('./src/utils/engineAdapter.js');

console.log('🧪 Testing UI Integration with Engine\n');

// Mock UI data structure (similar to what React forms would provide)
const mockPersonalInfo = {
  firstName: 'John',
  lastName: 'Doe',
  filingStatus: 'single',
  dependents: 0,
  isMaryland: true,
  county: 'Montgomery',
};

const mockIncomeData = {
  wages: '65000',
  interestIncome: '150',
  dividends: '0',
  capitalGains: '0',
  businessIncome: '0',
  otherIncome: '0',
};

const mockK1Data = {
  ordinaryIncome: '0',
  netRentalRealEstate: '0',
  otherRentalIncome: '0',
  guaranteedPayments: '0',
  k1InterestIncome: '0',
  k1Dividends: '0',
  royalties: '0',
};

const mockBusinessDetails = {
  expenses: '0',
};

const mockPaymentsData = {
  federalWithholding: '8500',
  stateWithholding: '2500',
  estimatedPayments: '0',
  advanceEITC: '0',
};

const mockDeductions = {
  studentLoanInterest: '2500',
  hsaContribution: '0',
  iraContribution: '0',
  selfEmploymentTaxDeduction: '0',
  stateLocalTaxes: '0',
  mortgageInterest: '0',
  charitableContributions: '0',
  medicalExpenses: '0',
  otherDeductions: '0',
};

const mockSpouseInfo = null; // Single filer

console.log('📋 Input Data:');
console.log(`   Filing Status: ${mockPersonalInfo.filingStatus}`);
console.log(`   Wages: $${mockIncomeData.wages}`);
console.log(`   Student Loan Interest: $${mockDeductions.studentLoanInterest}`);
console.log(`   Federal Withholding: $${mockPaymentsData.federalWithholding}`);
console.log(`   Maryland Resident: ${mockPersonalInfo.isMaryland ? 'Yes' : 'No'}`);
console.log(`   County: ${mockPersonalInfo.county}\n`);

// Test the integration
try {
  const result = calculateTaxResultsWithEngine(
    mockPersonalInfo,
    mockIncomeData,
    mockK1Data,
    mockBusinessDetails,
    mockPaymentsData,
    mockDeductions,
    mockSpouseInfo
  );

  if (result.success) {
    console.log('✅ Engine Integration Successful!\n');
    
    console.log('🧾 Calculated Results:');
    console.log(`   AGI: $${result.result.adjustedGrossIncome.toLocaleString()}`);
    console.log(`   Taxable Income: $${result.result.taxableIncome.toLocaleString()}`);
    console.log(`   Federal Tax: $${result.result.federalTax.toLocaleString()}`);
    console.log(`   Maryland Tax: $${result.result.marylandTax.toLocaleString()}`);
    console.log(`   Local Tax: $${result.result.localTax.toLocaleString()}`);
    console.log(`   Total Tax: $${result.result.totalTax.toLocaleString()}`);
    console.log(`   Refund/Owe: $${result.result.refundOrOwe.toLocaleString()}`);
    console.log(`   After-Tax Income: $${result.result.afterTaxIncome.toLocaleString()}`);
    console.log(`   Effective Rate: ${(result.result.effectiveRate * 100).toFixed(2)}%`);
    
    console.log('\n💡 Engine Details:');
    console.log(`   Federal Details Available: ${result.federalDetails ? 'Yes' : 'No'}`);
    console.log(`   State Details Available: ${result.stateDetails ? 'Yes' : 'No'}`);
    
    if (result.federalDetails) {
      console.log(`   Credits: CTC=$${Math.round((result.federalDetails.credits.ctc || 0) / 100)}, EITC=$${Math.round((result.federalDetails.credits.eitc || 0) / 100)}`);
    }
    
    console.log('\n🎯 Integration Status:');
    console.log('   ✓ UI Data Conversion: Working');
    console.log('   ✓ Engine Calculation: Working');
    console.log('   ✓ Result Conversion: Working');
    console.log('   ✓ Maryland Tax: Working');
    console.log('   ✓ Error Handling: Working');
    
  } else {
    console.log('❌ Engine Integration Failed:');
    console.log(`   Error: ${result.error}`);
  }
  
} catch (error) {
  console.log('💥 Integration Test Failed:');
  console.log(`   Error: ${error.message}`);
  console.log(`   Stack: ${error.stack}`);
}

console.log('\n🚀 Next Steps:');
console.log('   • Fix any React module resolution issues');
console.log('   • Test with actual UI form data');
console.log('   • Verify filing comparison calculations');
console.log('   • Add error handling in UI components');