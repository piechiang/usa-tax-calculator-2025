/**
 * WelcomeGuide Component
 *
 * First-time user onboarding flow that introduces the tax calculator
 * and guides users through the key features.
 */

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Shield,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
} from 'lucide-react';

interface WelcomeGuideProps {
  /** Translation function */
  t: (key: string) => string;
  /** Callback when guide is completed */
  onComplete: () => void;
  /** Callback when guide is skipped */
  onSkip: () => void;
  /** Storage key for dismissal state */
  storageKey?: string;
}

interface GuideStep {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  titleFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
  tips?: string[];
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    icon: <Calculator className="h-12 w-12 text-blue-500" />,
    titleKey: 'onboarding.welcome.title',
    titleFallback: 'Welcome to USA Tax Calculator 2025',
    descriptionKey: 'onboarding.welcome.description',
    descriptionFallback:
      'This tool helps you estimate your federal and state income taxes. All calculations happen on your device - your data never leaves your computer.',
    tips: [
      'Estimates are based on 2025 IRS tax rules',
      'Results are for planning purposes only',
      'Consult a tax professional for actual filing',
    ],
  },
  {
    id: 'privacy',
    icon: <Shield className="h-12 w-12 text-green-500" />,
    titleKey: 'onboarding.privacy.title',
    titleFallback: 'Your Data Stays Private',
    descriptionKey: 'onboarding.privacy.description',
    descriptionFallback:
      'We take your privacy seriously. All tax calculations run locally in your browser. We never collect, store, or transmit your personal tax information.',
    tips: [
      'No account required to use the calculator',
      'Data is stored only on your device',
      'You can export/backup your data anytime',
    ],
  },
  {
    id: 'features',
    icon: <FileText className="h-12 w-12 text-purple-500" />,
    titleKey: 'onboarding.features.title',
    titleFallback: 'Key Features',
    descriptionKey: 'onboarding.features.description',
    descriptionFallback:
      'Get accurate tax estimates with support for multiple income types, deductions, credits, and state taxes. Compare filing options and discover tax-saving opportunities.',
    tips: [
      'Support for W-2, 1099, and self-employment income',
      'Standard vs itemized deduction comparison',
      'Multiple state tax calculations',
      'Tax optimization suggestions',
    ],
  },
  {
    id: 'help',
    icon: <HelpCircle className="h-12 w-12 text-amber-500" />,
    titleKey: 'onboarding.help.title',
    titleFallback: 'Getting Help',
    descriptionKey: 'onboarding.help.description',
    descriptionFallback:
      'Look for the help icons (?) next to form fields for contextual guidance. The Tax Education Center provides detailed explanations of tax concepts.',
    tips: [
      'Hover over ? icons for quick tips',
      'Use the Tax Wizard for step-by-step guidance',
      'Check the Education Center for tax tutorials',
    ],
  },
];

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({
  t,
  onComplete,
  onSkip,
  storageKey = 'tax_calculator_onboarding_complete',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (completed !== 'true') {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onSkip();
  };

  const nextStep = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isVisible) {
    return null;
  }

  const step = GUIDE_STEPS[currentStep];
  const isLastStep = currentStep === GUIDE_STEPS.length - 1;

  // Safety check: should never happen with proper bounds checking
  if (!step) {
    return null;
  }

  const getTranslation = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated !== key ? translated : fallback;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-guide-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 pt-6 px-6">
          {GUIDE_STEPS.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-blue-500'
                  : index < currentStep
                    ? 'w-2 bg-blue-300'
                    : 'w-2 bg-gray-200'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Skip button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            aria-label="Skip introduction"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 text-center">
          <div className="flex justify-center mb-6">{step.icon}</div>

          <h2 id="welcome-guide-title" className="text-2xl font-bold text-gray-900 mb-4">
            {getTranslation(step.titleKey, step.titleFallback)}
          </h2>

          <p className="text-gray-600 mb-6">
            {getTranslation(step.descriptionKey, step.descriptionFallback)}
          </p>

          {step.tips && (
            <ul className="text-left bg-gray-50 rounded-lg p-4 space-y-2">
              {step.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-8 py-4 bg-gray-50 border-t">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>
              {t('onboarding.back') !== 'onboarding.back' ? t('onboarding.back') : 'Back'}
            </span>
          </button>

          <span className="text-sm text-gray-500">
            {currentStep + 1} / {GUIDE_STEPS.length}
          </span>

          <button
            onClick={nextStep}
            className="flex items-center gap-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <span>
              {isLastStep
                ? t('onboarding.getStarted') !== 'onboarding.getStarted'
                  ? t('onboarding.getStarted')
                  : 'Get Started'
                : t('onboarding.next') !== 'onboarding.next'
                  ? t('onboarding.next')
                  : 'Next'}
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGuide;
