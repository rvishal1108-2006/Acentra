import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Error Boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 ring-8 ring-rose-500/5">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Unexpected Application Exception
          </h1>
          <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
            The enterprise telemetry subsystem encountered an unhandled exception. 
            State isolation has protected adjacent worker processes.
          </p>

          {this.state.error && (
            <div className="w-full max-w-lg p-4 rounded-xl bg-slate-900 border border-slate-800 text-left font-mono text-xs text-rose-400 overflow-x-auto mb-6">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={this.handleReset}
            >
              Recover & Reload
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
