import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProviders } from './contexts/AppProviders';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { errorLogger } from './utils/errorLogger';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary onError={(error, errorInfo) => errorLogger.log(error, errorInfo)}>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
