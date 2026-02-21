/**
 * Central logging system for the application
 * Replaces scattered console.* statements with a unified logging interface
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
  error?: Error;
  context?: Record<string, unknown>;
}

interface LoggerConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Whether to include timestamps in console output */
  includeTimestamps: boolean;
  /** Whether logging is enabled */
  enabled: boolean;
  /** Custom log handler for external logging services */
  customHandler?: (entry: LogEntry) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#6B7280', // gray
  info: '#3B82F6', // blue
  warn: '#F59E0B', // amber
  error: '#EF4444', // red
};

class Logger {
  private config: LoggerConfig;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: import.meta.env.DEV ? 'debug' : 'warn',
      includeTimestamps: true,
      enabled: true,
      ...config,
    };
  }

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  /**
   * Format a log message for console output
   */
  private formatMessage(level: LogLevel, message: string): string {
    const prefix = `[${level.toUpperCase()}]`;
    if (this.config.includeTimestamps) {
      const timestamp = new Date().toISOString();
      return `${timestamp} ${prefix} ${message}`;
    }
    return `${prefix} ${message}`;
  }

  /**
   * Add entry to log history
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      error,
      context,
    };

    this.addToHistory(entry);

    // Call custom handler if provided
    if (this.config.customHandler) {
      this.config.customHandler(entry);
    }

    // Console output
    const formattedMessage = this.formatMessage(level, message);
    const color = LOG_COLORS[level];
    const style = `color: ${color}; font-weight: bold;`;

    switch (level) {
      case 'debug':
        if (context) {
          console.debug(`%c${formattedMessage}`, style, context);
        } else {
          console.debug(`%c${formattedMessage}`, style);
        }
        break;

      case 'info':
        if (context) {
          console.info(`%c${formattedMessage}`, style, context);
        } else {
          console.info(`%c${formattedMessage}`, style);
        }
        break;

      case 'warn':
        if (context) {
          console.warn(`%c${formattedMessage}`, style, context);
        } else {
          console.warn(`%c${formattedMessage}`, style);
        }
        break;

      case 'error':
        if (error) {
          console.error(`%c${formattedMessage}`, style, error, context);
        } else if (context) {
          console.error(`%c${formattedMessage}`, style, context);
        } else {
          console.error(`%c${formattedMessage}`, style);
        }
        break;
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, undefined, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, undefined, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, undefined, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, error, context);
  }

  /**
   * Get log history
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Create a child logger with additional context
   */
  createChild(childContext: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, childContext);
  }
}

/**
 * Child logger that inherits from parent with additional context
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private context: Record<string, unknown>
  ) {}

  debug(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.context, ...additionalContext });
  }

  info(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.context, ...additionalContext });
  }

  warn(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.context, ...additionalContext });
  }

  error(message: string, error?: Error, additionalContext?: Record<string, unknown>): void {
    this.parent.error(message, error, { ...this.context, ...additionalContext });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating additional instances if needed
export { Logger, ChildLogger };
export type { LogEntry, LoggerConfig };
