import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.state = { hasError: true, error, errorInfo };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The application encountered an error. Please refresh the page or check the console for details.
            </p>
            {this.state.error && (
              <details className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Error Details
                </summary>
                <pre className="text-sm text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
