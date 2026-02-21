import { lazy, Suspense } from 'react';

const TaxWizard = lazy(() => import('../wizard/TaxWizard').then((m) => ({ default: m.TaxWizard })));

interface WizardModalProps {
  isOpen: boolean;
  onComplete: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  t: (key: string) => string;
}

export function WizardModal({ isOpen, onComplete, onCancel, t }: WizardModalProps) {
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
      <TaxWizard onComplete={onComplete} onCancel={onCancel} t={t} />
    </Suspense>
  );
}
