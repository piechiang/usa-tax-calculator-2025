import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Save, User, DollarSign, Calculator, Shield, Home, Heart, Building2, HelpCircle, LucideIcon } from 'lucide-react';

// Type for wizard answer data
interface WizardAnswers {
  filingStatus?: string;
  personalInfo?: Record<string, string>;
  spouseInfo?: Record<string, string>;
  hasQualifyingChildren?: string;
  childrenCount?: number;
  hasOtherDependents?: string;
  hasW2Income?: string;
  totalWages?: string;
  federalWithholding?: string;
  spouseHasW2Income?: string;
  spouseTotalWages?: string;
  hasInterestIncome?: string;
  totalInterest?: string;
  hasDividendIncome?: string;
  totalDividends?: string;
  hasCapitalGains?: string;
  netCapitalGains?: string;
  hasSelfEmployment?: string;
  businessNetIncome?: string;
  hasRentalIncome?: string;
  netRentalIncome?: string;
  deductionChoice?: string;
  mortgageInterest?: string;
  mortgageInterestAmount?: string;
  stateLocalTaxes?: string;
  saltAmount?: string;
  charitableGiving?: string;
  charitableAmount?: string;
  childTaxCreditEligible?: string;
  paidEducationExpenses?: string;
  educationExpenseAmount?: string;
  eitcEligible?: string;
  reviewComplete?: string[];
  [key: string]: unknown;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: 'personal' | 'income' | 'deductions' | 'credits' | 'review';
  required: boolean;
  condition?: (data: WizardAnswers) => boolean;
  subsections?: WizardSubsection[];
}

interface WizardSubsection {
  id: string;
  title: string;
  description?: string;
  questions: WizardQuestion[];
  condition?: (data: WizardAnswers) => boolean;
}

interface WizardQuestion {
  id: string;
  title: string;
  description?: string;
  helpText?: string;
  type: 'radio' | 'checkbox' | 'input' | 'number' | 'currency' | 'date' | 'ssn' | 'group';
  required?: boolean;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    icon?: LucideIcon;
  }>;
  inputs?: Array<{
    field: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    validation?: (value: string) => string | null;
  }>;
  validation?: (value: string) => string | null;
  condition?: (data: WizardAnswers) => boolean;
  followUp?: WizardQuestion[];
}

interface TaxWizardProps {
  onComplete: (data: WizardAnswers) => void;
  onCancel: () => void;
  initialData?: WizardAnswers;
  t: (key: string) => string;
}

export const TaxWizard: React.FC<TaxWizardProps> = ({
  onComplete,
  onCancel,
  initialData = {},
  t: _t
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSubsectionIndex, setCurrentSubsectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Define comprehensive wizard steps
  const wizardSteps: WizardStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Let\'s start with your basic personal information',
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
              helpText: 'Your filing status affects your tax rates and standard deduction. Choose carefully as this impacts your entire return.',
              type: 'radio',
              required: true,
              options: [
                {
                  value: 'single',
                  label: 'Single',
                  description: 'You are unmarried or legally separated under a divorce or separate maintenance decree',
                  icon: User
                },
                {
                  value: 'marriedJointly',
                  label: 'Married Filing Jointly',
                  description: 'You are married and you and your spouse agree to file a joint return',
                  icon: Heart
                },
                {
                  value: 'marriedSeparately',
                  label: 'Married Filing Separately',
                  description: 'You are married but choose to file separate returns',
                  icon: User
                },
                {
                  value: 'headOfHousehold',
                  label: 'Head of Household',
                  description: 'You are unmarried and pay more than half the cost of keeping up a home for yourself and a qualifying person',
                  icon: Home
                },
                {
                  value: 'qualifyingSurvivingSpouse',
                  label: 'Qualifying Surviving Spouse',
                  description: 'Your spouse died in a prior tax year and you meet certain conditions',
                  icon: Heart
                }
              ]
            }
          ]
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
                  required: true
                },
                {
                  field: 'lastName',
                  label: 'Last Name',
                  type: 'text',
                  required: true
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
                  }
                },
                {
                  field: 'dateOfBirth',
                  label: 'Date of Birth',
                  type: 'date',
                  required: true
                },
                {
                  field: 'address',
                  label: 'Home Address',
                  type: 'text',
                  required: true
                }
              ]
            }
          ]
        },
        {
          id: 'spouse-info',
          title: 'Spouse Information',
          condition: (data) => data.filingStatus === 'marriedJointly' || data.filingStatus === 'marriedSeparately',
          questions: [
            {
              id: 'spouseInfo',
              title: 'Your Spouse\'s Information',
              type: 'group',
              required: true,
              inputs: [
                {
                  field: 'spouseFirstName',
                  label: 'Spouse First Name',
                  type: 'text',
                  required: true
                },
                {
                  field: 'spouseLastName',
                  label: 'Spouse Last Name',
                  type: 'text',
                  required: true
                },
                {
                  field: 'spouseSSN',
                  label: 'Spouse Social Security Number',
                  type: 'ssn',
                  placeholder: 'XXX-XX-XXXX',
                  required: true
                },
                {
                  field: 'spouseDateOfBirth',
                  label: 'Spouse Date of Birth',
                  type: 'date',
                  required: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'dependents',
      title: 'Dependents & Family',
      description: 'Tell us about your dependents and family situation',
      icon: Heart,
      category: 'personal',
      required: false,
      condition: (data) => data.filingStatus ? ['marriedJointly', 'marriedSeparately', 'headOfHousehold', 'qualifyingSurvivingSpouse'].includes(data.filingStatus) : false,
      subsections: [
        {
          id: 'qualifying-children',
          title: 'Qualifying Children',
          description: 'Children who may qualify for the Child Tax Credit and other benefits',
          questions: [
            {
              id: 'hasQualifyingChildren',
              title: 'Do you have any qualifying children?',
              description: 'A qualifying child is typically your child, stepchild, or grandchild who lived with you for more than half the year',
              type: 'radio',
              options: [
                { value: 'yes', label: 'Yes, I have qualifying children' },
                { value: 'no', label: 'No qualifying children' }
              ],
              followUp: [
                {
                  id: 'childrenCount',
                  title: 'How many qualifying children do you have?',
                  type: 'number',
                  condition: (data) => data.hasQualifyingChildren === 'yes'
                }
              ]
            }
          ]
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
                { value: 'no', label: 'No other dependents' }
              ]
            }
          ]
        }
      ]
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
                { value: 'no', label: 'No W-2 income' }
              ],
              followUp: [
                {
                  id: 'totalWages',
                  title: 'What was your total wage income?',
                  description: 'Enter the total wages from all your W-2 forms',
                  type: 'currency',
                  required: true,
                  condition: (data) => data.hasW2Income === 'yes'
                },
                {
                  id: 'federalWithholding',
                  title: 'How much federal tax was withheld?',
                  description: 'Total federal income tax withheld from all W-2s',
                  type: 'currency',
                  condition: (data) => data.hasW2Income === 'yes'
                }
              ]
            }
          ]
        },
        {
          id: 'spouse-w2',
          title: 'Spouse W-2 Income',
          condition: (data) => data.filingStatus === 'marriedJointly',
          questions: [
            {
              id: 'spouseHasW2Income',
              title: 'Did your spouse receive wages, salaries, or tips in 2025?',
              type: 'radio',
              options: [
                { value: 'yes', label: 'Yes, spouse received W-2 income' },
                { value: 'no', label: 'No spouse W-2 income' }
              ],
              followUp: [
                {
                  id: 'spouseTotalWages',
                  title: 'What was your spouse\'s total wage income?',
                  type: 'currency',
                  condition: (data) => data.spouseHasW2Income === 'yes'
                }
              ]
            }
          ]
        }
      ]
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
                { value: 'no', label: 'No interest income' }
              ],
              followUp: [
                {
                  id: 'totalInterest',
                  title: 'What was your total taxable interest?',
                  type: 'currency',
                  condition: (data) => data.hasInterestIncome === 'yes'
                }
              ]
            }
          ]
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
                { value: 'no', label: 'No dividend income' }
              ],
              followUp: [
                {
                  id: 'totalDividends',
                  title: 'What was your total dividend income?',
                  type: 'currency',
                  condition: (data) => data.hasDividendIncome === 'yes'
                }
              ]
            }
          ]
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
                { value: 'no', label: 'No investment sales' }
              ],
              followUp: [
                {
                  id: 'netCapitalGains',
                  title: 'What was your net capital gain or loss?',
                  description: 'Enter as positive for gains, negative for losses',
                  type: 'currency',
                  condition: (data) => data.hasCapitalGains === 'yes'
                }
              ]
            }
          ]
        }
      ]
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
                { value: 'no', label: 'No self-employment income' }
              ],
              followUp: [
                {
                  id: 'businessNetIncome',
                  title: 'What was your net profit from self-employment?',
                  description: 'Total income minus business expenses',
                  type: 'currency',
                  condition: (data) => data.hasSelfEmployment === 'yes'
                }
              ]
            }
          ]
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
                { value: 'no', label: 'No rental income' }
              ],
              followUp: [
                {
                  id: 'netRentalIncome',
                  title: 'What was your net rental income?',
                  description: 'Rental income minus expenses and depreciation',
                  type: 'currency',
                  condition: (data) => data.hasRentalIncome === 'yes'
                }
              ]
            }
          ]
        }
      ]
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
              description: 'We\'ll help you choose the option that saves you the most money',
              helpText: 'The standard deduction is a fixed amount. Itemizing means listing specific deductible expenses. We recommend itemizing only if your total deductions exceed the standard deduction.',
              type: 'radio',
              options: [
                {
                  value: 'standard',
                  label: 'Take the Standard Deduction (Recommended for most people)',
                  description: 'Simple and often provides the largest deduction'
                },
                {
                  value: 'itemize',
                  label: 'Itemize My Deductions',
                  description: 'List specific deductible expenses'
                },
                {
                  value: 'calculate',
                  label: 'Calculate Both and Choose the Best',
                  description: 'We\'ll determine which option saves you more money'
                }
              ]
            }
          ]
        },
        {
          id: 'itemized-deductions',
          title: 'Itemized Deductions',
          condition: (data) => data.deductionChoice === 'itemize' || data.deductionChoice === 'calculate',
          questions: [
            {
              id: 'mortgageInterest',
              title: 'Did you pay mortgage interest?',
              description: 'Interest paid on your home mortgage',
              type: 'radio',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ],
              followUp: [
                {
                  id: 'mortgageInterestAmount',
                  title: 'How much mortgage interest did you pay?',
                  type: 'currency',
                  condition: (data) => data.mortgageInterest === 'yes'
                }
              ]
            },
            {
              id: 'stateLocalTaxes',
              title: 'Did you pay state and local taxes?',
              description: 'State income tax, local taxes, and property taxes (limited to $10,000 total)',
              type: 'radio',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ],
              followUp: [
                {
                  id: 'saltAmount',
                  title: 'How much did you pay in state and local taxes?',
                  description: 'Maximum deduction is $10,000',
                  type: 'currency',
                  condition: (data) => data.stateLocalTaxes === 'yes'
                }
              ]
            },
            {
              id: 'charitableGiving',
              title: 'Did you make charitable contributions?',
              description: 'Donations to qualified charitable organizations',
              type: 'radio',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ],
              followUp: [
                {
                  id: 'charitableAmount',
                  title: 'How much did you contribute to charity?',
                  type: 'currency',
                  condition: (data) => data.charitableGiving === 'yes'
                }
              ]
            }
          ]
        }
      ]
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
          condition: (data) => data.hasQualifyingChildren === 'yes' || (data.childrenCount !== undefined && data.childrenCount > 0),
          questions: [
            {
              id: 'childTaxCreditEligible',
              title: 'Do your children qualify for the Child Tax Credit?',
              description: 'Children must be under 17 at the end of the tax year',
              helpText: 'The Child Tax Credit is worth up to $2,000 per qualifying child under 17. The child must be your dependent and have a valid Social Security Number.',
              type: 'radio',
              options: [
                { value: 'yes', label: 'Yes, I have qualifying children' },
                { value: 'no', label: 'No qualifying children for this credit' }
              ]
            }
          ]
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
                { value: 'no', label: 'No education expenses' }
              ],
              followUp: [
                {
                  id: 'educationExpenseAmount',
                  title: 'How much did you pay in qualified education expenses?',
                  type: 'currency',
                  condition: (data) => data.paidEducationExpenses === 'yes'
                }
              ]
            }
          ]
        },
        {
          id: 'earned-income-credit',
          title: 'Earned Income Tax Credit (EITC)',
          questions: [
            {
              id: 'eitcEligible',
              title: 'Would you like us to check if you qualify for the Earned Income Tax Credit?',
              description: 'This credit is for working people with low to moderate income',
              helpText: 'The EITC is a refundable credit that can result in a refund even if you don\'t owe taxes. Eligibility depends on income and family size.',
              type: 'radio',
              options: [
                { value: 'yes', label: 'Yes, check my EITC eligibility' },
                { value: 'no', label: 'Skip this credit' }
              ]
            }
          ]
        }
      ]
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
                  label: 'I have reviewed all my information and it is accurate'
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveToLocalStorage();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  // Load from localStorage on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('taxWizardProgress', JSON.stringify({
        answers,
        currentStepIndex,
        currentSubsectionIndex,
        currentQuestionIndex,
        completedSteps: Array.from(completedSteps),
        timestamp: new Date().toISOString()
      }));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('taxWizardProgress');
      if (saved) {
        const data = JSON.parse(saved);
        setAnswers(data.answers || {});
        setCurrentStepIndex(data.currentStepIndex || 0);
        setCurrentSubsectionIndex(data.currentSubsectionIndex || 0);
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        setCompletedSteps(new Set(data.completedSteps || []));
        setLastSaved(data.timestamp ? new Date(data.timestamp) : null);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const clearProgress = () => {
    localStorage.removeItem('taxWizardProgress');
    setAnswers({});
    setCurrentStepIndex(0);
    setCurrentSubsectionIndex(0);
    setCurrentQuestionIndex(0);
    setCompletedSteps(new Set());
    setLastSaved(null);
  };

  // Get filtered steps based on conditions
  const getVisibleSteps = () => {
    return wizardSteps.filter(step =>
      !step.condition || step.condition(answers)
    );
  };

  const getCurrentStep = () => {
    const visibleSteps = getVisibleSteps();
    return visibleSteps[currentStepIndex];
  };

  const getCurrentSubsection = () => {
    const currentStep = getCurrentStep();
    if (!currentStep?.subsections) return null;

    const visibleSubsections = currentStep.subsections.filter(subsection =>
      !subsection.condition || subsection.condition(answers)
    );

    return visibleSubsections[currentSubsectionIndex];
  };

  const getCurrentQuestion = () => {
    const currentSubsection = getCurrentSubsection();
    if (!currentSubsection?.questions) return null;

    const visibleQuestions = currentSubsection.questions.filter(question =>
      !question.condition || question.condition(answers)
    );

    return visibleQuestions[currentQuestionIndex];
  };

  const validateCurrentQuestion = (): boolean => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return true;

    const newErrors: Record<string, string> = {};

    if (currentQuestion.required) {
      if (currentQuestion.type === 'group') {
        currentQuestion.inputs?.forEach(input => {
          if (input.required && !answers[input.field]) {
            newErrors[input.field] = `${input.label} is required`;
          }
          if (input.validation && answers[input.field]) {
            const validationError = input.validation(String(answers[input.field]));
            if (validationError) {
              newErrors[input.field] = validationError;
            }
          }
        });
      } else if (!answers[currentQuestion.id]) {
        newErrors[currentQuestion.id] = 'This field is required';
      }
    }

    if (currentQuestion.validation && answers[currentQuestion.id]) {
      const validationError = currentQuestion.validation(String(answers[currentQuestion.id]));
      if (validationError) {
        newErrors[currentQuestion.id] = validationError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    const currentStep = getCurrentStep();
    const currentSubsection = getCurrentSubsection();
    const visibleSubsections = currentStep?.subsections?.filter(subsection =>
      !subsection.condition || subsection.condition(answers)
    ) || [];
    const visibleQuestions = currentSubsection?.questions.filter(question =>
      !question.condition || question.condition(answers)
    ) || [];

    // Move to next question
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      return;
    }

    // Move to next subsection
    if (currentSubsectionIndex < visibleSubsections.length - 1) {
      setCurrentSubsectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      return;
    }

    // Mark current step as completed
    const stepId = currentStep?.id;
    if (stepId) {
      setCompletedSteps(prev => new Set(Array.from(prev).concat(stepId)));
    }

    // Move to next step
    const visibleSteps = getVisibleSteps();
    if (currentStepIndex < visibleSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setCurrentSubsectionIndex(0);
      setCurrentQuestionIndex(0);
    } else {
      // Wizard complete
      saveToLocalStorage();
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    // Move to previous question
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      return;
    }

    // Move to previous subsection
    if (currentSubsectionIndex > 0) {
      setCurrentSubsectionIndex(prev => prev - 1);
      const currentStep = getCurrentStep();
      const prevSubsection = currentStep?.subsections?.[currentSubsectionIndex - 1];
      const visibleQuestions = prevSubsection?.questions.filter(question =>
        !question.condition || question.condition(answers)
      ) || [];
      setCurrentQuestionIndex(Math.max(0, visibleQuestions.length - 1));
      return;
    }

    // Move to previous step
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      const visibleSteps = getVisibleSteps();
      const prevStep = visibleSteps[currentStepIndex - 1];
      const visibleSubsections = prevStep?.subsections?.filter(subsection =>
        !subsection.condition || subsection.condition(answers)
      ) || [];
      setCurrentSubsectionIndex(Math.max(0, visibleSubsections.length - 1));

      const lastSubsection = visibleSubsections[visibleSubsections.length - 1];
      const visibleQuestions = lastSubsection?.questions.filter(question =>
        !question.condition || question.condition(answers)
      ) || [];
      setCurrentQuestionIndex(Math.max(0, visibleQuestions.length - 1));
    }
  };

  const handleAnswerChange = (field: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'radio':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => (
              <label
                key={option.value}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  {option.icon && (
                    <option.icon className="w-5 h-5 text-gray-500 mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => {
              const currentValues = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as string[] : [];
              const isChecked = currentValues.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      handleAnswerChange(currentQuestion.id, newValues);
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      isChecked
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {isChecked && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    )}
                  </div>
                </div>
              </label>
              );
            })}
          </div>
        );

      case 'group':
        return (
          <div className="space-y-4">
            {currentQuestion.inputs?.map(input => (
              <div key={input.field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {input.label}
                  {input.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={input.type}
                  value={String(answers[input.field] || '')}
                  onChange={(e) => handleAnswerChange(input.field, e.target.value)}
                  placeholder={input.placeholder}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[input.field] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[input.field] && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors[input.field]}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'currency':
      case 'number':
        return (
          <div>
            <input
              type="number"
              value={String(answers[currentQuestion.id] || '')}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.type === 'currency' ? '$0.00' : '0'}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors[currentQuestion.id] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors[currentQuestion.id] && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors[currentQuestion.id]}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={String(answers[currentQuestion.id] || '')}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[currentQuestion.id] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  const getCurrentProgress = () => {
    const visibleSteps = getVisibleSteps();
    const currentStep = getCurrentStep();
    const currentSubsection = getCurrentSubsection();

    if (!currentStep || !currentSubsection) return 0;

    let totalQuestions = 0;
    let answeredQuestions = 0;

    visibleSteps.forEach(step => {
      const visibleSubsections = step.subsections?.filter(subsection =>
        !subsection.condition || subsection.condition(answers)
      ) || [];

      visibleSubsections.forEach(subsection => {
        const visibleQuestions = subsection.questions.filter(question =>
          !question.condition || question.condition(answers)
        );

        totalQuestions += visibleQuestions.length;

        visibleQuestions.forEach(question => {
          if (question.type === 'group') {
            const hasAllRequiredInputs = question.inputs?.every(input =>
              !input.required || answers[input.field]
            );
            if (hasAllRequiredInputs) answeredQuestions++;
          } else if (answers[question.id]) {
            answeredQuestions++;
          }
        });
      });
    });

    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  const visibleSteps = getVisibleSteps();
  const currentStep = getCurrentStep();
  const currentSubsection = getCurrentSubsection();
  const currentQuestion = getCurrentQuestion();
  const progress = getCurrentProgress();

  const isFirstQuestion = currentStepIndex === 0 && currentSubsectionIndex === 0 && currentQuestionIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Progress bar */}
        <div className="bg-gray-100 h-2 relative">
          <div
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute top-0 right-0 h-2 w-12 bg-green-500 opacity-50"
               style={{ width: `${(completedSteps.size / visibleSteps.length) * 100}%` }} />
        </div>

        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {currentStep?.icon && (
                <currentStep.icon className="w-6 h-6 text-blue-600" />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentStep?.title}
                </h2>
                <p className="text-sm text-gray-600">{currentStep?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Save className="w-4 h-4" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {visibleSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                  index === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : completedSteps.has(step.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <step.icon className="w-3 h-3" />
                <span>{step.title}</span>
                {completedSteps.has(step.id) && (
                  <CheckCircle className="w-3 h-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {currentSubsection && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentSubsection.title}
              </h3>
              {currentSubsection.description && (
                <p className="text-gray-600 text-sm mb-4">{currentSubsection.description}</p>
              )}
            </div>
          )}

          {currentQuestion && (
            <div className="mb-8">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {currentQuestion.title}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
                {currentQuestion.description && (
                  <p className="text-gray-600 mb-3">{currentQuestion.description}</p>
                )}
                {currentQuestion.helpText && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <strong>Help:</strong> {currentQuestion.helpText}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {renderQuestion()}

              {/* Show follow-up questions */}
              {currentQuestion.followUp?.map(followUpQ => {
                if (followUpQ.condition && !followUpQ.condition(answers)) return null;

                return (
                  <div key={followUpQ.id} className="mt-6 pl-4 border-l-2 border-blue-200">
                    <h5 className="font-medium text-gray-900 mb-2">
                      {followUpQ.title}
                      {followUpQ.required && <span className="text-red-500 ml-1">*</span>}
                    </h5>
                    {followUpQ.description && (
                      <p className="text-gray-600 mb-3 text-sm">{followUpQ.description}</p>
                    )}
                    {followUpQ.type === 'currency' || followUpQ.type === 'number' ? (
                      <input
                        type="number"
                        value={String(answers[followUpQ.id] || '')}
                        onChange={(e) => handleAnswerChange(followUpQ.id, e.target.value)}
                        placeholder={followUpQ.type === 'currency' ? '$0.00' : '0'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(answers[followUpQ.id] || '')}
                        onChange={(e) => handleAnswerChange(followUpQ.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={saveToLocalStorage}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Save className="w-4 h-4" />
                Save Progress
              </button>

              <button
                onClick={clearProgress}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
              >
                Start Over
              </button>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isLastStep ? 'Complete' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {Math.round(progress)}% complete
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};