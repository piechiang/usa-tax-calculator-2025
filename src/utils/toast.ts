/**
 * Simple toast notification utility
 * Replaces browser alert() with non-blocking toast notifications
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  type?: ToastType;
}

const DEFAULT_DURATION = 3000;

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-gray-900',
  info: 'bg-blue-500 text-white'
};

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ'
};

export function showToast(message: string, options: ToastOptions = {}): void {
  const { duration = DEFAULT_DURATION, type = 'info' } = options;

  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `${toastStyles[type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md pointer-events-auto transform translate-x-0 transition-transform duration-300 ease-in-out`;
  toast.setAttribute('role', 'alert');

  // Add icon
  const icon = document.createElement('span');
  icon.className = 'text-xl font-bold flex-shrink-0';
  icon.textContent = toastIcons[type];
  toast.appendChild(icon);

  // Add message
  const messageEl = document.createElement('span');
  messageEl.className = 'flex-1 text-sm font-medium';
  messageEl.textContent = message;
  toast.appendChild(messageEl);

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'ml-2 text-lg font-bold opacity-75 hover:opacity-100 transition-opacity flex-shrink-0';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close notification');
  closeBtn.onclick = () => removeToast(toast);
  toast.appendChild(closeBtn);

  // Slide in animation
  toast.style.transform = 'translateX(400px)';
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });

  // Auto-remove after duration
  const timeoutId = setTimeout(() => {
    removeToast(toast);
  }, duration);

  // Store timeout ID for potential early removal
  toast.dataset.timeoutId = String(timeoutId);
}

function removeToast(toast: HTMLElement): void {
  // Clear timeout if exists
  const timeoutId = toast.dataset.timeoutId;
  if (timeoutId) {
    clearTimeout(Number(timeoutId));
  }

  // Slide out animation
  toast.style.transform = 'translateX(400px)';
  toast.style.opacity = '0';

  setTimeout(() => {
    toast.remove();

    // Remove container if empty
    const container = document.getElementById('toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

// Convenience methods
export const toast = {
  success: (message: string, duration?: number) => showToast(message, { type: 'success', duration }),
  error: (message: string, duration?: number) => showToast(message, { type: 'error', duration }),
  warning: (message: string, duration?: number) => showToast(message, { type: 'warning', duration }),
  info: (message: string, duration?: number) => showToast(message, { type: 'info', duration })
};
