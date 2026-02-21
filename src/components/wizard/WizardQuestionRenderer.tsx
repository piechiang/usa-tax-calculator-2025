import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { WizardQuestion, WizardAnswers } from './types';

interface WizardQuestionRendererProps {
  question: WizardQuestion;
  answers: WizardAnswers;
  errors: Record<string, string>;
  onAnswerChange: (field: string, value: unknown) => void;
}

/**
 * Renders different question types for the Tax Wizard
 */
export const WizardQuestionRenderer: React.FC<WizardQuestionRendererProps> = ({
  question,
  answers,
  errors,
  onAnswerChange,
}) => {
  switch (question.type) {
    case 'radio':
      return (
        <RadioQuestion question={question} answers={answers} onAnswerChange={onAnswerChange} />
      );

    case 'checkbox':
      return (
        <CheckboxQuestion question={question} answers={answers} onAnswerChange={onAnswerChange} />
      );

    case 'group':
      return (
        <GroupQuestion
          question={question}
          answers={answers}
          errors={errors}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'currency':
    case 'number':
      return (
        <NumberQuestion
          question={question}
          answers={answers}
          errors={errors}
          onAnswerChange={onAnswerChange}
        />
      );

    default:
      return (
        <TextQuestion
          question={question}
          answers={answers}
          errors={errors}
          onAnswerChange={onAnswerChange}
        />
      );
  }
};

// Radio Question Component
interface RadioQuestionProps {
  question: WizardQuestion;
  answers: WizardAnswers;
  onAnswerChange: (field: string, value: unknown) => void;
}

const RadioQuestion: React.FC<RadioQuestionProps> = ({ question, answers, onAnswerChange }) => (
  <div className="space-y-3">
    {question.options?.map((option) => (
      <label
        key={option.value}
        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
          answers[question.id] === option.value
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          type="radio"
          name={question.id}
          value={option.value}
          checked={answers[question.id] === option.value}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="sr-only"
          aria-describedby={option.description ? `${question.id}-${option.value}-desc` : undefined}
        />
        <div className="flex items-start gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
              answers[question.id] === option.value
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300'
            }`}
            aria-hidden="true"
          >
            {answers[question.id] === option.value && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
          {option.icon && (
            <option.icon className="w-5 h-5 text-gray-500 mt-0.5" aria-hidden="true" />
          )}
          <div>
            <div className="font-medium text-gray-900">{option.label}</div>
            {option.description && (
              <div
                id={`${question.id}-${option.value}-desc`}
                className="text-sm text-gray-600 mt-1"
              >
                {option.description}
              </div>
            )}
          </div>
        </div>
      </label>
    ))}
  </div>
);

// Checkbox Question Component
interface CheckboxQuestionProps {
  question: WizardQuestion;
  answers: WizardAnswers;
  onAnswerChange: (field: string, value: unknown) => void;
}

const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({
  question,
  answers,
  onAnswerChange,
}) => (
  <div className="space-y-3">
    {question.options?.map((option) => {
      const currentValues = Array.isArray(answers[question.id])
        ? (answers[question.id] as string[])
        : [];
      const isChecked = currentValues.includes(option.value);

      return (
        <label
          key={option.value}
          className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
            isChecked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
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
              onAnswerChange(question.id, newValues);
            }}
            className="sr-only"
          />
          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                isChecked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}
              aria-hidden="true"
            >
              {isChecked && <CheckCircle className="w-3 h-3 text-white" />}
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

// Group Question Component (multiple inputs)
interface GroupQuestionProps {
  question: WizardQuestion;
  answers: WizardAnswers;
  errors: Record<string, string>;
  onAnswerChange: (field: string, value: unknown) => void;
}

const GroupQuestion: React.FC<GroupQuestionProps> = ({
  question,
  answers,
  errors,
  onAnswerChange,
}) => (
  <div className="space-y-4">
    {question.inputs?.map((input) => (
      <div key={input.field}>
        <label htmlFor={input.field} className="block text-sm font-medium text-gray-700 mb-2">
          {input.label}
          {input.required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {input.type === 'select' ? (
          <select
            id={input.field}
            value={String(answers[input.field] || '')}
            onChange={(e) => onAnswerChange(input.field, e.target.value)}
            aria-required={input.required}
            aria-invalid={!!errors[input.field]}
            aria-describedby={errors[input.field] ? `${input.field}-error` : undefined}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors[input.field] ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            {input.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={input.field}
            type={input.type}
            value={String(answers[input.field] || '')}
            onChange={(e) => onAnswerChange(input.field, e.target.value)}
            placeholder={input.placeholder}
            aria-required={input.required}
            aria-invalid={!!errors[input.field]}
            aria-describedby={errors[input.field] ? `${input.field}-error` : undefined}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[input.field] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )}

        {errors[input.field] && (
          <div
            id={`${input.field}-error`}
            role="alert"
            className="flex items-center gap-1 mt-1 text-red-600 text-sm"
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            {errors[input.field]}
          </div>
        )}
      </div>
    ))}
  </div>
);

// Number/Currency Question Component
interface NumberQuestionProps {
  question: WizardQuestion;
  answers: WizardAnswers;
  errors: Record<string, string>;
  onAnswerChange: (field: string, value: unknown) => void;
}

const NumberQuestion: React.FC<NumberQuestionProps> = ({
  question,
  answers,
  errors,
  onAnswerChange,
}) => (
  <div>
    <input
      id={question.id}
      type="number"
      value={String(answers[question.id] || '')}
      onChange={(e) => onAnswerChange(question.id, e.target.value)}
      placeholder={question.type === 'currency' ? '$0.00' : '0'}
      aria-invalid={!!errors[question.id]}
      aria-describedby={errors[question.id] ? `${question.id}-error` : undefined}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        errors[question.id] ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {errors[question.id] && (
      <div
        id={`${question.id}-error`}
        role="alert"
        className="flex items-center gap-1 mt-1 text-red-600 text-sm"
      >
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
        {errors[question.id]}
      </div>
    )}
  </div>
);

// Text Question Component (default)
interface TextQuestionProps {
  question: WizardQuestion;
  answers: WizardAnswers;
  errors: Record<string, string>;
  onAnswerChange: (field: string, value: unknown) => void;
}

const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  answers,
  errors,
  onAnswerChange,
}) => (
  <div>
    <input
      id={question.id}
      type="text"
      value={String(answers[question.id] || '')}
      onChange={(e) => onAnswerChange(question.id, e.target.value)}
      aria-invalid={!!errors[question.id]}
      aria-describedby={errors[question.id] ? `${question.id}-error` : undefined}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        errors[question.id] ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {errors[question.id] && (
      <div
        id={`${question.id}-error`}
        role="alert"
        className="flex items-center gap-1 mt-1 text-red-600 text-sm"
      >
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
        {errors[question.id]}
      </div>
    )}
  </div>
);

// Follow-up Question Renderer
interface FollowUpQuestionsProps {
  questions: WizardQuestion[] | undefined;
  answers: WizardAnswers;
  onAnswerChange: (field: string, value: unknown) => void;
}

export const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  questions,
  answers,
  onAnswerChange,
}) => {
  if (!questions) return null;

  return (
    <>
      {questions.map((followUpQ) => {
        if (followUpQ.condition && !followUpQ.condition(answers)) return null;

        return (
          <div key={followUpQ.id} className="mt-6 pl-4 border-l-2 border-blue-200">
            <label htmlFor={followUpQ.id} className="font-medium text-gray-900 mb-2 block">
              {followUpQ.title}
              {followUpQ.required && (
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              )}
            </label>
            {followUpQ.description && (
              <p className="text-gray-600 mb-3 text-sm">{followUpQ.description}</p>
            )}
            {followUpQ.type === 'currency' || followUpQ.type === 'number' ? (
              <input
                id={followUpQ.id}
                type="number"
                value={String(answers[followUpQ.id] || '')}
                onChange={(e) => onAnswerChange(followUpQ.id, e.target.value)}
                placeholder={followUpQ.type === 'currency' ? '$0.00' : '0'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                id={followUpQ.id}
                type="text"
                value={String(answers[followUpQ.id] || '')}
                onChange={(e) => onAnswerChange(followUpQ.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        );
      })}
    </>
  );
};
