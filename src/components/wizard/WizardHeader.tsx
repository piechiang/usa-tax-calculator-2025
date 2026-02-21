import React from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { WizardStep } from './types';

interface WizardHeaderProps {
  currentStep: WizardStep | undefined;
  visibleSteps: WizardStep[];
  currentStepIndex: number;
  completedSteps: Set<string>;
  lastSaved: Date | null;
  onCancel: () => void;
}

/**
 * Header component for the Tax Wizard
 * Displays current step info, progress indicators, and save status
 */
const WizardHeaderComponent: React.FC<WizardHeaderProps> = ({
  currentStep,
  visibleSteps,
  currentStepIndex,
  completedSteps,
  lastSaved,
  onCancel,
}) => {
  return (
    <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {currentStep?.icon && (
            <currentStep.icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{currentStep?.title}</h2>
            <p className="text-sm text-gray-600">{currentStep?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close wizard"
            type="button"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <nav aria-label="Wizard steps">
        <ol className="flex items-center gap-2 overflow-x-auto pb-2">
          {visibleSteps.map((step, index) => (
            <li key={step.id}>
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                  index === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : completedSteps.has(step.id)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                }`}
                aria-current={index === currentStepIndex ? 'step' : undefined}
              >
                <step.icon className="w-3 h-3" aria-hidden="true" />
                <span>{step.title}</span>
                {completedSteps.has(step.id) && (
                  <CheckCircle className="w-3 h-3" aria-label="Completed" />
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const WizardHeader = React.memo(WizardHeaderComponent);

interface WizardProgressBarProps {
  progress: number;
  completedSteps: Set<string>;
  totalSteps: number;
}

/**
 * Progress bar component showing overall wizard completion
 */
const WizardProgressBarComponent: React.FC<WizardProgressBarProps> = ({
  progress,
  completedSteps,
  totalSteps,
}) => {
  return (
    <div
      className="bg-gray-100 h-2 relative flex-shrink-0"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Wizard progress"
    >
      <div
        className="bg-blue-600 h-2 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-0 right-0 h-2 bg-green-500 opacity-50"
        style={{ width: `${(completedSteps.size / totalSteps) * 100}%` }}
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const WizardProgressBar = React.memo(WizardProgressBarComponent);
