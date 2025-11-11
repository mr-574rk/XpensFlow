// src/components/KeyboardShortcutsHelp.jsx - New file
import React from 'react';
import { useShortcutsHelp } from '../hooks/useKeyboardShortcuts';

export const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
    const { shortcuts } = useShortcutsHelp();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold dark:text-white">Keyboard Shortcuts</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Close shortcuts help"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(shortcuts).map(([category, categoryShortcuts]) => (
                            <div key={category}>
                                <h3 className="text-lg font-semibold mb-3 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    {category}
                                </h3>
                                <div className="space-y-2">
                                    {categoryShortcuts.map(({ action, display, description }) => (
                                        <div key={action} className="flex justify-between items-center py-2">
                                            <span className="text-gray-700 dark:text-gray-300">{description}</span>
                                            <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono border border-gray-300 dark:border-gray-600 min-w-[80px] text-center">
                                                {display}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Press <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono border">?</kbd> to show this help anytime
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};