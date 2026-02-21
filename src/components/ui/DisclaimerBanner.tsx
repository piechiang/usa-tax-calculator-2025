/**
 * Disclaimer Banner Component
 *
 * Displays a legal disclaimer that this is a calculator/estimator tool,
 * not professional tax advice. Essential for liability protection.
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  /** Translation function */
  t: (key: string) => string;
  /** Whether to allow dismissing the banner */
  dismissible?: boolean;
  /** Storage key for dismissed state */
  storageKey?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  t,
  dismissible = true,
  storageKey = 'tax_calculator_disclaimer_dismissed',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (dismissible) {
      const dismissed = sessionStorage.getItem(storageKey);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [dismissible, storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (dismissible) {
      sessionStorage.setItem(storageKey, 'true');
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            {t('disclaimerBanner.title') !== 'disclaimerBanner.title'
              ? t('disclaimerBanner.title')
              : 'Tax Estimation Tool - Not Professional Advice'}
          </h3>
          <div className="mt-1 text-sm text-amber-700">
            <p>
              {t('disclaimerBanner.summary') !== 'disclaimerBanner.summary'
                ? t('disclaimerBanner.summary')
                : 'This calculator provides estimates only. Results may differ from actual tax liability. For accurate tax filing, consult a qualified tax professional or use IRS-approved software.'}
            </p>

            {showDetails && (
              <div className="mt-3 space-y-2 text-xs border-t border-amber-200 pt-3">
                <p>
                  <strong>
                    {t('disclaimerBanner.accuracy') !== 'disclaimerBanner.accuracy'
                      ? t('disclaimerBanner.accuracy')
                      : 'Accuracy:'}
                  </strong>{' '}
                  {t('disclaimerBanner.accuracyText') !== 'disclaimerBanner.accuracyText'
                    ? t('disclaimerBanner.accuracyText')
                    : 'While we strive for accuracy based on 2025 IRS rules, tax law is complex and individual circumstances vary.'}
                </p>
                <p>
                  <strong>
                    {t('disclaimerBanner.notAdvice') !== 'disclaimerBanner.notAdvice'
                      ? t('disclaimerBanner.notAdvice')
                      : 'Not Tax Advice:'}
                  </strong>{' '}
                  {t('disclaimerBanner.notAdviceText') !== 'disclaimerBanner.notAdviceText'
                    ? t('disclaimerBanner.notAdviceText')
                    : 'This tool does not constitute tax, legal, or financial advice. We are not responsible for decisions made based on these estimates.'}
                </p>
                <p>
                  <strong>
                    {t('disclaimerBanner.privacy') !== 'disclaimerBanner.privacy'
                      ? t('disclaimerBanner.privacy')
                      : 'Privacy:'}
                  </strong>{' '}
                  {t('disclaimerBanner.privacyText') !== 'disclaimerBanner.privacyText'
                    ? t('disclaimerBanner.privacyText')
                    : 'All data stays on your device. We do not collect or transmit personal tax information.'}
                </p>
              </div>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-xs text-amber-600 hover:text-amber-800 underline flex items-center gap-1"
            >
              <Info className="h-3 w-3" />
              {showDetails
                ? t('disclaimerBanner.showLess') !== 'disclaimerBanner.showLess'
                  ? t('disclaimerBanner.showLess')
                  : 'Show less'
                : t('disclaimerBanner.learnMore') !== 'disclaimerBanner.learnMore'
                  ? t('disclaimerBanner.learnMore')
                  : 'Learn more about this tool'}
            </button>
          </div>
        </div>
        {dismissible && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex text-amber-400 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
              aria-label={
                t('disclaimerBanner.dismiss') !== 'disclaimerBanner.dismiss'
                  ? t('disclaimerBanner.dismiss')
                  : 'Dismiss disclaimer'
              }
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisclaimerBanner;
