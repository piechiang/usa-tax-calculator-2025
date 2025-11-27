import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, Calculator, FileText, TrendingUp } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
}

interface TaxFormData {
  personalInfo?: {
    filingStatus?: string;
    isMaryland?: boolean;
  };
  incomeData?: {
    wages?: string | number;
  };
  deductions?: {
    useStandardDeduction?: boolean;
    standardDeduction?: number;
    itemizedTotal?: number;
  };
}

interface TaxCalculationResult {
  adjustedGrossIncome?: number;
  taxableIncome?: number;
  federalTax?: number;
  totalTax?: number;
}

interface TaxAssistantProps {
  formData: TaxFormData;
  taxResult: TaxCalculationResult;
  t: (key: string) => string;
}

export const TaxAssistant: React.FC<TaxAssistantProps> = ({
  formData,
  taxResult,
  t
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('assistant.greeting'),
      sender: 'assistant',
      timestamp: new Date(),
      suggestions: [
        t('assistant.suggestion1'),
        t('assistant.suggestion2'),
        t('assistant.suggestion3')
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Tax optimization questions
    if (message.includes('reduce') || message.includes('lower') || message.includes('save')) {
      const wagesValue = formData.incomeData?.wages;
      const income = wagesValue ? parseFloat(String(wagesValue)) : 0;
      let suggestions = [];

      if (income > 50000) {
        suggestions.push("• Maximize your 401(k) contributions - you could save up to " + (Math.min(23000, income * 0.2) * 0.22).toLocaleString() + " in taxes");
      }
      if (income > 25000) {
        suggestions.push("• Consider an HSA if available - $4,300 contribution could save $946 in taxes");
      }
      suggestions.push("• Track business expenses if self-employed");
      suggestions.push("• Consider tax-loss harvesting for investments");

      return `Based on your income of $${income.toLocaleString()}, here are ways to reduce your taxes:\n\n${suggestions.join('\n')}`;
    }

    // Deduction questions
    if (message.includes('deduction') || message.includes('itemize')) {
      const standardDed = formData.deductions?.standardDeduction || 0;
      const itemizedTotal = formData.deductions?.itemizedTotal || 0;

      if (itemizedTotal > standardDed) {
        return `You should itemize your deductions! Your itemized deductions ($${itemizedTotal.toLocaleString()}) exceed the standard deduction ($${standardDed.toLocaleString()}) by $${(itemizedTotal - standardDed).toLocaleString()}.`;
      } else {
        return `You should take the standard deduction of $${standardDed.toLocaleString()}. Your itemized deductions only total $${itemizedTotal.toLocaleString()}.`;
      }
    }

    // Tax calculation explanation
    if (message.includes('explain') || message.includes('calculation') || message.includes('how')) {
      const deductionAmount = formData.deductions?.useStandardDeduction
        ? (formData.deductions?.standardDeduction ?? 0)
        : (formData.deductions?.itemizedTotal ?? 0);

      return `Here's how your taxes are calculated:

1. **Gross Income**: $${(taxResult.adjustedGrossIncome || 0).toLocaleString()}
2. **Standard/Itemized Deduction**: $${deductionAmount.toLocaleString()}
3. **Taxable Income**: $${(taxResult.taxableIncome || 0).toLocaleString()}
4. **Federal Tax**: $${(taxResult.federalTax || 0).toLocaleString()}
5. **Total Tax**: $${(taxResult.totalTax || 0).toLocaleString()}

Your effective tax rate is ${(((taxResult.totalTax ?? 0) / (taxResult.adjustedGrossIncome ?? 1)) * 100 || 0).toFixed(1)}%`;
    }

    // Filing status questions
    if (message.includes('filing status') || message.includes('married') || message.includes('single')) {
      const status = formData.personalInfo?.filingStatus;
      let advice = '';

      if (status === 'marriedJointly') {
        advice = "Filing jointly typically provides better tax benefits for married couples, but consider comparing with filing separately if you have significantly different incomes or large itemized deductions.";
      } else if (status === 'marriedSeparately') {
        advice = "Filing separately might make sense if one spouse has large medical expenses or miscellaneous deductions, but joint filing usually results in lower taxes overall.";
      } else {
        advice = "Your filing status determines your tax brackets and standard deduction amount.";
      }

      return `Your current filing status is "${status ?? 'not set'}". ${advice}`;
    }

    // State tax questions
    if (message.includes('state tax') || message.includes('state')) {
      const isMaryland = formData.personalInfo?.isMaryland;
      if (isMaryland) {
        return "Maryland has both state and local income taxes. The state rate ranges from 2% to 5.75%, plus local taxes that vary by county (typically around 3.2% for Baltimore City).";
      } else {
        return "State taxes vary significantly by state. Some states like Florida, Texas, and Washington have no income tax, while others like California and New York have high rates.";
      }
    }

    // Retirement questions
    if (message.includes('retirement') || message.includes('401k') || message.includes('ira')) {
      return `Retirement savings offer excellent tax benefits:

• **401(k)**: Contribute up to $23,000 (2025 limit), plus $7,500 catch-up if 50+
• **Traditional IRA**: Up to $7,000 deductible contribution ($8,000 if 50+)
• **Roth IRA**: After-tax contributions, tax-free growth (income limits apply)
• **HSA**: Triple tax advantage - deductible, tax-free growth, tax-free withdrawals for medical expenses`;
    }

    // Business/self-employment
    if (message.includes('business') || message.includes('self-employed') || message.includes('1099')) {
      return `Self-employment tax considerations:

• You'll pay both employer and employee portions of Social Security/Medicare (15.3%)
• Deduct business expenses: office supplies, equipment, mileage, home office
• Consider quarterly estimated tax payments to avoid penalties
• You may be eligible for the 20% QBI deduction on business income`;
    }

    // General tax tips
    if (message.includes('tips') || message.includes('advice')) {
      return `Here are my top tax tips:

* **Keep good records** - Track all receipts and documents
* **Maximize deductions** - Don't miss eligible expenses
* **Plan ahead** - Consider tax implications of major decisions
* **File on time** - Avoid penalties and interest
* **Review annually** - Tax laws change frequently
* **Consider professional help** - For complex situations`;
    }

    // Default response
    return "I'd be happy to help with that! I can assist with tax calculations, deductions, filing status advice, retirement planning, and general tax strategies. Could you be more specific about what you'd like to know?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(inputMessage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Calculator, label: t('assistant.quickAction1'), query: t('assistant.query1') },
    { icon: FileText, label: t('assistant.quickAction2'), query: t('assistant.query2') },
    { icon: TrendingUp, label: t('assistant.quickAction3'), query: t('assistant.query3') },
    { icon: Lightbulb, label: t('assistant.quickAction4'), query: t('assistant.query4') }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <h3 className="text-lg font-semibold">{t('assistant.title')}</h3>
        </div>
        <p className="text-blue-100 text-sm mt-1">{t('assistant.subtitle')}</p>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(action.query)}
              className="flex items-center gap-2 p-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <action.icon className="h-3 w-3 text-blue-600" />
              <span className="text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-purple-500 text-white'
            }`}>
              {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className={`max-w-[80%] ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}>
              <div className={`inline-block p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>

              {message.suggestions && (
                <div className="mt-2 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left p-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-gray-100 rounded-lg rounded-bl-none p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t('assistant.placeholder')}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-2 text-center">
          💡 {t('assistant.tip')}
        </div>
      </div>
    </div>
  );
};