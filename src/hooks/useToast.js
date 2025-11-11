import { useState, useCallback } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const success = useCallback((message) => showToast(message, 'success'), [showToast]);
    const error = useCallback((message) => showToast(message, 'error'), [showToast]);
    const info = useCallback((message) => showToast(message, 'info'), [showToast]);
    const warn = useCallback((message) => showToast(message, 'warning'), [showToast]);

    return {
        toast,
        showToast,
        success,
        error,
        info,
        warn
    };
};