import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  WizardAnswers,
  WizardStep,
  WizardSubsection,
  WizardQuestion,
  WizardProgress,
} from './types';
import { logger } from '../../utils/logger';

const STORAGE_KEY = 'taxWizardProgress';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface UseWizardStateOptions {
  initialData?: WizardAnswers;
  wizardSteps: WizardStep[];
}

interface UseWizardStateReturn {
  // State
  answers: WizardAnswers;
  errors: Record<string, string>;
  completedSteps: Set<string>;
  lastSaved: Date | null;
  currentStepIndex: number;
  currentSubsectionIndex: number;
  currentQuestionIndex: number;

  // Computed values
  visibleSteps: WizardStep[];
  currentStep: WizardStep | undefined;
  currentSubsection: WizardSubsection | null;
  currentQuestion: WizardQuestion | null;
  progress: number;
  isFirstQuestion: boolean;
  isLastStep: boolean;

  // Actions
  setAnswers: React.Dispatch<React.SetStateAction<WizardAnswers>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAnswerChange: (field: string, value: unknown) => void;
  handleNext: () => boolean;
  handlePrevious: () => void;
  validateCurrentQuestion: () => boolean;
  saveToLocalStorage: () => void;
  clearProgress: () => void;
}

export function useWizardState({
  initialData = {},
  wizardSteps,
}: UseWizardStateOptions): UseWizardStateReturn {
  // Navigation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSubsectionIndex, setCurrentSubsectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Data state
  const [answers, setAnswers] = useState<WizardAnswers>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Computed: Get visible steps based on conditions
  const visibleSteps = useMemo(() => {
    return wizardSteps.filter((step) => !step.condition || step.condition(answers));
  }, [wizardSteps, answers]);

  // Computed: Current step
  const currentStep = useMemo(() => {
    return visibleSteps[currentStepIndex];
  }, [visibleSteps, currentStepIndex]);

  // Computed: Current subsection
  const currentSubsection = useMemo(() => {
    if (!currentStep?.subsections) return null;

    const visibleSubsections = currentStep.subsections.filter(
      (subsection) => !subsection.condition || subsection.condition(answers)
    );

    return visibleSubsections[currentSubsectionIndex] || null;
  }, [currentStep, currentSubsectionIndex, answers]);

  // Computed: Current question
  const currentQuestion = useMemo(() => {
    if (!currentSubsection?.questions) return null;

    const visibleQuestions = currentSubsection.questions.filter(
      (question) => !question.condition || question.condition(answers)
    );

    return visibleQuestions[currentQuestionIndex] || null;
  }, [currentSubsection, currentQuestionIndex, answers]);

  // Computed: Progress percentage
  const progress = useMemo(() => {
    if (!currentStep || !currentSubsection) return 0;

    let totalQuestions = 0;
    let answeredQuestions = 0;

    visibleSteps.forEach((step) => {
      const stepSubsections =
        step.subsections?.filter(
          (subsection) => !subsection.condition || subsection.condition(answers)
        ) || [];

      stepSubsections.forEach((subsection) => {
        const visibleQuestions = subsection.questions.filter(
          (question) => !question.condition || question.condition(answers)
        );

        totalQuestions += visibleQuestions.length;

        visibleQuestions.forEach((question) => {
          if (question.type === 'group') {
            const hasAllRequiredInputs = question.inputs?.every(
              (input) => !input.required || answers[input.field]
            );
            if (hasAllRequiredInputs) answeredQuestions++;
          } else if (answers[question.id]) {
            answeredQuestions++;
          }
        });
      });
    });

    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  }, [visibleSteps, currentStep, currentSubsection, answers]);

  // Computed: Navigation flags
  const isFirstQuestion =
    currentStepIndex === 0 && currentSubsectionIndex === 0 && currentQuestionIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      const data: WizardProgress = {
        answers,
        navigation: {
          currentStepIndex,
          currentSubsectionIndex,
          currentQuestionIndex,
        },
        completedSteps: Array.from(completedSteps),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date());
      logger.debug('Wizard progress saved');
    } catch (error) {
      logger.error(
        'Failed to save wizard progress',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [answers, currentStepIndex, currentSubsectionIndex, currentQuestionIndex, completedSteps]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: WizardProgress = JSON.parse(saved);
        setAnswers(data.answers || {});
        setCurrentStepIndex(data.navigation?.currentStepIndex || 0);
        setCurrentSubsectionIndex(data.navigation?.currentSubsectionIndex || 0);
        setCurrentQuestionIndex(data.navigation?.currentQuestionIndex || 0);
        setCompletedSteps(new Set(data.completedSteps || []));
        setLastSaved(data.timestamp ? new Date(data.timestamp) : null);
        logger.info('Wizard progress loaded from storage');
      }
    } catch (error) {
      logger.error(
        'Failed to load wizard progress',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, []);

  // Clear progress
  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setCurrentStepIndex(0);
    setCurrentSubsectionIndex(0);
    setCurrentQuestionIndex(0);
    setCompletedSteps(new Set());
    setLastSaved(null);
    logger.info('Wizard progress cleared');
  }, []);

  // Handle answer change
  const handleAnswerChange = useCallback((field: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  // Validate current question
  const validateCurrentQuestion = useCallback((): boolean => {
    if (!currentQuestion) return true;

    const newErrors: Record<string, string> = {};

    if (currentQuestion.required) {
      if (currentQuestion.type === 'group') {
        currentQuestion.inputs?.forEach((input) => {
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
  }, [currentQuestion, answers]);

  // Handle next navigation
  const handleNext = useCallback((): boolean => {
    if (!validateCurrentQuestion()) return false;

    const visibleSubsections =
      currentStep?.subsections?.filter(
        (subsection) => !subsection.condition || subsection.condition(answers)
      ) || [];

    const visibleQuestions =
      currentSubsection?.questions.filter(
        (question) => !question.condition || question.condition(answers)
      ) || [];

    // Move to next question
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return true;
    }

    // Move to next subsection
    if (currentSubsectionIndex < visibleSubsections.length - 1) {
      setCurrentSubsectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
      return true;
    }

    // Mark current step as completed
    const stepId = currentStep?.id;
    if (stepId) {
      setCompletedSteps((prev) => new Set(Array.from(prev).concat(stepId)));
    }

    // Move to next step
    if (currentStepIndex < visibleSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentSubsectionIndex(0);
      setCurrentQuestionIndex(0);
      return true;
    }

    // Wizard complete - return false to indicate completion
    saveToLocalStorage();
    return false;
  }, [
    validateCurrentQuestion,
    currentStep,
    currentSubsection,
    currentStepIndex,
    currentSubsectionIndex,
    currentQuestionIndex,
    visibleSteps.length,
    answers,
    saveToLocalStorage,
  ]);

  // Handle previous navigation
  const handlePrevious = useCallback(() => {
    // Move to previous question
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      return;
    }

    // Move to previous subsection
    if (currentSubsectionIndex > 0) {
      setCurrentSubsectionIndex((prev) => prev - 1);
      const prevSubsection = currentStep?.subsections?.[currentSubsectionIndex - 1];
      const visibleQuestions =
        prevSubsection?.questions.filter(
          (question) => !question.condition || question.condition(answers)
        ) || [];
      setCurrentQuestionIndex(Math.max(0, visibleQuestions.length - 1));
      return;
    }

    // Move to previous step
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      const prevStep = visibleSteps[currentStepIndex - 1];
      const visibleSubsections =
        prevStep?.subsections?.filter(
          (subsection) => !subsection.condition || subsection.condition(answers)
        ) || [];
      setCurrentSubsectionIndex(Math.max(0, visibleSubsections.length - 1));

      const lastSubsection = visibleSubsections[visibleSubsections.length - 1];
      const visibleQuestions =
        lastSubsection?.questions.filter(
          (question) => !question.condition || question.condition(answers)
        ) || [];
      setCurrentQuestionIndex(Math.max(0, visibleQuestions.length - 1));
    }
  }, [
    currentStepIndex,
    currentSubsectionIndex,
    currentQuestionIndex,
    currentStep,
    visibleSteps,
    answers,
  ]);

  // Auto-save effect
  useEffect(() => {
    const saveInterval = setInterval(saveToLocalStorage, AUTO_SAVE_INTERVAL);
    return () => clearInterval(saveInterval);
  }, [saveToLocalStorage]);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return {
    // State
    answers,
    errors,
    completedSteps,
    lastSaved,
    currentStepIndex,
    currentSubsectionIndex,
    currentQuestionIndex,

    // Computed values
    visibleSteps,
    currentStep,
    currentSubsection,
    currentQuestion,
    progress,
    isFirstQuestion,
    isLastStep,

    // Actions
    setAnswers,
    setErrors,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    validateCurrentQuestion,
    saveToLocalStorage,
    clearProgress,
  };
}
