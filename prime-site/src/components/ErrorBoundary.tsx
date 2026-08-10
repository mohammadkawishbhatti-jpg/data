/**
 * ErrorBoundary — catches React render errors so a single broken page
 * never takes down the entire site. Shows a friendly fallback instead.
 */
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#1a2f5a] mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            This page ran into an error. Please try refreshing, or go back to the homepage.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ error: null })}
              className="bg-[#1a2f5a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1a2f5a]/90 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Go Home
            </a>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-6 text-left text-xs text-red-600 bg-red-50 p-4 rounded-lg max-w-2xl overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
