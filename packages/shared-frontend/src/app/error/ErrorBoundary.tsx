import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from './ErrorPage';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    return this.state.hasError ? <ErrorPage /> : this.props.children;
  }
}

export { ErrorBoundary };
