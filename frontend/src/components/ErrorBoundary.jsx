import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Clerk Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Authentication temporarily unavailable</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;