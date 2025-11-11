// src/components/CurrencyNotification.jsx
import React from 'react';
import { Settings, Globe, CheckCircle } from 'lucide-react';

export const CurrencyNotification = ({ show, onClose, onGoToSettings, currentCurrency }) => {
    if (!show) return null;

    return (
        <div className="fixed top-20 right-4 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-down">
            <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />

                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                        Currency Set to {currentCurrency}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        You can change your preferred currency anytime in Settings to match your local currency.
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={onGoToSettings}
                            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                        >
                            <Settings size={16} />
                            Change Currency
                        </button>
                        <button
                            onClick={onClose}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};