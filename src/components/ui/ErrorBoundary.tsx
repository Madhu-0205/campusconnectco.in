"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Label for logging — e.g. "GigGrid", "UserCard" */
  section?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Wrap every major page section in this component.
 * Users never see a white screen — they see a styled retry card.
 *
 * Usage:
 *   <ErrorBoundary section="GigGrid">
 *     <GigGrid />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary:${this.props.section ?? "unknown"}]`, error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-white/[0.07] bg-[#131929]/80 backdrop-blur-md text-center">
          <div className="w-12 h-12 rounded-xl bg-coral/10 border border-coral/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-[#F43F5E]" />
          </div>
          <div>
            <p className="font-semibold text-slate-200 mb-1">
              Something went wrong
              {this.props.section ? ` in ${this.props.section}` : ""}
            </p>
            <p className="text-slate-400 max-w-xs">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-white/5 border border-white/15 text-slate-200 hover:bg-white/10 hover:border-white/30 active:scale-[0.97] transition-all duration-150"
          >
            <RotateCcw size={14} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
