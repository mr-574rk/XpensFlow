// src/components/OfflineFallback.jsx
import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineFallback = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <WifiOff size={64} className="text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    You're Offline
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    ExpenseFlow works offline, but we need to load the app first.
                    Please check your connection and try again.
                </p>
                <button
                    onClick={handleRetry}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-2 mx-auto"
                >
                    <RefreshCw size={20} />
                    Retry
                </button>
            </div>
        </div>
    );
};