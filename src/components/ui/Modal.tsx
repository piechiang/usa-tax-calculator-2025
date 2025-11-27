import React from 'react';
import { X } from 'lucide-react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
};

/**
 * Accessible modal component with focus trap and ESC handling
 *
 * Features:
 * - Focus trap: Keeps keyboard focus within modal
 * - ESC key handling: Closes modal on escape (configurable)
 * - Backdrop click: Closes modal when clicking outside (configurable)
 * - Focus restoration: Returns focus to trigger element on close
 * - Body scroll lock: Prevents background scrolling
 * - ARIA attributes: role="dialog", aria-modal, aria-labelledby
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const { modalRef, handleBackdropClick } = useModalAccessibility({
    isOpen,
    onClose: closeOnBackdrop ? onClose : () => {},
    enableEscapeKey: closeOnEscape,
  });

  if (!isOpen) return null;

  const modalId = `modal-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeOnBackdrop ? handleBackdropClick : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2
            id={`${modalId}-title`}
            className="text-xl font-semibold text-gray-900"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`Close ${title} modal`}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
