// src/components/ErrorBoundary.jsx

import React from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { logger } from '../utils/logger';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    // eslint-disable-next-line no-unused-vars
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString()
        };

        // Log to console
        logger.error('React Error Boundary caught an error', errorDetails);

        // Store in sessionStorage for debugging
        try {
            const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');
            errors.push(errorDetails);
            sessionStorage.setItem('app_errors', JSON.stringify(errors.slice(-10))); // Keep last 10
        } catch (e) {
            console.error('Failed to store error:', e);
        }

        this.setState({
            error,
            errorInfo,
            errorCount: this.state.errorCount + 1
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleClearData = () => {
        if (confirm('This will clear all local data and reload the app. Continue?')) {
            localStorage.clear();
            sessionStorage.clear();
            indexedDB.deleteDatabase('ExpenseFlowVault');
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            const isDevelopment = import.meta.env.MODE === 'development';

            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                                <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Oops! Something went wrong
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    We encountered an unexpected error
                                </p>
                            </div>
                        </div>

                        {isDevelopment && this.state.error && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 overflow-auto max-h-64">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bug size={16} className="text-red-500" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        Error Details (Development Mode)
                                    </span>
                                </div>
                                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                    {this.state.error.stack}
                                </pre>
                            </div>
                        )}

                        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                                What you can do:
                            </h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                                <li>• Try reloading the page</li>
                                <li>• Check your internet connection</li>
                                <li>• Clear your browser cache</li>
                                <li>• If the problem persists, contact support</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={20} />
                                Reload App
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Try Again
                            </button>

                            {this.state.errorCount > 2 && (
                                <button
                                    onClick={this.handleClearData}
                                    className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition"
                                >
                                    Clear Data
                                </button>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                Error ID: {Date.now().toString(36).toUpperCase()}
                                {isDevelopment && ` | Count: ${this.state.errorCount}`}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}