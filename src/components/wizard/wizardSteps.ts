import {
  User,
  DollarSign,
  Calculator,
  Shield,
  Home,
  Heart,
  Building2,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { WizardStep, WizardAnswers } from './types';

/**
 * Wizard step configuration for the Tax Wizard
 * Defines all steps, subsections, and questions for the guided tax filing process
 */
export const createWizardSteps = (): WizardStep[] => [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: "Let's start with your basic personal information",
    icon: User,
    category: 'personal',
    required: true,
    subsections: [
      {
        id: 'filing-status',
        title: 'Filing Status',
        description: 'Your filing status determines your tax rates and deductions',
        questions: [
          {
            id: 'filingStatus',
            title: 'What is your filing status?',
            description: 'Choose the status that best describes your situation',
            helpText:
              'Your filing status affects your tax rates and standard deduction. Choose carefully as this impacts your entire return.',
            type: 'radio',
            required: true,
            options: [
              {
                value: 'single',
                label: 'Single',
                description:
                  'You are unmarried or legally separated under a divorce or separate maintenance decree',
                icon: User,
              },
              {
                value: 'marriedJointly',
                label: 'Married Filing Jointly',
                description: 'You are married and you and your spouse agree to file a joint return',
                icon: Heart,
              },
              {
                value: 'marriedSeparately',
                label: 'Married Filing Separately',
                description: 'You are married but choose to file separate returns',
                icon: User,
              },
              {
                value: 'headOfHousehold',
                label: 'Head of Household',
                description:
                  'You are unmarried and pay more than half the cost of keeping up a home for yourself and a qualifying person',
                icon: Home,
              },
              {
                value: 'qualifyingSurvivingSpouse',
                label: 'Qualifying Surviving Spouse',
                description: 'Your spouse died in a prior tax year and you meet certain conditions',
                icon: Heart,
              },
            ],
          },
        ],
      },
      {
        id: 'personal-details',
        title: 'Personal Details',
        questions: [
          {
            id: 'personalInfo',
            title: 'Your Personal Information',
            type: 'group',
            required: true,
            inputs: [
              {
                field: 'firstName',
                label: 'First Name',
                type: 'text',
                required: true,
              },
              {
                field: 'lastName',
                label: 'Last Name',
                type: 'text',
                required: true,
              },
              {
                field: 'ssn',
                label: 'Social Security Number',
                type: 'ssn',
                placeholder: 'XXX-XX-XXXX',
                required: true,
                validation: (value: string) => {
                  const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
                  if (!ssnPattern.test(value)) {
                    return 'Please enter a valid SSN in format XXX-XX-XXXX';
                  }
                  return null;
                },
              },
              {
                field: 'dateOfBirth',
                label: 'Date of Birth',
                type: 'date',
                required: true,
              },
              {
                field: 'address',
                label: 'Home Address',
                type: 'text',
                required: true,
              },
              {
                field: 'state',
                label: 'State of Residence',
                type: 'select',
                options: [
                  { value: 'AL', label: 'Alabama' },
                  { value: 'AK', label: 'Alaska' },
                  { value: 'AZ', label: 'Arizona' },
                  { value: 'AR', label: 'Arkansas' },
                  { value: 'CA', label: 'California' },
                  { value: 'CO', label: 'Colorado' },
                  { value: 'CT', label: 'Connecticut' },
                  { value: 'DE', label: 'Delaware' },
                  { value: 'DC', label: 'District of Columbia' },
                  { value: 'FL', label: 'Florida' },
                  { value: 'GA', label: 'Georgia' },
                  { value: 'HI', label: 'Hawaii' },
                  { value: 'ID', label: 'Idaho' },
                  { value: 'IL', label: 'Illinois' },
                  { value: 'IN', label: 'Indiana' },
                  { value: 'IA', label: 'Iowa' },
                  { value: 'KS', label: 'Kansas' },
                  { value: 'KY', label: 'Kentucky' },
                  { value: 'LA', label: 'Louisiana' },
                  { value: 'ME', label: 'Maine' },
                  { value: 'MD', label: 'Maryland' },
                  { value: 'MA', label: 'Massachusetts' },
                  { value: 'MI', label: 'Michigan' },
                  { value: 'MN', label: 'Minnesota' },
                  { value: 'MS', label: 'Mississippi' },
                  { value: 'MO', label: 'Missouri' },
                  { value: 'MT', label: 'Montana' },
                  { value: 'NE', label: 'Nebraska' },
                  { value: 'NV', label: 'Nevada' },
                  { value: 'NH', label: 'New Hampshire' },
                  { value: 'NJ', label: 'New Jersey' },
                  { value: 'NM', label: 'New Mexico' },
                  { value: 'NY', label: 'New York' },
                  { value: 'NC', label: 'North Carolina' },
                  { value: 'ND', label: 'North Dakota' },
                  { value: 'OH', label: 'Ohio' },
                  { value: 'OK', label: 'Oklahoma' },
                  { value: 'OR', label: 'Oregon' },
                  { value: 'PA', label: 'Pennsylvania' },
                  { value: 'RI', label: 'Rhode Island' },
                  { value: 'SC', label: 'South Carolina' },
                  { value: 'SD', label: 'South Dakota' },
                  { value: 'TN', label: 'Tennessee' },
                  { value: 'TX', label: 'Texas' },
                  { value: 'UT', label: 'Utah' },
                  { value: 'VT', label: 'Vermont' },
                  { value: 'VA', label: 'Virginia' },
                  { value: 'WA', label: 'Washington' },
                  { value: 'WV', label: 'West Virginia' },
                  { value: 'WI', label: 'Wisconsin' },
                  { value: 'WY', label: 'Wyoming' },
                ],
                required: true,
              },
            ],
          },
        ],
      },
      {
        id: 'spouse-info',
        title: 'Spouse Information',
        condition: (data: WizardAnswers) =>
          data.filingStatus === 'marriedJointly' || data.filingStatus === 'marriedSeparately',
        questions: [
          {
            id: 'spouseInfo',
            title: "Your Spouse's Information",
            type: 'group',
            required: true,
            inputs: [
              {
                field: 'spouseFirstName',
                label: 'Spouse First Name',
                type: 'text',
                required: true,
              },
              {
                field: 'spouseLastName',
                label: 'Spouse Last Name',
                type: 'text',
                required: true,
              },
              {
                field: 'spouseSSN',
                label: 'Spouse Social Security Number',
                type: 'ssn',
                placeholder: 'XXX-XX-XXXX',
                required: true,
              },
              {
                field: 'spouseDateOfBirth',
                label: 'Spouse Date of Birth',
                type: 'date',
                required: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'dependents',
    title: 'Dependents & Family',
    description: 'Tell us about your dependents and family situation',
    icon: Heart,
    category: 'personal',
    required: false,
    condition: (data: WizardAnswers) =>
      data.filingStatus
        ? [
            'marriedJointly',
            'marriedSeparately',
            'headOfHousehold',
            'qualifyingSurvivingSpouse',
          ].includes(data.filingStatus)
        : false,
    subsections: [
      {
        id: 'qualifying-children',
        title: 'Qualifying Children',
        description: 'Children who may qualify for the Child Tax Credit and other benefits',
        questions: [
          {
            id: 'hasQualifyingChildren',
            title: 'Do you have any qualifying children?',
            description:
              'A qualifying child is typically your child, stepchild, or grandchild who lived with you for more than half the year',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I have qualifying children' },
              { value: 'no', label: 'No qualifying children' },
            ],
            followUp: [
              {
                id: 'childrenCount',
                title: 'How many qualifying children do you have?',
                type: 'number',
                condition: (data: WizardAnswers) => data.hasQualifyingChildren === 'yes',
              },
            ],
          },
        ],
      },
      {
        id: 'other-dependents',
        title: 'Other Dependents',
        questions: [
          {
            id: 'hasOtherDependents',
            title: 'Do you have other dependents?',
            description: 'This includes qualifying relatives like elderly parents you support',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I have other dependents' },
              { value: 'no', label: 'No other dependents' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'income-wages',
    title: 'Income - Wages & Salary',
    description: 'Report your wage and salary income from employers',
    icon: DollarSign,
    category: 'income',
    required: true,
    subsections: [
      {
        id: 'w2-income',
        title: 'W-2 Wage Income',
        questions: [
          {
            id: 'hasW2Income',
            title: 'Did you receive wages, salaries, or tips in 2025?',
            description: 'This includes income reported on Form W-2',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I received W-2 income' },
              { value: 'no', label: 'No W-2 income' },
            ],
            followUp: [
              {
                id: 'totalWages',
                title: 'What was your total wage income?',
                description: 'Enter the total wages from all your W-2 forms',
                type: 'currency',
                required: true,
                condition: (data: WizardAnswers) => data.hasW2Income === 'yes',
              },
              {
                id: 'federalWithholding',
                title: 'How much federal tax was withheld?',
                description: 'Total federal income tax withheld from all W-2s',
                type: 'currency',
                condition: (data: WizardAnswers) => data.hasW2Income === 'yes',
              },
            ],
          },
        ],
      },
      {
        id: 'spouse-w2',
        title: 'Spouse W-2 Income',
        condition: (data: WizardAnswers) => data.filingStatus === 'marriedJointly',
        questions: [
          {
            id: 'spouseHasW2Income',
            title: 'Did your spouse receive wages, salaries, or tips in 2025?',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, spouse received W-2 income' },
              { value: 'no', label: 'No spouse W-2 income' },
            ],
            followUp: [
              {
                id: 'spouseTotalWages',
                title: "What was your spouse's total wage income?",
                type: 'currency',
                condition: (data: WizardAnswers) => data.spouseHasW2Income === 'yes',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'income-investment',
    title: 'Income - Investments',
    description: 'Report income from investments, banks, and financial accounts',
    icon: DollarSign,
    category: 'income',
    required: false,
    subsections: [
      {
        id: 'interest-income',
        title: 'Interest Income',
        questions: [
          {
            id: 'hasInterestIncome',
            title: 'Did you earn interest income?',
            description: 'From bank accounts, CDs, bonds, or other investments',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I earned interest' },
              { value: 'no', label: 'No interest income' },
            ],
            followUp: [
              {
                id: 'totalInterest',
                title: 'What was your total taxable interest?',
                type: 'currency',
                condition: (data: WizardAnswers) => data.hasInterestIncome === 'yes',
              },
            ],
          },
        ],
      },
      {
        id: 'dividend-income',
        title: 'Dividend Income',
        questions: [
          {
            id: 'hasDividendIncome',
            title: 'Did you receive dividend income?',
            description: 'From stocks, mutual funds, or other investments',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I received dividends' },
              { value: 'no', label: 'No dividend income' },
            ],
            followUp: [
              {
                id: 'totalDividends',
                title: 'What was your total dividend income?',
                type: 'currency',
                condition: (data: WizardAnswers) => data.hasDividendIncome === 'yes',
              },
            ],
          },
        ],
      },
      {
        id: 'capital-gains',
        title: 'Capital Gains & Losses',
        questions: [
          {
            id: 'hasCapitalGains',
            title: 'Did you sell stocks, bonds, or other investments?',
            description: 'Report gains or losses from selling investments',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I sold investments' },
              { value: 'no', label: 'No investment sales' },
            ],
            followUp: [
              {
                id: 'netCapitalGains',
                title: 'What was your net capital gain or loss?',
                description: 'Enter as positive for gains, negative for losses',
                type: 'currency',
                condition: (data: WizardAnswers) => data.hasCapitalGains === 'yes',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'income-business',
    title: 'Income - Business & Self-Employment',
    description: 'Report income from business activities and self-employment',
    icon: Building2,
    category: 'income',
    required: false,
    subsections: [
      {
        id: 'self-employment',
        title: 'Self-Employment Income',
        questions: [
          {
            id: 'hasSelfEmployment',
            title: 'Are you self-employed or do you have business income?',
            description: 'This includes freelance work, consulting, or running a business',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I have self-employment income' },
              { value: 'no', label: 'No self-employment income' },
            ],
            followUp: [
              {
                id: 'businessNetIncome',
                title: 'What was your net profit from self-employment?',
                description: 'Total income minus business expenses',
                type: 'currency',
                condition: (data: WizardAnswers) => data.hasSelfEmployment === 'yes',
              },
            ],
          },
        ],
      },
      {
        id: 'rental-income',
        title: 'Rental Income',
        questions: [
          {
            id: 'hasRentalIncome',
            title: 'Do you own rental property?',
            description: 'Income from renting out real estate property',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I have rental income' },
              { value: 'no', label: 'No rental income' },
            ],
            followUp: [
              {
                id: 'netRentalIncome',
                title: 'What was your net rental income?',
                description: 'Rental income minus expenses and depreciation',
                type: 'currency',
                condition: (data: WizardAnswers) => data.hasRentalIncome === 'yes',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'deductions',
    title: 'Deductions',
    description: 'Choose between standard and itemized deductions',
    icon: Calculator,
    category: 'deductions',
    required: true,
    subsections: [
      {
        id: 'deduction-type',
        title: 'Standard vs Itemized',
        questions: [
          {
            id: 'deductionChoice',
            title: 'How would you like to claim deductions?',
            description: "We'll help you choose the option that saves you the most money",
            helpText:
              'The standard deduction is a fixed amount. Itemizing means listing specific deductible expenses. We recommend itemizing only if your total deductions exceed the standard deduction.',
            type: 'radio',
            options: [
              {
                value: 'standard',
                label: 'Take the Standard Deduction (Recommended for most people)',
                description: 'Simple and often provides the largest deduction',
              },
              {
                value: 'itemize',
                label: 'Itemize My Deductions',
                description: 'List specific deductible expenses',
              },
              {
                value: 'calculate',
                label: 'Calculate Both and Choose the Best',
                description: "We'll determine which option saves you more money",
              },
            ],
          },
        ],
      },
      {
        id: 'itemized-deductions',
        title: 'Itemized Deductions',
        condition: (data: WizardAnswers) =>
          data.deductionChoice === 'itemize' || data.deductionChoice === 'calculate',
        questions: [
          {
            id: 'mortgageInterest',
            title: 'Did you pay mortgage interest?',
            description: 'Interest paid on your home mortgage',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
            followUp: [
              {
                id: 'mortgageInterestAmount',
                title: 'How much mortgage interest did you pay?',
                type: 'currency',
                condition: (data: WizardAnswers) => data.mortgageInterest === 'yes',
              },
            ],
          },
          {
            id: 'stateLocalTaxes',
            title: 'Did you pay state and local taxes?',
            description:
              'State income tax, local taxes, and property taxes (limited to $10,000 total)',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
            followUp: [
              {
                id: 'saltAmount',
                title: 'How much did you pay in state and local taxes?',
                description: 'Maximum deduction is $10,000',
                type: 'currency',
                condition: (data: WizardAnswers) => data.stateLocalTaxes === 'yes',
              },
            ],
          },
          {
            id: 'charitableGiving',
            title: 'Did you make charitable contributions?',
            description: 'Donations to qualified charitable organizations',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
            followUp: [
              {
                id: 'charitableAmount',
                title: 'How much did you contribute to charity?',
                type: 'currency',
                condition: (data: WizardAnswers) => data.charitableGiving === 'yes',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'credits',
    title: 'Tax Credits',
    description: 'Claim credits that can reduce your tax bill',
    icon: Shield,
    category: 'credits',
    required: false,
    subsections: [
      {
        id: 'child-tax-credit',
        title: 'Child Tax Credit',
        condition: (data: WizardAnswers) =>
          data.hasQualifyingChildren === 'yes' ||
          (data.childrenCount !== undefined && data.childrenCount > 0),
        questions: [
          {
            id: 'childTaxCreditEligible',
            title: 'Do your children qualify for the Child Tax Credit?',
            description: 'Children must be under 17 at the end of the tax year',
            helpText:
              'The Child Tax Credit is worth up to $2,000 per qualifying child under 17. The child must be your dependent and have a valid Social Security Number.',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I have qualifying children' },
              { value: 'no', label: 'No qualifying children for this credit' },
            ],
          },
        ],
      },
      {
        id: 'child-care-credit',
        title: 'Child and Dependent Care Credit',
        questions: [
          {
            id: 'paidChildCareExpenses',
            title: 'Did you pay for child care or dependent care?',
            description: 'Care expenses that allowed you or your spouse to work or look for work',
            helpText:
              'You may qualify for a credit of 20-35% of up to $3,000 in care expenses for one qualifying person, or up to $6,000 for two or more.',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I paid child/dependent care expenses' },
              { value: 'no', label: 'No child/dependent care expenses' },
            ],
            followUp: [
              {
                id: 'childCareExpenseAmount',
                title: 'How much did you pay for child/dependent care?',
                type: 'currency',
                condition: (data: WizardAnswers) => data.paidChildCareExpenses === 'yes',
              },
            ],
          },
        ],
      },
      {
        id: 'education-credits',
        title: 'Education Credits',
        questions: [
          {
            id: 'paidEducationExpenses',
            title: 'Did you pay qualified education expenses?',
            description: 'Tuition and fees for yourself, spouse, or dependents',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, I paid education expenses' },
              { value: 'no', label: 'No education expenses' },
            ],
            followUp: [
              {
                id: 'educationExpenseAmount',
                title: 'How much did you pay in qualified education expenses?',
                type: 'currency',
                condition: (data: WizardAnswers) => data.paidEducationExpenses === 'yes',
              },
            ],
          },
        ],
      },
      {
        id: 'earned-income-credit',
        title: 'Earned Income Tax Credit (EITC)',
        questions: [
          {
            id: 'eitcEligible',
            title: 'Would you like us to check if you qualify for the Earned Income Tax Credit?',
            description: 'This credit is for working people with low to moderate income',
            helpText:
              "The EITC is a refundable credit that can result in a refund even if you don't owe taxes. Eligibility depends on income and family size.",
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes, check my EITC eligibility' },
              { value: 'no', label: 'Skip this credit' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'state-tax',
    title: 'State Tax Details',
    description: 'Specific questions for your state',
    icon: MapPin,
    category: 'personal',
    required: false,
    condition: (data: WizardAnswers) => {
      // Check if state is selected and is one of the states with specific questions
      return !!data.state && ['CA', 'NY'].includes(data.state as string);
    },
    subsections: [
      {
        id: 'ca-specifics',
        title: 'California Questions',
        condition: (data: WizardAnswers) => data.state === 'CA',
        questions: [
          {
            id: 'youngChildrenUnder6',
            title: 'How many children under age 6 do you have?',
            description: 'You may qualify for the Young Child Tax Credit',
            type: 'number',
            required: false,
          },
        ],
      },
      {
        id: 'ny-specifics',
        title: 'New York Questions',
        condition: (data: WizardAnswers) => data.state === 'NY',
        questions: [
          {
            id: 'yonkersResident',
            title: 'Are you a resident of Yonkers?',
            description: 'Residents of Yonkers are subject to a city income tax surcharge',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'nycResident',
            title: 'Are you a resident of New York City?',
            description: 'NYC residents pay a separate local income tax',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your information before submitting',
    icon: CheckCircle,
    category: 'review',
    required: true,
    subsections: [
      {
        id: 'final-review',
        title: 'Final Review',
        questions: [
          {
            id: 'reviewComplete',
            title: 'Please review your tax information',
            description: 'Make sure all information is accurate before submitting',
            type: 'checkbox',
            options: [
              {
                value: 'confirmed',
                label: 'I have reviewed all my information and it is accurate',
              },
            ],
          },
        ],
      },
    ],
  },
];
