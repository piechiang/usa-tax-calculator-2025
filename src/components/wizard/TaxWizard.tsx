import React, { useMemo } from 'react';
import { TaxWizardProps } from './types';
import { createWizardSteps } from './wizardSteps';
import { useWizardState } from './useWizardState';
import { WizardHeader, WizardProgressBar } from './WizardHeader';
import { WizardContent } from './WizardContent';
import { WizardNavigation } from './WizardNavigation';

/**
 * Tax Wizard - A guided step-by-step tax filing experience
 *
 * This component has been refactored from a 1300+ line monolith into
 * smaller, focused sub-components for better maintainability:
 *
 * - types.ts: Type definitions
 * - wizardSteps.ts: Step configuration data
 * - useWizardState.ts: State management hook
 * - WizardHeader.tsx: Header and step indicator
 * - WizardContent.tsx: Main question content
 * - WizardNavigation.tsx: Navigation buttons
 * - WizardQuestionRenderer.tsx: Question type renderers
 */
export const TaxWizard: React.FC<TaxWizardProps> = ({
  onComplete,
  onCancel,
  initialData = {},
  t: _t,
}) => {
  // Create wizard steps configuration
  const wizardSteps = useMemo(() => createWizardSteps(), []);

  // Initialize wizard state
  const {
    answers,
    errors,
    completedSteps,
    lastSaved,
    visibleSteps,
    currentStep,
    currentSubsection,
    currentQuestion,
    progress,
    isFirstQuestion,
    isLastStep,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    saveToLocalStorage,
    clearProgress,
  } = useWizardState({
    initialData,
    wizardSteps,
  });

  // Handle next button click
  const onNextClick = () => {
    const canProceed = handleNext();
    if (!canProceed && isLastStep) {
      // Wizard is complete
      saveToLocalStorage();
      onComplete(answers);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div className="bg-white md:rounded-lg shadow-xl max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Progress bar */}
        <WizardProgressBar
          progress={progress}
          completedSteps={completedSteps}
          totalSteps={visibleSteps.length}
        />

        {/* Header with step indicators */}
        <WizardHeader
          currentStep={currentStep}
          visibleSteps={visibleSteps}
          currentStepIndex={visibleSteps.indexOf(currentStep!)}
          completedSteps={completedSteps}
          lastSaved={lastSaved}
          onCancel={onCancel}
        />

        {/* Main content area */}
        <WizardContent
          currentSubsection={currentSubsection}
          currentQuestion={currentQuestion}
          answers={answers}
          errors={errors}
          onAnswerChange={handleAnswerChange}
        />

        {/* Navigation buttons */}
        <WizardNavigation
          isFirstQuestion={isFirstQuestion}
          isLastStep={isLastStep}
          progress={progress}
          onPrevious={handlePrevious}
          onNext={onNextClick}
          onSave={saveToLocalStorage}
          onClear={clearProgress}
        />
      </div>
    </div>
  );
};

// Re-export types for external use
export type { TaxWizardProps, WizardAnswers } from './types';
