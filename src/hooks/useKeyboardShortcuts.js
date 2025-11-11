// src/hooks/useKeyboardShortcuts.js - Fixed version
import { useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

/**
 * Keyboard shortcuts configuration
 */
export const shortcuts = {
    // Global shortcuts
    ADD_TRANSACTION: { key: 'k', ctrl: true, description: 'Add new transaction' },
    SEARCH: { key: '/', description: 'Focus search' },
    TOGGLE_THEME: { key: 'd', ctrl: true, description: 'Toggle dark mode' },

    // Navigation shortcuts
    GOTO_DASHBOARD: { key: '1', ctrl: true, description: 'Go to Dashboard' },
    GOTO_TRANSACTIONS: { key: '2', ctrl: true, description: 'Go to Transactions' },
    GOTO_SETTINGS: { key: '3', ctrl: true, description: 'Go to Settings' },

    // Debug shortcuts
    OPEN_DEBUG: { key: 'd', ctrl: true, shift: true, description: 'Open debug console' },
    TOGGLE_HELP: { key: '?', shift: true, description: 'Show keyboard shortcuts' },

    // Data shortcuts
    EXPORT_DATA: { key: 'e', ctrl: true, description: 'Export data' },
    CREATE_BACKUP: { key: 'b', ctrl: true, description: 'Create backup' },

    // Security shortcuts
    LOCK_APP: { key: 'l', ctrl: true, shift: true, description: 'Lock app' },

    // Quick actions
    REFRESH: { key: 'r', ctrl: true, description: 'Refresh data' }
};

// Create a shortcut lookup map for O(1) access
const shortcutMap = new Map();
Object.entries(shortcuts).forEach(([action, shortcut]) => {
    const key = `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.meta ? 'meta+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.key.toLowerCase()}`;
    shortcutMap.set(key, { action, shortcut });
});

/**
 * Hook to register keyboard shortcuts with optimized performance
 */
export const useKeyboardShortcuts = (handlers = {}) => {
    const handlersRef = useRef(handlers);

    // Keep handlers ref updated without re-creating the effect
    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    const handleKeyPress = useCallback((event) => {
        const { key, ctrlKey, metaKey, shiftKey, altKey, target } = event;

        // Ignore if user is typing in an input (with escape hatch for search)
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            // Only allow '/' for search when in input fields
            if (key !== '/') {
                return;
            }
        }

        // Build the shortcut key for lookup
        const shortcutKey = `${ctrlKey ? 'ctrl+' : ''}${metaKey ? 'meta+' : ''}${shiftKey ? 'shift+' : ''}${altKey ? 'alt+' : ''}${key.toLowerCase()}`;

        // Find matching shortcut
        const match = shortcutMap.get(shortcutKey);

        if (match && handlersRef.current[match.action]) {
            event.preventDefault();
            event.stopPropagation();

            logger.info(`Keyboard shortcut triggered: ${match.action}`);
            handlersRef.current[match.action](event);
        }
    }, []); // Empty dependencies since we use ref

    useEffect(() => {
        // Use capture phase to ensure we catch events before other handlers
        window.addEventListener('keydown', handleKeyPress, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyPress, { capture: true });
    }, [handleKeyPress]);

    return shortcuts;
};

/**
 * Hook to display keyboard shortcuts help
 */
export const useShortcutsHelp = () => {
    const getShortcutDisplay = useCallback((shortcut) => {
        const parts = [];

        if (shortcut.ctrl) parts.push('Ctrl');
        if (shortcut.meta) parts.push('⌘');
        if (shortcut.shift) parts.push('Shift');
        if (shortcut.alt) parts.push('Alt');
        parts.push(shortcut.key.toUpperCase());

        return parts.join(' + ');
    }, []);

    const groupedShortcuts = Object.entries(shortcuts).reduce((acc, [action, shortcut]) => {
        const category = action.startsWith('GOTO_') ? 'Navigation' :
            action.includes('DEBUG') || action.includes('HELP') ? 'Debug' :
                action.includes('EXPORT') || action.includes('BACKUP') ? 'Data' :
                    action.includes('LOCK') ? 'Security' :
                        'General';

        if (!acc[category]) acc[category] = [];
        acc[category].push({
            action,
            shortcut,
            display: getShortcutDisplay(shortcut),
            description: shortcut.description
        });

        return acc;
    }, {});

    return { shortcuts: groupedShortcuts, getShortcutDisplay };
};