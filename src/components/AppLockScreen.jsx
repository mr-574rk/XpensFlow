/* eslint-disable no-unused-vars */
// src/components/AppLockScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Fingerprint, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '../context/useApp';

export const AppLockScreen = ({ onUnlockSuccess }) => {
    const { unlockEncryption, showToast, securityManager,
        setView,
        encryptionEnabled } = useApp();
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState(0);
    const [unlockSuccess, setUnlockSuccess] = useState(false);
    const [securityState, setSecurityState] = useState(null);
    const inputRef = useRef(null);

    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 300000; // 5 minutes in milliseconds

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }

        // Check security state
        if (securityManager) {
            const state = securityManager.getState();
            setSecurityState(state);
            console.log('Security state:', state);
        }
    }, [securityManager]);

    useEffect(() => {
        // Check if we're in lockout period
        if (lockoutTime > 0) {
            const timer = setInterval(() => {
                const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
                if (remaining <= 0) {
                    setLockoutTime(0);
                    setFailedAttempts(0);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [lockoutTime]);

    const handleUnlock = async (e) => {
        e.preventDefault();

        if (lockoutTime > 0) {
            const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
            showToast(`Too many failed attempts. Try again in ${remaining} seconds.`, 'error');
            return;
        }

        if (pin.length < 6) {
            showToast('PIN must be at least 6 characters', 'error');
            return;
        }

        setIsUnlocking(true);

        try {
            console.log('Attempting unlock with PIN...');
            const result = await unlockEncryption(pin);
            console.log('Unlock result:', result);

            if (result && result.success) {
                setUnlockSuccess(true);
                showToast('Welcome back! App unlocked successfully.', 'success');
                if (onUnlockSuccess) {
                    onUnlockSuccess();
                }
                setTimeout(() => {
                    setPin('');
                    setFailedAttempts(0);
                }, 1000);

            } else {
                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);

                const errorMessage = result?.error || 'Wrong PIN';
                let userMessage = errorMessage;

                if (newAttempts >= MAX_ATTEMPTS) {
                    const lockoutUntil = Date.now() + LOCKOUT_DURATION;
                    setLockoutTime(lockoutUntil);
                    userMessage = `Too many failed attempts. Locked for 5 minutes.`;
                } else {
                    userMessage = `${errorMessage}. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`;
                }

                showToast(userMessage, 'error');
                setPin('');

                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }
        } catch (error) {
            console.error('Unlock error:', error);
            showToast('Unlock failed. Please try again.', 'error');
            setPin('');
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleBiometricUnlock = async () => {
        if (!('credentials' in navigator)) {
            showToast('Biometric authentication not supported', 'error');
            return;
        }

        try {
            // WebAuthn API for biometric authentication
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: new Uint8Array(32),
                    allowCredentials: [],
                    timeout: 60000,
                    userVerification: 'required'
                }
            });

            if (credential) {
                // For demo purposes, we'll simulate successful biometric auth
                showToast('Biometric authentication successful!', 'success');
                // In a real implementation, you'd validate the credential
            }
        } catch (error) {
            showToast('Biometric authentication failed', 'error');
        }
    };

    const isLockedOut = lockoutTime > 0;
    const remainingTime = isLockedOut ? Math.ceil((lockoutTime - Date.now()) / 1000) : 0;
    // If no encryption is configured, show different message
    if (securityState && !securityState.hasSalt && encryptionEnabled) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <Shield size={64} className="text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Encryption Configuration Error
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Encryption is enabled but not properly configured.
                            This can happen if the app data was cleared or corrupted.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition"
                        >
                            Reload App
                        </button>
                        <button
                            onClick={() => setView('settings')}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                        >
                            <Settings size={20} />
                            Go to Settings
                        </button>
                    </div>

                    <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                        <p>If this persists, you may need to reset your encryption settings.</p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* App Icon & Title */}
                <div className="mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl shadow-lg mb-4">
                        💸
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        ExpenseFlow
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your data is locked for security
                    </p>
                </div>

                {/* Security Status */}
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <Shield size={20} />
                        <span className="font-medium">App Locked</span>
                    </div>
                    <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
                        {isLockedOut
                            ? `Too many failed attempts. Try again in ${remainingTime} seconds.`
                            : 'Enter your PIN to unlock your data'
                        }
                    </p>
                </div>

                {/* PIN Input Form */}
                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type={showPin ? "text" : "password"}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            disabled={isLockedOut || isUnlocking}
                            className="w-full p-4 text-center text-2xl font-mono border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                            placeholder="Enter PIN"
                            maxLength={20}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            disabled={isLockedOut || isUnlocking}
                        >
                            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Attempts Counter */}
                    {failedAttempts > 0 && !isLockedOut && (
                        <div className="text-sm text-red-500 dark:text-red-400">
                            {failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''}
                        </div>
                    )}

                    {/* Unlock Button */}
                    <button
                        type="submit"
                        disabled={isLockedOut || isUnlocking || pin.length < 6}
                        className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUnlocking ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Unlocking...
                            </>
                        ) : (
                            <>
                                <Lock size={20} />
                                Unlock App
                            </>
                        )}
                    </button>
                </form>

                {/* Biometric Option */}
                {!isLockedOut && (
                    <div className="mt-6">
                        <button
                            onClick={handleBiometricUnlock}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                        >
                            <Fingerprint size={20} />
                            Use Biometric
                        </button>
                    </div>
                )}

                {/* Security Tips */}
                <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>🔒 Your data is encrypted with AES-256</p>
                    <p>📱 Auto-locks after 15 minutes of inactivity</p>
                    <p>💾 Stored securely on your device only</p>
                </div>
            </div>
        </div>
    );
};