// src/components/LoadingScreen.jsx 
import React, { useState, useEffect } from 'react';

export const LoadingScreen = ({ message = "Loading your financial data" }) => {
    const [loadingText, setLoadingText] = useState(message);
    const [currentStep, setCurrentStep] = useState(0);

    const loadingSteps = [
        'Loading your financial data',
        'Processing transactions',
        'Calculating insights',
        'Preparing your dashboard',
        'Almost ready...'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => {
                const nextStep = (prev + 1) % loadingSteps.length;
                setLoadingText(loadingSteps[nextStep]);
                return nextStep;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [loadingSteps.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="text-center max-w-md w-full">
                {/* Animated logo */}
                <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl shadow-lg animate-pulse">
                        💸
                    </div>
                    <div className="absolute -inset-2 bg-blue-200 rounded-3xl opacity-50 animate-ping"></div>
                </div>

                {/* Loading spinner */}
                <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full mx-auto"></div>
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                </div>

                {/* App title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    ExpenseFlow
                </h1>

                {/* Loading text with step indicator */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 transition-opacity duration-300 min-h-[24px] flex items-center justify-center">
                    {loadingText}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
                    ></div>
                </div>

                {/* Feature highlights */}
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-6">
                    <p className="flex items-center justify-center gap-1">
                        <span>🔒</span> Your data stays on your device
                    </p>
                    <p className="flex items-center justify-center gap-1">
                        <span>📊</span> Real-time financial insights
                    </p>
                    <p className="flex items-center justify-center gap-1">
                        <span>💾</span> Automatic offline saving
                    </p>
                </div>
            </div>
        </div>
    );
};

// New Skeleton component for loading states
export const SkeletonLoader = ({ type = 'text', className = '' }) => {
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

    const variants = {
        text: 'h-4',
        title: 'h-6',
        card: 'h-32',
        avatar: 'w-12 h-12 rounded-full',
        button: 'h-10',
        chart: 'h-64'
    };

    return <div className={`${baseClasses} ${variants[type]} ${className}`}></div>;
};

// Skeleton for transaction list
export const TransactionListSkeleton = ({ count = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <SkeletonLoader type="avatar" />
                        <div className="space-y-2">
                            <SkeletonLoader type="title" className="w-32" />
                            <SkeletonLoader type="text" className="w-24" />
                            <SkeletonLoader type="text" className="w-20" />
                        </div>
                    </div>
                    <SkeletonLoader type="title" className="w-20" />
                </div>
            </div>
        ))}
    </div>
);