import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

// Type for interview answer data
interface InterviewAnswers {
  [key: string]: unknown;
}

interface InterviewQuestion {
  id: string;
  title: string;
  description?: string;
  type: 'single' | 'multiple' | 'input' | 'group';
  required?: boolean;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  inputs?: Array<{
    field: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
  }>;
  condition?: (data: InterviewAnswers) => boolean;
}

interface InterviewFlowProps {
  questions: InterviewQuestion[];
  onComplete: (data: InterviewAnswers) => void;
  onCancel: () => void;
  t: (key: string) => string;
}

export const InterviewFlow: React.FC<InterviewFlowProps> = ({
  questions,
  onComplete,
  onCancel,
  t
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentQuestion) return true;

    if (currentQuestion.required) {
      if (currentQuestion.type === 'input' || currentQuestion.type === 'group') {
        currentQuestion.inputs?.forEach(input => {
          if (input.required && !answers[input.field]) {
            newErrors[input.field] = t('validation.required');
          }
        });
      } else if (!answers[currentQuestion.id]) {
        newErrors[currentQuestion.id] = t('validation.required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        onComplete(answers);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAnswerChange = (field: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'single':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => (
              <label
                key={option.value}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => {
              const currentValues = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as string[] : [];
              const isChecked = currentValues.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      handleAnswerChange(currentQuestion.id, newValues);
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      isChecked
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {isChecked && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    )}
                  </div>
                </div>
              </label>
              );
            })}
          </div>
        );

      case 'input':
      case 'group':
        return (
          <div className="space-y-4">
            {currentQuestion.inputs?.map(input => (
              <div key={input.field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {input.label}
                  {input.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={input.type}
                  value={String(answers[input.field] || '')}
                  onChange={(e) => handleAnswerChange(input.field, e.target.value)}
                  placeholder={input.placeholder}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[input.field] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[input.field] && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors[input.field]}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="bg-gray-100 h-2">
          <div
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {t('interview.step')} {currentStep + 1} {t('interview.of')} {questions.length}
              </span>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentQuestion.title}
            </h2>
            {currentQuestion.description && (
              <p className="text-gray-600">{currentQuestion.description}</p>
            )}
          </div>

          {/* Question content */}
          <div className="mb-8">
            {renderQuestion()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('interview.previous')}
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isLastStep ? t('interview.complete') : t('interview.next')}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};