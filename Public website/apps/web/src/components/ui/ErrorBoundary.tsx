import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ServerErrorPage } from '../../features/errors/pages/ServerErrorPage.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
  requestId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      hasError: true,
      errorMessage: error.message,
      requestId: `ERR-CS-${randomHex}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error.message, errorInfo.componentStack);
  }

  public handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ServerErrorPage
          requestId={this.state.requestId}
          onRetry={this.handleReload}
          errorDetail={this.state.errorMessage}
          onNavigate={(path) => {
            window.location.href = path;
          }}
        />
      );
    }

    return this.props.children;
  }
}
