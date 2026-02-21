/**
 * HelpButton Component
 *
 * A reusable help icon button that displays contextual help
 * via tooltip or modal. Used throughout forms to provide guidance.
 */

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface HelpButtonProps {
  /** Short help text shown in tooltip */
  tooltip?: string;
  /** Detailed help content shown in expanded view */
  details?: React.ReactNode;
  /** Title for expanded help view */
  title?: string;
  /** Link to external resource */
  learnMoreUrl?: string;
  /** Label for learn more link */
  learnMoreLabel?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show as inline or icon-only */
  variant?: 'icon' | 'inline';
  /** Custom class name */
  className?: string;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const HelpButton: React.FC<HelpButtonProps> = ({
  tooltip,
  details,
  title,
  learnMoreUrl,
  learnMoreLabel = 'Learn more',
  size = 'md',
  variant = 'icon',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const iconElement = (
    <button
      type="button"
      onClick={details ? () => setIsExpanded(!isExpanded) : undefined}
      className={`inline-flex items-center justify-center text-gray-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full transition-colors ${className}`}
      aria-label={title || 'Help'}
      aria-expanded={details ? isExpanded : undefined}
    >
      <HelpCircle className={sizeClasses[size]} />
    </button>
  );

  // Simple tooltip-only mode
  if (tooltip && !details) {
    return <Tooltip content={tooltip}>{iconElement}</Tooltip>;
  }

  // Expandable details mode
  if (details) {
    return (
      <div className="relative inline-block">
        <Tooltip content={tooltip || 'Click for more info'} disabled={isExpanded}>
          {iconElement}
        </Tooltip>

        {isExpanded && (
          <div
            className="absolute z-40 top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg"
            role="region"
            aria-label={title || 'Help information'}
          >
            <div className="p-4">
              {title && (
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close help"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="text-sm text-gray-600">{details}</div>
              {learnMoreUrl && (
                <a
                  href={learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  {learnMoreLabel}
                  <span className="ml-1">→</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return iconElement;
};

export default HelpButton;
