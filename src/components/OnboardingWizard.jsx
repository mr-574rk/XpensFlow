// src/components/OnboardingWizard.jsx

import React, { useState } from 'react';
import {
    CheckCircle,
    Lock,
    Target,
    TrendingUp,
    Zap,
    ArrowRight,
    X,
    Shield
} from 'lucide-react';

export const OnboardingWizard = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(0);
    const [setupData, setSetupData] = useState({
        pin: '',
        confirmPin: '',
        enableEncryption: true,
        budgets: {},
        currency: 'USD'
    });

    const steps = [
        {
            id: 'welcome',
            title: 'Welcome to ExpenseFlow! 💸',
            description: 'Your privacy-first, offline-capable expense tracker',
            icon: <Zap size={48} className="text-blue-500" />,
            content: (
                <div className="text-center space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                            <Lock className="mx-auto mb-2 text-blue-500" size={32} />
                            <h4 className="font-bold mb-1">Secure</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Bank-grade encryption
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                            <Target className="mx-auto mb-2 text-green-500" size={32} />
                            <h4 className="font-bold mb-1">Smart</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                AI-powered insights
                            </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                            <TrendingUp className="mx-auto mb-2 text-purple-500" size={32} />
                            <h4 className="font-bold mb-1">Offline</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Works everywhere
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-6">
                        Let's get you set up in just a few steps!
                    </p>
                </div>
            )
        },
        {
            id: 'security',
            title: 'Secure Your Data 🔐',
            description: 'Set up encryption to protect your financial information',
            icon: <Lock size={48} className="text-green-500" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Important:</strong> Your PIN is used to encrypt all data locally.
                            If you forget it, your data cannot be recovered.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">
                            Create a PIN (6+ characters, must include letters and numbers)
                        </label>
                        <input
                            type="password"
                            value={setupData.pin}
                            onChange={(e) => setSetupData({ ...setupData, pin: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., MyPin123"
                        />
                        <div className="mt-2 flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${setupData.pin.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-gray-600 dark:text-gray-400">At least 6 characters</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${/[a-zA-Z]/.test(setupData.pin) ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-gray-600 dark:text-gray-400">Contains letters</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${/\d/.test(setupData.pin) ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-gray-600 dark:text-gray-400">Contains numbers</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">
                            Confirm PIN
                        </label>
                        <input
                            type="password"
                            value={setupData.confirmPin}
                            onChange={(e) => setSetupData({ ...setupData, confirmPin: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Re-enter your PIN"
                        />
                        {setupData.confirmPin && setupData.pin !== setupData.confirmPin && (
                            <p className="text-sm text-red-500 mt-1">PINs don't match</p>
                        )}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={setupData.enableEncryption}
                            onChange={(e) => setSetupData({ ...setupData, enableEncryption: e.target.checked })}
                            className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-sm dark:text-white">
                            Enable encryption (highly recommended)
                        </span>
                    </label>
                </div>
            )
        },
        {
            id: 'session-security',
            title: 'Session Security 🔒',
            description: 'Set up auto-lock to protect your data when away',
            icon: <Shield size={48} className="text-blue-500" />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        For added security, the app can automatically lock after periods of inactivity.
                    </p>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">
                            Auto-lock After
                        </label>
                        <select
                            value={setupData.autoLockMinutes || 15}
                            onChange={(e) => setSetupData({
                                ...setupData,
                                autoLockMinutes: parseInt(e.target.value)
                            })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value={1}>1 minute</option>
                            <option value={5}>5 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Recommended: 15 minutes for balance of security and convenience
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            💡 The app will automatically lock when you're away, requiring your PIN to access your data again.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'budgets',
            title: 'Set Your Budgets 💰',
            description: 'Optional: Set monthly spending limits for different categories',
            icon: <Target size={48} className="text-purple-500" />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        You can skip this step and set budgets later in Settings.
                    </p>

                    {['Food & Dining', 'Transportation', 'Shopping', 'Entertainment'].map((category) => (
                        <div key={category}>
                            <label className="block text-sm font-medium mb-2 dark:text-white">
                                {category}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="10"
                                value={setupData.budgets[category] || ''}
                                onChange={(e) => setSetupData({
                                    ...setupData,
                                    budgets: { ...setupData.budgets, [category]: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Monthly limit (optional)"
                            />
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: 'complete',
            title: 'You\'re All Set! 🎉',
            description: 'Start tracking your expenses and take control of your finances',
            icon: <CheckCircle size={48} className="text-green-500" />,
            content: (
                <div className="text-center space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-3 dark:text-white">Quick Tips:</h3>
                        <ul className="text-left space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>Use the <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">+</kbd> button to add transactions quickly</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>Enable voice input to add expenses hands-free</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>Check the Dashboard for smart insights about your spending</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>Your data is stored locally and works offline</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>Export backups regularly from Settings</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            💡 <strong>Pro Tip:</strong> Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded mx-1">Ctrl</kbd> +
                            <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded mx-1">K</kbd> anytime to quickly add a transaction!
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const currentStep = steps[step];
    const isLastStep = step === steps.length - 1;
    const isSecurityStep = currentStep.id === 'security';

    const canProceed = () => {
        if (isSecurityStep && setupData.enableEncryption) {
            return (
                setupData.pin.length >= 6 &&
                /[a-zA-Z]/.test(setupData.pin) &&
                /\d/.test(setupData.pin) &&
                setupData.pin === setupData.confirmPin
            );
        }
        return true;
    };

    const handleNext = () => {
        if (isLastStep) {
            onComplete(setupData);
        } else {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
                {/* Skip button */}
                {!isLastStep && (
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                        <X size={24} />
                    </button>
                )}

                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {steps.map((s, index) => (
                            <div
                                key={s.id}
                                className={`w-full h-2 rounded-full mx-1 transition-all ${index <= step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Step {step + 1} of {steps.length}
                    </div>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    {currentStep.icon}
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 dark:text-white">
                        {currentStep.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {currentStep.description}
                    </p>
                </div>

                <div className="mb-8">
                    {currentStep.content}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={handleBack}
                            className="flex-1 py-3 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Back
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={`flex-1 py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2 ${canProceed()
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isLastStep ? 'Start Using ExpenseFlow' : 'Continue'}
                        {!isLastStep && <ArrowRight size={20} />}
                    </button>
                </div>

                {/* Help text */}
                {!isLastStep && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={onSkip}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                        >
                            Skip setup (you can configure this later)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};