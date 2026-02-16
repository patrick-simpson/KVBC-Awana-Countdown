import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Simple Error Boundary to catch React render errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <div className="bg-black p-4 rounded border border-gray-700 max-w-2xl overflow-auto">
             <p className="font-mono text-sm text-red-300">{this.state.error?.toString()}</p>
             <p className="mt-4 text-gray-400 text-sm">Check the console for more details.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);