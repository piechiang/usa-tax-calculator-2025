import { lazy, Suspense } from 'react';

const InterviewFlow = lazy(() =>
  import('../interview/InterviewFlow').then(m => ({ default: m.InterviewFlow }))
);

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
  condition?: (data: Record<string, unknown>) => boolean;
}

interface InterviewFlowModalProps {
  isOpen: boolean;
  questions: InterviewQuestion[];
  onComplete: (data: Record<string, string>) => void;
  onCancel: () => void;
  t: (key: string) => string;
}

export function InterviewFlowModal({
  isOpen,
  questions,
  onComplete,
  onCancel,
  t
}: InterviewFlowModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <InterviewFlow questions={questions} onComplete={onComplete} onCancel={onCancel} t={t} />
    </Suspense>
  );
}
