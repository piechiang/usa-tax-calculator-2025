import { useEffect, useRef, useCallback } from 'react';

interface UseModalAccessibilityOptions {
  isOpen: boolean;
  onClose: () => void;
  enableFocusTrap?: boolean;
  enableEscapeKey?: boolean;
  restoreFocusOnClose?: boolean;
}

/**
 * Custom hook for modal accessibility features
 * - Focus trap: Keeps focus within modal
 * - ESC key handling: Closes modal on escape
 * - Focus restoration: Returns focus to trigger element
 */
export function useModalAccessibility({
  isOpen,
  onClose,
  enableFocusTrap = true,
  enableEscapeKey = true,
  restoreFocusOnClose = true,
}: UseModalAccessibilityOptions) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the element that opened the modal
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !enableEscapeKey) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, enableEscapeKey, onClose]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen || !enableFocusTrap || !modalRef.current) return;

    const modal = modalRef.current;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector =
        'a[href], button:not([disabled]), textarea:not([disabled]), ' +
        'input:not([disabled]), select:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"])';

      return Array.from(modal.querySelectorAll(selector)) as HTMLElement[];
    };

    // Focus first element when modal opens
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 0);
    }

    // Trap focus within modal
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: Move backwards
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      }
      // Tab: Move forwards
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, enableFocusTrap]);

  // Restore focus when modal closes
  useEffect(() => {
    return () => {
      if (!isOpen && restoreFocusOnClose && previousActiveElement.current) {
        // Delay to ensure modal is removed from DOM
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }
    };
  }, [isOpen, restoreFocusOnClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return {
    modalRef,
    handleBackdropClick,
  };
}
