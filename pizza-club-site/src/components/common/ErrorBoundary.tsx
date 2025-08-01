import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const isApiError = error?.message?.includes('API URL not configured');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {isApiError ? 'Configuration Error' : 'Something went wrong'}
              </h1>
              
              {isApiError ? (
                <div className="text-left">
                  <p className="text-gray-600 mb-4">
                    The site is not properly configured. The API URL is missing from the build.
                  </p>
                  <div className="bg-gray-100 rounded p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">To fix this:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                      <li>Set the VITE_API_URL environment variable</li>
                      <li>Rebuild the application with npm run build</li>
                      <li>Redeploy the dist folder to your server</li>
                    </ol>
                  </div>
                  <p className="text-xs text-gray-500">
                    Expected API URL: https://greaterchicagolandpizza.club/pizza_api
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    An unexpected error occurred. Please try refreshing the page.
                  </p>
                  {error && (
                    <details className="text-left">
                      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        Error details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {error.message}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}