import React from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardSubsection, WizardQuestion, WizardAnswers } from './types';
import { WizardQuestionRenderer, FollowUpQuestions } from './WizardQuestionRenderer';

interface WizardContentProps {
  currentSubsection: WizardSubsection | null;
  currentQuestion: WizardQuestion | null;
  answers: WizardAnswers;
  errors: Record<string, string>;
  onAnswerChange: (field: string, value: unknown) => void;
}

/**
 * Main content area for the Tax Wizard
 * Displays the current subsection, question, and help text
 */
const WizardContentComponent: React.FC<WizardContentProps> = ({
  currentSubsection,
  currentQuestion,
  answers,
  errors,
  onAnswerChange,
}) => {
  return (
    <div className="p-6 overflow-y-auto flex-1 min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion?.id || 'empty'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Subsection Header */}
          {currentSubsection && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{currentSubsection.title}</h3>
              {currentSubsection.description && (
                <p className="text-gray-600 text-sm mb-4">{currentSubsection.description}</p>
              )}
            </div>
          )}

          {/* Current Question */}
          {currentQuestion && (
            <div className="mb-8">
              {/* Question Header */}
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {currentQuestion.title}
                  {currentQuestion.required && (
                    <span className="text-red-500 ml-1" aria-label="required">
                      *
                    </span>
                  )}
                </h4>
                {currentQuestion.description && (
                  <p className="text-gray-600 mb-3">{currentQuestion.description}</p>
                )}

                {/* Help Text */}
                {currentQuestion.helpText && <HelpBox helpText={currentQuestion.helpText} />}
              </div>

              {/* Question Input */}
              <WizardQuestionRenderer
                question={currentQuestion}
                answers={answers}
                errors={errors}
                onAnswerChange={onAnswerChange}
              />

              {/* Follow-up Questions */}
              <FollowUpQuestions
                questions={currentQuestion.followUp}
                answers={answers}
                onAnswerChange={onAnswerChange}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const WizardContent = React.memo(WizardContentComponent);

interface HelpBoxProps {
  helpText: string;
}

/**
 * Help box component for displaying contextual help
 */
const HelpBox: React.FC<HelpBoxProps> = ({ helpText }) => (
  <div
    className="bg-surface-highlight border border-brand-light/30 rounded-lg p-3 mb-4"
    role="note"
    aria-label="Help information"
  >
    <div className="flex items-start gap-2">
      <HelpCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="text-sm text-brand-dark">
        <strong>Help:</strong> {helpText}
      </div>
    </div>
  </div>
);
