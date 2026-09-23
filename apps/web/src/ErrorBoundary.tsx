import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 font-mono text-sm whitespace-pre-wrap">
          <h1>React Error Boundary Caught:</h1>
          {String(this.state.error?.stack || this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}
