
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogService } from '../services/errorLogService';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        errorLogService.logError(error, errorInfo.componentStack);
    }

    private handleFix = () => {
        // Attempt to fix by clearing cache and reloading.
        // In a real app, this could be more sophisticated.
        try {
            sessionStorage.clear();
            window.location.reload();
        } catch (e) {
            this.setState({ hasError: false }); // Fallback reset
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold text-red-500 mb-2">Something went wrong.</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Our self-healing robot is fixing it now...</p>
                        <button 
                            onClick={this.handleFix}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
