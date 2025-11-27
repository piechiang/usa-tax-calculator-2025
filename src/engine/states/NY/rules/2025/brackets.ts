import type { FilingStatus } from '../../../../types';

/**
 * New York 2024 Tax Brackets (for 2025 tax returns)
 *
 * New York has nine progressive tax brackets with rates ranging from 4% to 10.9%.
 * These are the 2024 tax year brackets (used when filing taxes in 2025).
 *
 * Source: New York State Department of Taxation and Finance
 * Form IT-201 Instructions (2024)
 * https://www.tax.ny.gov/pit/file/tax-tables/it201i-2024.htm
 *
 * Last Updated: 2025-10-19
 */

export const NY_BRACKETS_2025: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
  single: [
    { min: 0, max: 8500_00, rate: 0.0400 },              // 4% on first $8,500
    { min: 8500_00, max: 11700_00, rate: 0.0450 },       // 4.5% on $8,501-$11,700
    { min: 11700_00, max: 13900_00, rate: 0.0525 },      // 5.25% on $11,701-$13,900
    { min: 13900_00, max: 80650_00, rate: 0.0550 },      // 5.5% on $13,901-$80,650
    { min: 80650_00, max: 215400_00, rate: 0.0600 },     // 6% on $80,651-$215,400
    { min: 215400_00, max: 1077550_00, rate: 0.0685 },   // 6.85% on $215,401-$1,077,550
    { min: 1077550_00, max: 5000000_00, rate: 0.0965 },  // 9.65% on $1,077,551-$5,000,000
    { min: 5000000_00, max: 25000000_00, rate: 0.1030 }, // 10.3% on $5,000,001-$25,000,000
    { min: 25000000_00, max: Infinity, rate: 0.1090 }    // 10.9% over $25,000,000
  ],
  marriedJointly: [
    { min: 0, max: 17150_00, rate: 0.0400 },              // 4% on first $17,150
    { min: 17150_00, max: 23600_00, rate: 0.0450 },       // 4.5% on $17,151-$23,600
    { min: 23600_00, max: 27900_00, rate: 0.0525 },       // 5.25% on $23,601-$27,900
    { min: 27900_00, max: 161550_00, rate: 0.0550 },      // 5.5% on $27,901-$161,550
    { min: 161550_00, max: 323200_00, rate: 0.0600 },     // 6% on $161,551-$323,200
    { min: 323200_00, max: 2155350_00, rate: 0.0685 },    // 6.85% on $323,201-$2,155,350
    { min: 2155350_00, max: 5000000_00, rate: 0.0965 },   // 9.65% on $2,155,351-$5,000,000
    { min: 5000000_00, max: 25000000_00, rate: 0.1030 },  // 10.3% on $5,000,001-$25,000,000
    { min: 25000000_00, max: Infinity, rate: 0.1090 }     // 10.9% over $25,000,000
  ],
  marriedSeparately: [
    // Married Filing Separately uses approximately half of Married Filing Jointly brackets
    { min: 0, max: 8575_00, rate: 0.0400 },               // 4% on first $8,575
    { min: 8575_00, max: 11800_00, rate: 0.0450 },        // 4.5% on $8,576-$11,800
    { min: 11800_00, max: 13950_00, rate: 0.0525 },       // 5.25% on $11,801-$13,950
    { min: 13950_00, max: 80775_00, rate: 0.0550 },       // 5.5% on $13,951-$80,775
    { min: 80775_00, max: 161600_00, rate: 0.0600 },      // 6% on $80,776-$161,600
    { min: 161600_00, max: 1077675_00, rate: 0.0685 },    // 6.85% on $161,601-$1,077,675
    { min: 1077675_00, max: 5000000_00, rate: 0.0965 },   // 9.65% on $1,077,676-$5,000,000
    { min: 5000000_00, max: 25000000_00, rate: 0.1030 },  // 10.3% on $5,000,001-$25,000,000
    { min: 25000000_00, max: Infinity, rate: 0.1090 }     // 10.9% over $25,000,000
  ],
  headOfHousehold: [
    // Head of Household brackets (between Single and MFJ)
    { min: 0, max: 12800_00, rate: 0.0400 },              // 4% on first $12,800
    { min: 12800_00, max: 17650_00, rate: 0.0450 },       // 4.5% on $12,801-$17,650
    { min: 17650_00, max: 20900_00, rate: 0.0525 },       // 5.25% on $17,651-$20,900
    { min: 20900_00, max: 107650_00, rate: 0.0550 },      // 5.5% on $20,901-$107,650
    { min: 107650_00, max: 269300_00, rate: 0.0600 },     // 6% on $107,651-$269,300
    { min: 269300_00, max: 1616450_00, rate: 0.0685 },    // 6.85% on $269,301-$1,616,450
    { min: 1616450_00, max: 5000000_00, rate: 0.0965 },   // 9.65% on $1,616,451-$5,000,000
    { min: 5000000_00, max: 25000000_00, rate: 0.1030 },  // 10.3% on $5,000,001-$25,000,000
    { min: 25000000_00, max: Infinity, rate: 0.1090 }     // 10.9% over $25,000,000
  ]
};
