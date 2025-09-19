export interface StateTaxRule {
  state: string;
  stateCode: string;
  hasIncomeTax: boolean;
  taxType: 'flat' | 'progressive' | 'none';
  brackets?: Array<{
    min: number;
    max: number;
    rate: number;
  }>;
  standardDeduction?: {
    single: number;
    marriedJointly: number;
    marriedSeparately: number;
    headOfHousehold: number;
  };
  personalExemption?: number;
  additionalInfo?: string;
}

export const STATE_TAX_RULES: Record<string, StateTaxRule> = {
  AL: {
    state: 'Alabama',
    stateCode: 'AL',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 500, rate: 0.02 },
      { min: 500, max: 3000, rate: 0.04 },
      { min: 3000, max: Infinity, rate: 0.05 }
    ],
    standardDeduction: { single: 2500, marriedJointly: 7500, marriedSeparately: 2500, headOfHousehold: 4700 },
    personalExemption: 1500
  },
  AK: {
    state: 'Alaska',
    stateCode: 'AK',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax'
  },
  AZ: {
    state: 'Arizona',
    stateCode: 'AZ',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 27808, rate: 0.0259 },
      { min: 27808, max: 69670, rate: 0.0288 },
      { min: 69670, max: 104835, rate: 0.0336 },
      { min: 104835, max: 209671, rate: 0.0424 },
      { min: 209671, max: Infinity, rate: 0.045 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  AR: {
    state: 'Arkansas',
    stateCode: 'AR',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 4300, rate: 0.02 },
      { min: 4300, max: 8500, rate: 0.04 },
      { min: 8500, max: 12700, rate: 0.059 },
      { min: 12700, max: Infinity, rate: 0.066 }
    ],
    standardDeduction: { single: 2340, marriedJointly: 4680, marriedSeparately: 2340, headOfHousehold: 3440 }
  },
  CA: {
    state: 'California',
    stateCode: 'CA',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 10099, rate: 0.01 },
      { min: 10099, max: 23942, rate: 0.02 },
      { min: 23942, max: 37788, rate: 0.04 },
      { min: 37788, max: 52455, rate: 0.06 },
      { min: 52455, max: 66295, rate: 0.08 },
      { min: 66295, max: 338639, rate: 0.093 },
      { min: 338639, max: 406364, rate: 0.103 },
      { min: 406364, max: 677278, rate: 0.113 },
      { min: 677278, max: Infinity, rate: 0.123 }
    ],
    standardDeduction: { single: 5202, marriedJointly: 10404, marriedSeparately: 5202, headOfHousehold: 10726 }
  },
  CO: {
    state: 'Colorado',
    stateCode: 'CO',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.044 }],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  CT: {
    state: 'Connecticut',
    stateCode: 'CT',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10000, max: 50000, rate: 0.05 },
      { min: 50000, max: 100000, rate: 0.055 },
      { min: 100000, max: 200000, rate: 0.06 },
      { min: 200000, max: 250000, rate: 0.065 },
      { min: 250000, max: 500000, rate: 0.069 },
      { min: 500000, max: Infinity, rate: 0.0699 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  DE: {
    state: 'Delaware',
    stateCode: 'DE',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 2000, rate: 0.022 },
      { min: 2000, max: 5000, rate: 0.039 },
      { min: 5000, max: 10000, rate: 0.048 },
      { min: 10000, max: 20000, rate: 0.052 },
      { min: 20000, max: 25000, rate: 0.0555 },
      { min: 25000, max: Infinity, rate: 0.066 }
    ],
    standardDeduction: { single: 3250, marriedJointly: 6500, marriedSeparately: 3250, headOfHousehold: 3250 }
  },
  FL: {
    state: 'Florida',
    stateCode: 'FL',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax'
  },
  GA: {
    state: 'Georgia',
    stateCode: 'GA',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 1000, rate: 0.01 },
      { min: 1000, max: 3000, rate: 0.02 },
      { min: 3000, max: 5000, rate: 0.03 },
      { min: 5000, max: 7000, rate: 0.04 },
      { min: 7000, max: 10000, rate: 0.05 },
      { min: 10000, max: Infinity, rate: 0.0575 }
    ],
    standardDeduction: { single: 5400, marriedJointly: 10800, marriedSeparately: 5400, headOfHousehold: 8000 }
  },
  HI: {
    state: 'Hawaii',
    stateCode: 'HI',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 2400, rate: 0.014 },
      { min: 2400, max: 4800, rate: 0.032 },
      { min: 4800, max: 9600, rate: 0.055 },
      { min: 9600, max: 14400, rate: 0.064 },
      { min: 14400, max: 19200, rate: 0.068 },
      { min: 19200, max: 24000, rate: 0.072 },
      { min: 24000, max: 36000, rate: 0.076 },
      { min: 36000, max: 48000, rate: 0.079 },
      { min: 48000, max: 150000, rate: 0.0825 },
      { min: 150000, max: 175000, rate: 0.09 },
      { min: 175000, max: 200000, rate: 0.10 },
      { min: 200000, max: Infinity, rate: 0.11 }
    ],
    standardDeduction: { single: 2300, marriedJointly: 4600, marriedSeparately: 2300, headOfHousehold: 3371 }
  },
  ID: {
    state: 'Idaho',
    stateCode: 'ID',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 1654, rate: 0.01 },
      { min: 1654, max: 3307, rate: 0.03 },
      { min: 3307, max: 4961, rate: 0.045 },
      { min: 4961, max: 6614, rate: 0.06 },
      { min: 6614, max: Infinity, rate: 0.0695 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  IL: {
    state: 'Illinois',
    stateCode: 'IL',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.0495 }],
    standardDeduction: { single: 2775, marriedJointly: 5550, marriedSeparately: 2775, headOfHousehold: 2775 }
  },
  IN: {
    state: 'Indiana',
    stateCode: 'IN',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.0323 }],
    standardDeduction: { single: 1000, marriedJointly: 2000, marriedSeparately: 1000, headOfHousehold: 1000 }
  },
  IA: {
    state: 'Iowa',
    stateCode: 'IA',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 1743, rate: 0.0033 },
      { min: 1743, max: 3486, rate: 0.0067 },
      { min: 3486, max: 6972, rate: 0.0225 },
      { min: 6972, max: 15687, rate: 0.0414 },
      { min: 15687, max: 26145, rate: 0.0563 },
      { min: 26145, max: 34860, rate: 0.0596 },
      { min: 34860, max: 52290, rate: 0.0625 },
      { min: 52290, max: 78435, rate: 0.0744 },
      { min: 78435, max: Infinity, rate: 0.0853 }
    ],
    standardDeduction: { single: 2180, marriedJointly: 5370, marriedSeparately: 2685, headOfHousehold: 3200 }
  },
  KS: {
    state: 'Kansas',
    stateCode: 'KS',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 15000, rate: 0.031 },
      { min: 15000, max: 30000, rate: 0.0525 },
      { min: 30000, max: Infinity, rate: 0.057 }
    ],
    standardDeduction: { single: 3500, marriedJointly: 8000, marriedSeparately: 4000, headOfHousehold: 5800 }
  },
  KY: {
    state: 'Kentucky',
    stateCode: 'KY',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.05 }],
    standardDeduction: { single: 2770, marriedJointly: 5540, marriedSeparately: 2770, headOfHousehold: 4100 }
  },
  LA: {
    state: 'Louisiana',
    stateCode: 'LA',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 12500, rate: 0.0185 },
      { min: 12500, max: 50000, rate: 0.035 },
      { min: 50000, max: Infinity, rate: 0.0425 }
    ],
    standardDeduction: { single: 4500, marriedJointly: 9000, marriedSeparately: 4500, headOfHousehold: 6750 }
  },
  ME: {
    state: 'Maine',
    stateCode: 'ME',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 24500, rate: 0.058 },
      { min: 24500, max: 58050, rate: 0.0675 },
      { min: 58050, max: Infinity, rate: 0.0715 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  MD: {
    state: 'Maryland',
    stateCode: 'MD',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 100000, rate: 0.0475 },
      { min: 100000, max: 125000, rate: 0.05 },
      { min: 125000, max: 150000, rate: 0.0525 },
      { min: 150000, max: 250000, rate: 0.055 },
      { min: 250000, max: Infinity, rate: 0.0575 }
    ],
    standardDeduction: { single: 2400, marriedJointly: 4850, marriedSeparately: 2400, headOfHousehold: 3650 }
  },
  MA: {
    state: 'Massachusetts',
    stateCode: 'MA',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.05 }],
    standardDeduction: { single: 4400, marriedJointly: 8800, marriedSeparately: 4400, headOfHousehold: 6600 }
  },
  MI: {
    state: 'Michigan',
    stateCode: 'MI',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.0425 }],
    standardDeduction: { single: 5050, marriedJointly: 10100, marriedSeparately: 5050, headOfHousehold: 7550 }
  },
  MN: {
    state: 'Minnesota',
    stateCode: 'MN',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 29458, rate: 0.0535 },
      { min: 29458, max: 97069, rate: 0.068 },
      { min: 97069, max: 180200, rate: 0.0785 },
      { min: 180200, max: Infinity, rate: 0.0985 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  MS: {
    state: 'Mississippi',
    stateCode: 'MS',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 5000, rate: 0.03 },
      { min: 5000, max: 10000, rate: 0.04 },
      { min: 10000, max: Infinity, rate: 0.05 }
    ],
    standardDeduction: { single: 2300, marriedJointly: 4600, marriedSeparately: 2300, headOfHousehold: 3400 }
  },
  MO: {
    state: 'Missouri',
    stateCode: 'MO',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 1121, rate: 0.015 },
      { min: 1121, max: 2242, rate: 0.02 },
      { min: 2242, max: 3363, rate: 0.025 },
      { min: 3363, max: 4484, rate: 0.03 },
      { min: 4484, max: 5605, rate: 0.035 },
      { min: 5605, max: 6726, rate: 0.04 },
      { min: 6726, max: 7847, rate: 0.045 },
      { min: 7847, max: 8968, rate: 0.05 },
      { min: 8968, max: Infinity, rate: 0.054 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  MT: {
    state: 'Montana',
    stateCode: 'MT',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 3100, rate: 0.01 },
      { min: 3100, max: 5500, rate: 0.02 },
      { min: 5500, max: 8400, rate: 0.03 },
      { min: 8400, max: 11300, rate: 0.04 },
      { min: 11300, max: 14500, rate: 0.05 },
      { min: 14500, max: 18700, rate: 0.06 },
      { min: 18700, max: Infinity, rate: 0.0675 }
    ],
    standardDeduction: { single: 5070, marriedJointly: 10140, marriedSeparately: 5070, headOfHousehold: 7600 }
  },
  NE: {
    state: 'Nebraska',
    stateCode: 'NE',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 3700, rate: 0.0246 },
      { min: 3700, max: 22170, rate: 0.0351 },
      { min: 22170, max: 35730, rate: 0.0501 },
      { min: 35730, max: Infinity, rate: 0.0684 }
    ],
    standardDeduction: { single: 7400, marriedJointly: 18400, marriedSeparately: 9200, headOfHousehold: 10950 }
  },
  NV: {
    state: 'Nevada',
    stateCode: 'NV',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax'
  },
  NH: {
    state: 'New Hampshire',
    stateCode: 'NH',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax on wages (dividend/interest tax eliminated 2025)'
  },
  NJ: {
    state: 'New Jersey',
    stateCode: 'NJ',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 35000, rate: 0.0175 },
      { min: 35000, max: 40000, rate: 0.035 },
      { min: 40000, max: 75000, rate: 0.0553 },
      { min: 75000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 }
    ],
    standardDeduction: { single: 1000, marriedJointly: 2000, marriedSeparately: 1000, headOfHousehold: 1500 }
  },
  NM: {
    state: 'New Mexico',
    stateCode: 'NM',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 5500, rate: 0.017 },
      { min: 5500, max: 11000, rate: 0.032 },
      { min: 11000, max: 16000, rate: 0.047 },
      { min: 16000, max: 210000, rate: 0.049 },
      { min: 210000, max: Infinity, rate: 0.059 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  NY: {
    state: 'New York',
    stateCode: 'NY',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.0585 },
      { min: 80650, max: 215400, rate: 0.0625 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 }
    ],
    standardDeduction: { single: 8000, marriedJointly: 16050, marriedSeparately: 8000, headOfHousehold: 11200 }
  },
  NC: {
    state: 'North Carolina',
    stateCode: 'NC',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.045 }],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  ND: {
    state: 'North Dakota',
    stateCode: 'ND',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 44725, rate: 0.0110 },
      { min: 44725, max: 108625, rate: 0.0204 },
      { min: 108625, max: 196700, rate: 0.0227 },
      { min: 196700, max: 458350, rate: 0.0264 },
      { min: 458350, max: Infinity, rate: 0.0290 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  OH: {
    state: 'Ohio',
    stateCode: 'OH',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 26050, rate: 0.0285 },
      { min: 26050, max: 41200, rate: 0.0333 },
      { min: 41200, max: 82650, rate: 0.0380 },
      { min: 82650, max: 110650, rate: 0.0428 },
      { min: 110650, max: Infinity, rate: 0.0476 }
    ],
    standardDeduction: { single: 2400, marriedJointly: 4800, marriedSeparately: 2400, headOfHousehold: 3550 }
  },
  OK: {
    state: 'Oklahoma',
    stateCode: 'OK',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 1000, rate: 0.0025 },
      { min: 1000, max: 2500, rate: 0.0075 },
      { min: 2500, max: 3750, rate: 0.0175 },
      { min: 3750, max: 4900, rate: 0.0275 },
      { min: 4900, max: 7200, rate: 0.0375 },
      { min: 7200, max: Infinity, rate: 0.05 }
    ],
    standardDeduction: { single: 6350, marriedJointly: 12700, marriedSeparately: 6350, headOfHousehold: 9350 }
  },
  OR: {
    state: 'Oregon',
    stateCode: 'OR',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 4050, rate: 0.0475 },
      { min: 4050, max: 10200, rate: 0.0675 },
      { min: 10200, max: 25550, rate: 0.0875 },
      { min: 25550, max: 64250, rate: 0.099 },
      { min: 64250, max: Infinity, rate: 0.099 }
    ],
    standardDeduction: { single: 2605, marriedJointly: 5210, marriedSeparately: 2605, headOfHousehold: 3905 }
  },
  PA: {
    state: 'Pennsylvania',
    stateCode: 'PA',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.0307 }],
    standardDeduction: { single: 0, marriedJointly: 0, marriedSeparately: 0, headOfHousehold: 0 }
  },
  RI: {
    state: 'Rhode Island',
    stateCode: 'RI',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 73450, rate: 0.0375 },
      { min: 73450, max: 166950, rate: 0.0475 },
      { min: 166950, max: Infinity, rate: 0.0599 }
    ],
    standardDeduction: { single: 9600, marriedJointly: 19200, marriedSeparately: 9600, headOfHousehold: 14400 }
  },
  SC: {
    state: 'South Carolina',
    stateCode: 'SC',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 3460, rate: 0.0300 },
      { min: 3460, max: 6920, rate: 0.0400 },
      { min: 6920, max: 10380, rate: 0.0500 },
      { min: 10380, max: 13840, rate: 0.0600 },
      { min: 13840, max: Infinity, rate: 0.0700 }
    ],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  SD: {
    state: 'South Dakota',
    stateCode: 'SD',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax'
  },
  TN: {
    state: 'Tennessee',
    stateCode: 'TN',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax'
  },
  TX: {
    state: 'Texas',
    stateCode: 'TX',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax'
  },
  UT: {
    state: 'Utah',
    stateCode: 'UT',
    hasIncomeTax: true,
    taxType: 'flat',
    brackets: [{ min: 0, max: Infinity, rate: 0.0485 }],
    standardDeduction: { single: 13850, marriedJointly: 27700, marriedSeparately: 13850, headOfHousehold: 20800 }
  },
  VT: {
    state: 'Vermont',
    stateCode: 'VT',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 42050, rate: 0.0335 },
      { min: 42050, max: 101900, rate: 0.0660 },
      { min: 101900, max: 213150, rate: 0.0760 },
      { min: 213150, max: Infinity, rate: 0.0875 }
    ],
    standardDeduction: { single: 7100, marriedJointly: 14200, marriedSeparately: 7100, headOfHousehold: 10550 }
  },
  VA: {
    state: 'Virginia',
    stateCode: 'VA',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3000, max: 5000, rate: 0.03 },
      { min: 5000, max: 17000, rate: 0.05 },
      { min: 17000, max: Infinity, rate: 0.0575 }
    ],
    standardDeduction: { single: 4850, marriedJointly: 9700, marriedSeparately: 4850, headOfHousehold: 7150 }
  },
  WA: {
    state: 'Washington',
    stateCode: 'WA',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax (capital gains tax for high earners)'
  },
  WV: {
    state: 'West Virginia',
    stateCode: 'WV',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10000, max: 25000, rate: 0.04 },
      { min: 25000, max: 40000, rate: 0.045 },
      { min: 40000, max: 60000, rate: 0.06 },
      { min: 60000, max: Infinity, rate: 0.065 }
    ],
    standardDeduction: { single: 2000, marriedJointly: 4000, marriedSeparately: 2000, headOfHousehold: 3000 }
  },
  WI: {
    state: 'Wisconsin',
    stateCode: 'WI',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: [
      { min: 0, max: 13810, rate: 0.0354 },
      { min: 13810, max: 27630, rate: 0.0465 },
      { min: 27630, max: 304170, rate: 0.0627 },
      { min: 304170, max: Infinity, rate: 0.0765 }
    ],
    standardDeduction: { single: 12760, marriedJointly: 23620, marriedSeparately: 11810, headOfHousehold: 18760 }
  },
  WY: {
    state: 'Wyoming',
    stateCode: 'WY',
    hasIncomeTax: false,
    taxType: 'none',
    additionalInfo: 'No state income tax'
  }
};

export const getStateTaxRules = (stateCode: string): StateTaxRule | null => {
  return STATE_TAX_RULES[stateCode.toUpperCase()] || null;
};

export const calculateStateTax = (
  income: number,
  stateCode: string,
  filingStatus: 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold'
): number => {
  const rules = getStateTaxRules(stateCode);

  if (!rules || !rules.hasIncomeTax) {
    return 0;
  }

  const standardDeduction = rules.standardDeduction?.[filingStatus] || 0;
  const taxableIncome = Math.max(0, income - standardDeduction);

  if (rules.taxType === 'flat' && rules.brackets?.[0]) {
    return taxableIncome * rules.brackets[0].rate;
  }

  if (rules.taxType === 'progressive' && rules.brackets) {
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of rules.brackets) {
      const bracketIncome = Math.min(remainingIncome, bracket.max - bracket.min);
      if (bracketIncome <= 0) break;

      tax += bracketIncome * bracket.rate;
      remainingIncome -= bracketIncome;

      if (remainingIncome <= 0) break;
    }

    return tax;
  }

  return 0;
};

export const getAllStates = (): Array<{ code: string; name: string; hasIncomeTax: boolean }> => {
  return Object.values(STATE_TAX_RULES).map(rule => ({
    code: rule.stateCode,
    name: rule.state,
    hasIncomeTax: rule.hasIncomeTax
  }));
};