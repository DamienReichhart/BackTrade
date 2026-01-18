import { Component, type ReactNode } from "react";
import { InternalServerError } from "../../features/errors";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component for catching React errors
 *
 * Catches errors in the component tree and displays an error page
 */
export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console for debugging
        // eslint-disable-next-line no-console
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided, otherwise use default error page
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <InternalServerError />;
        }

        return this.props.children;
    }
}
