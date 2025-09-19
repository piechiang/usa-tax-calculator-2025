import React, { useState } from 'react';
import { HelpCircle, Info, AlertTriangle, CheckCircle, ExternalLink, Book, Calculator, DollarSign, FileText, Users, ChevronDown } from 'lucide-react';

interface GuidanceItem {
  type: 'info' | 'warning' | 'tip' | 'requirement' | 'calculation';
  title: string;
  content: string;
  icon?: React.ComponentType<any>;
  links?: Array<{
    text: string;
    url: string;
    isExternal?: boolean;
  }>;
}

interface TaxGuidanceContext {
  isMarried?: boolean;
  amount?: number;
  numChildren?: number;
  [key: string]: any;
}

interface TaxGuidanceProps {
  field: string;
  context?: TaxGuidanceContext;
  t: (key: string) => string;
  className?: string;
}

export const TaxGuidance: React.FC<TaxGuidanceProps> = ({
  field,
  context,
  t,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getGuidanceForField = (fieldName: string): GuidanceItem[] => {
    const guidanceMap: Record<string, GuidanceItem[]> = {
      'filingStatus': [
        {
          type: 'info',
          title: 'Choosing Your Filing Status',
          content: 'Your filing status determines your tax rates, standard deduction, and eligibility for certain credits and deductions.',
          icon: Info,
          links: [
            { text: 'IRS Filing Status Guide', url: 'https://www.irs.gov/taxtopics/tc351', isExternal: true }
          ]
        },
        {
          type: 'tip',
          title: 'Married Couples',
          content: 'If you\'re married, you can choose to file jointly or separately. Filing jointly usually results in lower taxes, but there are exceptions.',
          icon: Users
        },
        {
          type: 'calculation',
          title: 'Head of Household',
          content: 'To qualify for Head of Household, you must be unmarried and pay more than half the cost of keeping up a home for a qualifying person.',
          icon: Calculator
        }
      ],

      'personalInfo.ssn': [
        {
          type: 'requirement',
          title: 'Social Security Number Required',
          content: 'You must enter a valid SSN exactly as it appears on your Social Security card. This is required for all tax returns.',
          icon: AlertTriangle
        },
        {
          type: 'info',
          title: 'SSN Format',
          content: 'Enter your SSN in the format XXX-XX-XXXX. Do not include spaces or other characters.',
          icon: Info
        },
        {
          type: 'warning',
          title: 'Privacy Notice',
          content: 'Your SSN is encrypted and stored securely. It will only be used for tax calculation and filing purposes.',
          icon: AlertTriangle
        }
      ],

      'hasW2Income': [
        {
          type: 'info',
          title: 'W-2 Wage Income',
          content: 'Include all wages, salaries, and tips reported on Form W-2. If you had multiple employers, add all W-2s together.',
          icon: DollarSign
        },
        {
          type: 'tip',
          title: 'Where to Find This Information',
          content: 'Look at Box 1 (Wages, tips, other compensation) on your W-2 form(s). This is your total taxable wages.',
          icon: FileText,
          links: [
            { text: 'Understanding Your W-2', url: 'https://www.irs.gov/forms-pubs/about-form-w2', isExternal: true }
          ]
        },
        {
          type: 'calculation',
          title: 'Multiple Jobs',
          content: 'If you had multiple W-2s, enter the total of all Box 1 amounts. Don\'t forget about any part-time or seasonal work.',
          icon: Calculator
        }
      ],

      'totalWages': [
        {
          type: 'requirement',
          title: 'Enter Total Wages',
          content: 'This should match the total of Box 1 from all your W-2 forms. Include wages from all employers.',
          icon: CheckCircle
        },
        {
          type: 'tip',
          title: 'Don\'t Include',
          content: 'Don\'t include pre-tax deductions like 401(k) contributions, health insurance premiums, or parking fees.',
          icon: Info
        }
      ],

      'hasInterestIncome': [
        {
          type: 'info',
          title: 'Interest Income Sources',
          content: 'Include interest from bank accounts, CDs, bonds, and other interest-bearing investments.',
          icon: DollarSign
        },
        {
          type: 'tip',
          title: 'Tax Documents',
          content: 'Look for Form 1099-INT from banks and financial institutions. Interest over $10 should be reported.',
          icon: FileText
        },
        {
          type: 'calculation',
          title: 'Tax-Exempt Interest',
          content: 'Interest from municipal bonds may be tax-exempt but still needs to be reported in some cases.',
          icon: Calculator
        }
      ],

      'hasDividendIncome': [
        {
          type: 'info',
          title: 'Dividend Income',
          content: 'Include dividends from stocks, mutual funds, and other investments reported on Form 1099-DIV.',
          icon: DollarSign
        },
        {
          type: 'tip',
          title: 'Qualified vs Ordinary',
          content: 'Qualified dividends are taxed at lower capital gains rates, while ordinary dividends are taxed as regular income.',
          icon: Info
        }
      ],

      'hasSelfEmployment': [
        {
          type: 'warning',
          title: 'Self-Employment Tax',
          content: 'Self-employment income is subject to both income tax and self-employment tax (Social Security and Medicare).',
          icon: AlertTriangle
        },
        {
          type: 'tip',
          title: 'Business Expenses',
          content: 'You can deduct legitimate business expenses to reduce your taxable self-employment income.',
          icon: Calculator,
          links: [
            { text: 'Business Expense Guide', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/deducting-business-expenses', isExternal: true }
          ]
        }
      ],

      'deductionChoice': [
        {
          type: 'info',
          title: 'Standard vs Itemized Deductions',
          content: 'You can either take the standard deduction (a fixed amount) or itemize your deductions (list specific expenses).',
          icon: Calculator
        },
        {
          type: 'tip',
          title: 'Which to Choose',
          content: 'Choose itemized deductions only if they exceed your standard deduction amount. We\'ll help you determine which is better.',
          icon: CheckCircle
        },
        {
          type: 'calculation',
          title: '2025 Standard Deductions',
          content: 'Single: $15,750 | Married Filing Jointly: $31,500 | Head of Household: $23,350',
          icon: DollarSign
        }
      ],

      'mortgageInterest': [
        {
          type: 'info',
          title: 'Mortgage Interest Deduction',
          content: 'You can deduct interest paid on mortgages for your main home and a second home.',
          icon: DollarSign
        },
        {
          type: 'requirement',
          title: 'Form 1098 Required',
          content: 'You should receive Form 1098 from your mortgage lender showing the interest you paid.',
          icon: FileText
        },
        {
          type: 'warning',
          title: 'Debt Limits',
          content: 'The deduction is limited to interest on the first $750,000 of mortgage debt ($375,000 if married filing separately).',
          icon: AlertTriangle
        }
      ],

      'stateLocalTaxes': [
        {
          type: 'warning',
          title: 'SALT Deduction Limit',
          content: 'State and local tax deductions are limited to $10,000 total ($5,000 if married filing separately).',
          icon: AlertTriangle
        },
        {
          type: 'info',
          title: 'What\'s Included',
          content: 'This includes state income taxes, local income taxes, and property taxes. Choose either income taxes OR sales taxes, not both.',
          icon: Info
        }
      ],

      'charitableGiving': [
        {
          type: 'tip',
          title: 'Charitable Contribution Limits',
          content: 'Cash contributions are generally limited to 60% of your adjusted gross income.',
          icon: Calculator
        },
        {
          type: 'requirement',
          title: 'Documentation Required',
          content: 'Keep receipts for all donations. Donations over $250 require written acknowledgment from the charity.',
          icon: FileText,
          links: [
            { text: 'Charitable Deduction Guide', url: 'https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contribution-deductions', isExternal: true }
          ]
        }
      ],

      'hasQualifyingChildren': [
        {
          type: 'info',
          title: 'Qualifying Child Tests',
          content: 'A qualifying child must meet relationship, age, residency, and support tests.',
          icon: Users
        },
        {
          type: 'tip',
          title: 'Child Tax Credit',
          content: 'Qualifying children under 17 may be eligible for the Child Tax Credit worth up to $2,000 per child.',
          icon: DollarSign
        },
        {
          type: 'calculation',
          title: 'Age Limits',
          content: 'Child must be under 19 (or 24 if a full-time student) and younger than you (or your spouse if filing jointly).',
          icon: CheckCircle
        }
      ],

      'paidEducationExpenses': [
        {
          type: 'info',
          title: 'Education Credits Available',
          content: 'Two main credits: American Opportunity Tax Credit (AOTC) and Lifetime Learning Credit (LLC).',
          icon: Book
        },
        {
          type: 'tip',
          title: 'AOTC vs LLC',
          content: 'AOTC: Up to $2,500 for first 4 years of college. LLC: Up to $2,000 for any post-secondary education.',
          icon: Calculator
        },
        {
          type: 'requirement',
          title: 'Form 1098-T Required',
          content: 'You should receive Form 1098-T from the educational institution showing qualified expenses.',
          icon: FileText
        }
      ]
    };

    return guidanceMap[fieldName] || [];
  };

  const getContextualGuidance = (): GuidanceItem[] => {
    const baseGuidance = getGuidanceForField(field);
    const contextualGuidance: GuidanceItem[] = [];

    // Add context-specific guidance
    if (field === 'filingStatus' && context?.isMarried) {
      contextualGuidance.push({
        type: 'calculation',
        title: 'Joint vs Separate Filing',
        content: 'We\'ll calculate both options and recommend the one that saves you more money.',
        icon: Calculator
      });
    }

    if (field === 'totalWages' && context?.amount && context.amount > 100000) {
      contextualGuidance.push({
        type: 'tip',
        title: 'High Income Considerations',
        content: 'With higher income, consider maximizing retirement contributions and other tax-advantaged accounts.',
        icon: DollarSign
      });
    }

    if (field === 'hasQualifyingChildren' && context?.numChildren && context.numChildren > 2) {
      contextualGuidance.push({
        type: 'tip',
        title: 'Multiple Children Benefits',
        content: 'With multiple children, you may qualify for additional credits and have more favorable tax brackets.',
        icon: Users
      });
    }

    return [...baseGuidance, ...contextualGuidance];
  };

  const guidance = getContextualGuidance();

  if (guidance.length === 0) {
    return null;
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'info': return Info;
      case 'warning': return AlertTriangle;
      case 'tip': return CheckCircle;
      case 'requirement': return AlertTriangle;
      case 'calculation': return Calculator;
      default: return HelpCircle;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'info': return 'blue';
      case 'warning': return 'amber';
      case 'tip': return 'green';
      case 'requirement': return 'red';
      case 'calculation': return 'purple';
      default: return 'gray';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        border: 'border-blue-400',
        text: 'text-blue-600',
        textDark: 'text-blue-900',
        textLight: 'text-blue-700',
        bg: 'bg-blue-100',
        button: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700',
        hover: 'hover:text-blue-800'
      },
      amber: {
        border: 'border-amber-400',
        text: 'text-amber-600',
        textDark: 'text-amber-900',
        textLight: 'text-amber-700',
        bg: 'bg-amber-100',
        button: 'bg-amber-600',
        buttonHover: 'hover:bg-amber-700',
        hover: 'hover:text-amber-800'
      },
      green: {
        border: 'border-green-400',
        text: 'text-green-600',
        textDark: 'text-green-900',
        textLight: 'text-green-700',
        bg: 'bg-green-100',
        button: 'bg-green-600',
        buttonHover: 'hover:bg-green-700',
        hover: 'hover:text-green-800'
      },
      red: {
        border: 'border-red-400',
        text: 'text-red-600',
        textDark: 'text-red-900',
        textLight: 'text-red-700',
        bg: 'bg-red-100',
        button: 'bg-red-600',
        buttonHover: 'hover:bg-red-700',
        hover: 'hover:text-red-800'
      },
      purple: {
        border: 'border-purple-400',
        text: 'text-purple-600',
        textDark: 'text-purple-900',
        textLight: 'text-purple-700',
        bg: 'bg-purple-100',
        button: 'bg-purple-600',
        buttonHover: 'hover:bg-purple-700',
        hover: 'hover:text-purple-800'
      },
      gray: {
        border: 'border-gray-400',
        text: 'text-gray-600',
        textDark: 'text-gray-900',
        textLight: 'text-gray-700',
        bg: 'bg-gray-100',
        button: 'bg-gray-600',
        buttonHover: 'hover:bg-gray-700',
        hover: 'hover:text-gray-800'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">Help & Guidance</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {guidance.length} tip{guidance.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {guidance.map((item, index) => {
            const IconComponent = item.icon || getIconForType(item.type);
            const color = getColorForType(item.type);
            const colorClasses = getColorClasses(color);

            return (
              <div
                key={index}
                className={`border-l-4 ${colorClasses.border} pl-4 py-2`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className={`w-5 h-5 ${colorClasses.text} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${colorClasses.textDark} mb-1`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm ${colorClasses.textLight} mb-2`}>
                      {item.content}
                    </p>
                    {item.links && item.links.length > 0 && (
                      <div className="space-y-1">
                        {item.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target={link.isExternal ? '_blank' : '_self'}
                            rel={link.isExternal ? 'noopener noreferrer' : undefined}
                            className={`inline-flex items-center gap-1 text-sm ${colorClasses.text} ${colorClasses.hover} underline`}
                          >
                            {link.text}
                            {link.isExternal && (
                              <ExternalLink className="w-3 h-3" />
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick access to common resources */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h5 className="font-medium text-gray-900 mb-2">Additional Resources</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="https://www.irs.gov/forms-pubs/about-publication-17"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 text-sm"
              >
                <Book className="w-4 h-4 text-gray-600" />
                <span>IRS Publication 17</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
              </a>
              <a
                href="https://www.irs.gov/help/tax-law-questions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 text-sm"
              >
                <HelpCircle className="w-4 h-4 text-gray-600" />
                <span>Tax Law Help</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxGuidance;