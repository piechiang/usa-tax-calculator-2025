// Main component
export { TaxWizard } from './TaxWizard';

// Types
export type {
  TaxWizardProps,
  WizardAnswers,
  WizardStep,
  WizardSubsection,
  WizardQuestion,
  WizardOption,
  WizardInput,
  WizardNavigationState,
  WizardProgress,
} from './types';

// Sub-components (for advanced usage)
export { WizardHeader, WizardProgressBar } from './WizardHeader';
export { WizardContent } from './WizardContent';
export { WizardNavigation } from './WizardNavigation';
export { WizardQuestionRenderer, FollowUpQuestions } from './WizardQuestionRenderer';

// Hooks and utilities
export { useWizardState } from './useWizardState';
export { createWizardSteps } from './wizardSteps';
