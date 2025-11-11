// Offline Indicator
import React from 'react';
import { useApp } from '../context/useApp';
export const OfflineIndicator = () => {
    const { isOnline } = useApp();

    if (isOnline) return null;

    return (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 animate-slide-down">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Offline Mode</span>
        </div>
    );
};