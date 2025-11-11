// src/components/InstallPrompt.jsx
import React, { useState } from 'react';
import { Download, X, TrendingUp, Shield, Zap } from 'lucide-react';

export const InstallPrompt = ({ show, onInstall, onDismiss }) => {
    const [isClosing, setIsClosing] = useState(false);

    if (!show) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onDismiss();
            setIsClosing(false);
        }, 300);
    };

    const handleInstall = async () => {
        const success = await onInstall();
        if (success) {
            handleClose();
        }
    };

    return (
        <div className={`fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-2xl p-4 z-50 transform transition-all duration-300 ${isClosing ? 'translate-y-32 opacity-0' : 'translate-y-0 opacity-100'
            }`}>
            <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-white hover:text-blue-100 transition"
            >
                <X size={20} />
            </button>

            <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Download size={24} />
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Install XpensFlow</h3>
                    <p className="text-blue-100 text-sm mb-3">
                        Track smarter! Add to home screen for faster access and offline use.
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                            <TrendingUp size={16} className="mx-auto mb-1" />
                            <span className="text-xs">Smart Insights</span>
                        </div>
                        <div className="text-center">
                            <Shield size={16} className="mx-auto mb-1" />
                            <span className="text-xs">Secure & Private</span>
                        </div>
                        <div className="text-center">
                            <Zap size={16} className="mx-auto mb-1" />
                            <span className="text-xs">Offline Access</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-white text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            Add to Home Screen
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-blue-100 hover:text-white transition"
                        >
                            Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};