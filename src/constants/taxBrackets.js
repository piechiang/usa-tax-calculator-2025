export const federalTaxBrackets = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 }
  ],
  marriedJointly: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 }
  ],
  marriedSeparately: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: Infinity, rate: 0.37 }
  ],
  headOfHousehold: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 }
  ]
};

export const standardDeductions = {
  single: 15750,
  marriedJointly: 31500,
  marriedSeparately: 15750,
  headOfHousehold: 23625
};

export const marylandTaxBrackets = [
  { min: 0, max: 1000, rate: 0.02 },
  { min: 1000, max: 2000, rate: 0.03 },
  { min: 2000, max: 3000, rate: 0.04 },
  { min: 3000, max: 100000, rate: 0.0475 },
  { min: 100000, max: 125000, rate: 0.05 },
  { min: 125000, max: 150000, rate: 0.0525 },
  { min: 150000, max: 250000, rate: 0.055 },
  { min: 250000, max: Infinity, rate: 0.0575 }
];

export const marylandCountyRates = {
  'Allegany': 0.0305,
  'Anne Arundel': 0.0281,
  'Baltimore City': 0.032,
  'Baltimore County': 0.032,
  'Calvert': 0.032,
  'Caroline': 0.0263,
  'Carroll': 0.032,
  'Cecil': 0.0274,
  'Charles': 0.029,
  'Dorchester': 0.0262,
  'Frederick': 0.0296,
  'Garrett': 0.0265,
  'Harford': 0.0306,
  'Howard': 0.032,
  'Kent': 0.0285,
  'Montgomery': 0.032,
  'Prince Georges': 0.032,
  'Queen Annes': 0.0285,
  'Somerset': 0.032,
  'St. Marys': 0.032,
  'Talbot': 0.0240,
  'Washington': 0.028,
  'Wicomico': 0.032,
  'Worcester': 0.0125
};