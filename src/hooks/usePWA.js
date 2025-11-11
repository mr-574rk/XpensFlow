// src/hooks/usePWA.js
import { useState, useEffect } from 'react';

export const usePWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Update UI to notify the user they can install the PWA
            setShowInstallPrompt(true);

            console.log('PWA install prompt available');
        };

        const handleAppInstalled = () => {
            console.log('PWA was installed');
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return false;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setDeferredPrompt(null);
            setShowInstallPrompt(false);
            return true;
        } else {
            console.log('User dismissed the install prompt');
            return false;
        }
    };

    const dismissInstallPrompt = () => {
        setShowInstallPrompt(false);
        // Don't show again for a while
        setTimeout(() => setShowInstallPrompt(true), 1000 * 60 * 60 * 24); // 24 hours
    };

    return {
        showInstallPrompt,
        installPWA,
        dismissInstallPrompt,
        canInstall: !!deferredPrompt
    };
};