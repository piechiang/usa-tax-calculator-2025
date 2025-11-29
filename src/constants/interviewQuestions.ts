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
      { field: 'ssn', label: 'Social Security Number', type: 'text', placeholder: 'XXX-XX-XXXX', required: false },
      { field: 'address', label: 'Address', type: 'text', required: true }
    ]
  },
  {
    id: 'dependents',
    title: 'Do you have any dependents?',
    description: 'Dependents can include children and other qualifying relatives.',
    type: 'single' as const,
    required: true,
    options: [
      { value: 'yes', label: 'Yes', description: 'I have dependents' },
      { value: 'no', label: 'No', description: 'I do not have dependents' }
    ]
  },
  {
    id: 'child-care-expenses',
    title: 'Did you pay for childcare or dependent care?',
    description: 'This includes daycare, babysitters, before/after school programs, or day camps (not overnight camps) while you worked or looked for work.',
    type: 'group' as const,
    required: false,
    conditional: { dependsOn: 'dependents', value: 'yes' },
    inputs: [
      {
        field: 'hasChildCareExpenses',
        label: 'I paid for childcare or dependent care',
        type: 'checkbox',
        required: false
      },
      {
        field: 'numberOfQualifyingPersons',
        label: 'Number of qualifying children (under 13) or disabled dependents',
        type: 'number',
        min: 0,
        max: 10,
        required: false,
        conditional: { dependsOn: 'hasChildCareExpenses', value: true }
      },
      {
        field: 'careExpenses',
        label: 'Total childcare/dependent care expenses paid',
        type: 'currency',
        placeholder: '0.00',
        help: 'Maximum $3,000 for 1 person, $6,000 for 2 or more',
        required: false,
        conditional: { dependsOn: 'hasChildCareExpenses', value: true }
      }
    ]
  },
  {
    id: 'education-expenses',
    title: 'Did you or your dependents have education expenses?',
    description: 'This includes tuition and fees for college or vocational school. You may qualify for the American Opportunity Credit or Lifetime Learning Credit.',
    type: 'group' as const,
    required: false,
    conditional: { dependsOn: 'dependents', value: 'yes' },
    inputs: [
      {
        field: 'hasEducationExpenses',
        label: 'I or my dependents had qualified education expenses',
        type: 'checkbox',
        required: false
      },
      {
        field: 'studentName',
        label: 'Student name',
        type: 'text',
        required: false,
        conditional: { dependsOn: 'hasEducationExpenses', value: true }
      },
      {
        field: 'tuitionAndFees',
        label: 'Tuition and fees paid',
        type: 'currency',
        placeholder: '0.00',
        help: 'Form 1098-T from your school',
        required: false,
        conditional: { dependsOn: 'hasEducationExpenses', value: true }
      },
      {
        field: 'yearsOfPostSecondary',
        label: 'Years of post-secondary education completed (for AOTC)',
        type: 'number',
        min: 0,
        max: 10,
        help: 'American Opportunity Credit is limited to first 4 years',
        required: false,
        conditional: { dependsOn: 'hasEducationExpenses', value: true }
      }
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
