import { useState, useEffect, useCallback } from 'react';

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncQueue, setSyncQueue] = useState([]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // You can add sync logic here when coming back online
            console.log('Back online - would sync queued actions');
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('Offline - queuing actions for later sync');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const addToSyncQueue = useCallback((action) => {
        setSyncQueue(prev => [...prev, action]);
        console.log('Action added to sync queue:', action);
    }, []);

    const clearSyncQueue = useCallback(() => {
        setSyncQueue([]);
    }, []);

    return {
        isOnline,
        syncQueue,
        addToSyncQueue,
        clearSyncQueue
    };
};