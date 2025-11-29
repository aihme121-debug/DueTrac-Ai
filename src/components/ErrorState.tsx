import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from './ui/ui-components';

interface ErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  error?: Error;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We\'re sorry, but something unexpected happened.',
  description,
  onRetry,
  onGoHome,
  showDetails = false,
  error,
  className = ''
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-600 text-center">
            <p className="mb-2">{message}</p>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
            {showDetails && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono text-left">
                  <p className="text-red-600 font-semibold">
                    {error.message}
                  </p>
                  {error.stack && (
                    <pre className="mt-2 text-gray-600 overflow-auto max-h-32 text-xs">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            <Button
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Specialized error state components
export const NetworkErrorState: React.FC<{
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ onRetry, onGoHome }) => (
  <ErrorState
    title="Connection Error"
    message="Unable to connect to the server."
    description="Please check your internet connection and try again."
    onRetry={onRetry}
    onGoHome={onGoHome}
  />
);

export const PermissionErrorState: React.FC<{
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ onRetry, onGoHome }) => (
  <ErrorState
    title="Access Denied"
    message="You don't have permission to access this resource."
    description="Please contact your administrator if you believe this is an error."
    onRetry={onRetry}
    onGoHome={onGoHome}
  />
);

export const NotFoundErrorState: React.FC<{
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ onRetry, onGoHome }) => (
  <ErrorState
    title="Not Found"
    message="The requested resource could not be found."
    description="It may have been moved or deleted."
    onRetry={onRetry}
    onGoHome={onGoHome}
  />
);

export const TimeoutErrorState: React.FC<{
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ onRetry, onGoHome }) => (
  <ErrorState
    title="Request Timeout"
    message="The request took too long to complete."
    description="Please try again in a few moments."
    onRetry={onRetry}
    onGoHome={onGoHome}
  />
);

export const ServerErrorState: React.FC<{
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ onRetry, onGoHome }) => (
  <ErrorState
    title="Server Error"
    message="An error occurred on the server."
    description="Our team has been notified. Please try again later."
    onRetry={onRetry}
    onGoHome={onGoHome}
  />
);

// Loading error state for when data fails to load
export const DataLoadErrorState: React.FC<{
  resourceName?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ resourceName, onRetry, onGoHome }) => (
  <ErrorState
    title="Failed to Load Data"
    message={`Unable to load ${resourceName || 'data'}.`}
    description="Please check your connection and try again."
    onRetry={onRetry}
    onGoHome={onGoHome}
  />
);

// Form validation error state
export const FormErrorState: React.FC<{
  errors: Record<string, string[]>;
  onRetry?: () => void;
}> = ({ errors, onRetry }) => (
  <ErrorState
    title="Validation Error"
    message="Please correct the following errors:"
    description={Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n')}
    onRetry={onRetry}
  />
);