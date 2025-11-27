export const interviewQuestions = [
  {
    id: 'filing-status',
    title: 'What is your filing status?',
    description: 'Choose the filing status that applies to your situation.',
    type: 'single' as const,
    required: true,
    options: [
      { value: 'single', label: 'Single', description: 'You are unmarried or legally separated' },
      { value: 'marriedJointly', label: 'Married Filing Jointly', description: 'You are married and filing together' },
      { value: 'marriedSeparately', label: 'Married Filing Separately', description: 'You are married but filing separately' },
      { value: 'headOfHousehold', label: 'Head of Household', description: 'You are unmarried and support dependents' }
    ]
  },
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Please provide your basic information.',
    type: 'group' as const,
    required: true,
    inputs: [
      { field: 'firstName', label: 'First Name', type: 'text', required: true },
      { field: 'lastName', label: 'Last Name', type: 'text', required: true },
      { field: 'ssn', label: 'Social Security Number', type: 'text', placeholder: 'XXX-XX-XXXX', required: true },
      { field: 'address', label: 'Address', type: 'text', required: true }
    ]
  },
  {
    id: 'income-sources',
    title: 'What types of income did you have?',
    description: 'Select all income sources that apply to you.',
    type: 'multiple' as const,
    options: [
      { value: 'wages', label: 'Wages and Salaries', description: 'Income from employment (W-2)' },
      { value: 'interest', label: 'Interest Income', description: 'Bank interest, bonds, etc.' },
      { value: 'dividends', label: 'Dividend Income', description: 'Stock dividends' },
      { value: 'business', label: 'Business Income', description: 'Self-employment or business income' },
      { value: 'capital-gains', label: 'Capital Gains', description: 'Gains from selling investments' }
    ]
  }
];
