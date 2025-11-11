// src/components/Toast.jsx - Enhanced with accessibility
import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, X, Info } from 'lucide-react';
import { TOAST_TYPES } from '../utils/constants';

export const Toast = ({ message, type, onClose, autoHideDuration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    const colors = {
        [TOAST_TYPES.SUCCESS]: 'bg-green-500 border-green-600',
        [TOAST_TYPES.ERROR]: 'bg-red-500 border-red-600',
        [TOAST_TYPES.INFO]: 'bg-blue-500 border-blue-600',
        [TOAST_TYPES.WARN]: 'bg-yellow-500 border-yellow-600'
    };

    const icons = {
        [TOAST_TYPES.SUCCESS]: <Check size={20} aria-hidden="true" />,
        [TOAST_TYPES.ERROR]: <AlertCircle size={20} aria-hidden="true" />,
        [TOAST_TYPES.INFO]: <Info size={20} aria-hidden="true" />,
        [TOAST_TYPES.WARN]: <AlertCircle size={20} aria-hidden="true" />
    };

    const role = {
        [TOAST_TYPES.SUCCESS]: 'status',
        [TOAST_TYPES.ERROR]: 'alert',
        [TOAST_TYPES.INFO]: 'status',
        [TOAST_TYPES.WARN]: 'alert'
    };

    useEffect(() => {
        // Animate in
        setIsVisible(true);

        // Auto-hide if duration is provided
        if (autoHideDuration && onClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for animation to complete
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [autoHideDuration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    return (
        <div
            className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 border transition-all duration-300 transform ${isVisible
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-4 opacity-0 scale-95'
                } z-50 max-w-md`}
            role={role[type]}
            aria-live={type === TOAST_TYPES.ERROR || type === TOAST_TYPES.WARN ? 'assertive' : 'polite'}
            aria-atomic="true"
        >
            {icons[type]}
            <span className="flex-1 pr-2">{message}</span>
            {onClose && (
                <button
                    onClick={handleClose}
                    className="ml-2 hover:opacity-80 transition flex-shrink-0 p-1 rounded"
                    aria-label="Dismiss notification"
                >
                    <X size={16} aria-hidden="true" />
                </button>
            )}
        </div>
    );
};