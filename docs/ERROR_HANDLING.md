# Error Handling & Error Boundaries

This document describes the error handling strategy implemented in the USA Tax Calculator application.

## Overview

The application uses React Error Boundaries to provide graceful error handling and recovery throughout the UI. This ensures that JavaScript errors in one part of the component tree don't crash the entire application.

## Architecture

### Error Boundary Component

Location: `src/components/error/ErrorBoundary.tsx`

The `ErrorBoundary` component:
- Catches JavaScript errors anywhere in its child component tree
- Logs error information to the console (development) and error logger (all environments)
- Displays a fallback UI when an error occurs
- Provides recovery options (retry, go home, reload)
- Can be customized with custom fallback UI

### Error Logger

Location: `src/utils/errorLogger.ts`

The error logger provides:
- Centralized error logging
- In-memory error storage (last 50 errors)
- Console logging in development
- Ability to download error logs as JSON
- Global handlers for unhandled errors and promise rejections
- Ready for integration with external services (Sentry, LogRocket, etc.)

## Usage

### Basic Usage

Wrap any component with an error boundary:

```typescript
import { ErrorBoundary } from './components/error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Error Handler

```typescript
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { errorLogger } from './utils/errorLogger';

<ErrorBoundary
  onError={(error, errorInfo) => {
    errorLogger.log(error, errorInfo, { section: 'checkout' });
  }}
>
  <CheckoutForm />
</ErrorBoundary>
```

### With Reset Keys

Automatically reset the error boundary when certain props change:

```typescript
<ErrorBoundary resetKeys={[userId, currentPage]}>
  <UserProfile />
</ErrorBoundary>
```

### With Custom Fallback UI

```typescript
<ErrorBoundary
  fallback={
    <div className="error-message">
      Something went wrong with this feature.
    </div>
  }
>
  <FeatureComponent />
</ErrorBoundary>
```

### HOC Pattern

For functional components, you can use the HOC:

```typescript
import { withErrorBoundary } from './components/error/ErrorBoundary';

const MyComponent = () => {
  // component logic
};

export default withErrorBoundary(MyComponent, {
  onError: (error, errorInfo) => console.error(error)
});
```

## Error Boundary Placement

The application has error boundaries at multiple levels:

### 1. Root Level
Location: `src/index.tsx`

Catches all errors in the entire application tree.

### 2. Section Level
Location: `src/components/app/AppShell.tsx`

Individual error boundaries around:
- Header section
- Action buttons
- Main view (Classic/Modern mode)
- Modal manager

This granular approach ensures that an error in one section doesn't affect the rest of the application.

## Error Logging

### Accessing Logs

In the browser console:

```javascript
// Get all error logs
errorLogger.getLogs()

// Get error summary
errorLogger.getSummary()

// Download logs as JSON file
errorLogger.downloadLogs()

// Clear all logs
errorLogger.clearLogs()
```

### Log Format

Each error log includes:
- `timestamp`: When the error occurred
- `error`: The error object (message, stack trace)
- `errorInfo`: React error info (component stack)
- `context`: Additional context (custom data)
- `userAgent`: Browser information
- `url`: Page URL where error occurred

## Error Recovery

The error boundary provides multiple recovery options:

1. **Try Again**: Resets the error boundary and retries rendering
2. **Go Home**: Navigates to the home page
3. **Reload Page**: Full page reload (last resort)

## Development vs Production

### Development Mode
- Full error details shown in the UI
- Complete stack traces displayed
- Console.group logging with detailed information

### Production Mode
- User-friendly error message only
- No technical details exposed
- Errors logged to error logger for debugging
- Ready for integration with error tracking services

## Integration with External Services

The error logger is designed to be easily extended. Example integration with Sentry:

```typescript
// src/utils/errorLogger.ts

import * as Sentry from '@sentry/react';

class ErrorLogger {
  log(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>): void {
    // ... existing logging code ...

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        contexts: {
          react: errorInfo,
          ...context
        }
      });
    }
  }
}
```

## Best Practices

1. **Granular Boundaries**: Place error boundaries around major sections, not just at the root level
2. **Context Logging**: Always include context when logging errors to help with debugging
3. **User Communication**: Provide clear, actionable error messages to users
4. **Recovery Options**: Always give users a way to recover from errors
5. **Development Visibility**: Log errors prominently during development
6. **Production Monitoring**: Integrate with error tracking services in production

## Testing

To test error boundaries in development:

```typescript
// Create a component that throws an error
const BuggyComponent = () => {
  throw new Error('Test error!');
  return <div>This will not render</div>;
};

// Wrap it in an error boundary
<ErrorBoundary>
  <BuggyComponent />
</ErrorBoundary>
```

## Future Enhancements

Potential improvements:
- Automatic error reporting to external services
- User feedback collection when errors occur
- Error categorization and analytics
- Retry strategies with exponential backoff
- Offline error queue for network failures

## Resources

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling in React](https://react.dev/learn/error-boundaries)
