import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060D1A] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'An unexpected rendering error occurred. Please refresh the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-sky-400 hover:bg-sky-300 text-[#060D1A] font-extrabold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
