import React from 'react';

export interface DataFetchingErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface DataFetchingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DataFetchingErrorBoundary extends React.Component<
  DataFetchingErrorBoundaryProps,
  DataFetchingErrorBoundaryState
> {
  constructor(props: DataFetchingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DataFetchingErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Data fetching error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Data Loading Error</h3>
          <p className="text-red-600 mt-2">{this.state.error?.message}</p>
          <button 
            onClick={this.handleRetry}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DataFetchingErrorBoundary;