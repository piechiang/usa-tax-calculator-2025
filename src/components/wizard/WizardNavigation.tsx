import React from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface WizardNavigationProps {
  isFirstQuestion: boolean;
  isLastStep: boolean;
  progress: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onClear: () => void;
}

/**
 * Navigation footer for the Tax Wizard
 * Contains previous/next buttons, save/clear actions, and progress indicator
 */
const WizardNavigationComponent: React.FC<WizardNavigationProps> = ({
  isFirstQuestion,
  isLastStep,
  progress,
  onPrevious,
  onNext,
  onSave,
  onClear,
}) => {
  return (
    <div className="p-6 border-t bg-gray-50 flex-shrink-0">
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={isFirstQuestion}
          type="button"
          className="flex items-center gap-2 px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Go to previous question"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          Previous
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={onSave}
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Save progress"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            Save Progress
          </button>

          <button
            onClick={onClear}
            type="button"
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Start over and clear all progress"
          >
            Start Over
          </button>
        </div>

        <button
          onClick={onNext}
          type="button"
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isLastStep ? 'Complete wizard' : 'Go to next question'}
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && <ChevronRight className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">Progress: {Math.round(progress)}% complete</div>
        <div
          className="w-full bg-gray-200 rounded-full h-2"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall progress"
        >
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const WizardNavigation = React.memo(WizardNavigationComponent);
