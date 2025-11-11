/* eslint-disable no-unused-vars */
import React, { useReducer, useEffect, useState } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useToast } from '../hooks/useToast';
import { useCrypto } from '../hooks/useCrypto';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { logger } from '../utils/logger';
import { securityManager } from '../core/SecurityManager';
import { databaseManager } from '../core/DatabaseManager';
import { intelligenceEngine } from '../core/IntelligenceEngine';
import { AppContext } from './AppContext';

// Reducer
const appReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TRANSACTIONS':
            return { ...state, transactions: action.payload };
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [...state.transactions, action.payload] };
        case 'DELETE_TRANSACTION':
            return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
        case 'SET_BUDGETS':
            return { ...state, budgets: action.payload };
        case 'SET_BUDGET':
            return { ...state, budgets: { ...state.budgets, [action.payload.category]: action.payload.amount } };
        case 'SET_VIEW':
            return { ...state, currentView: action.payload };
        case 'TOGGLE_THEME':
            return { ...state, darkMode: !state.darkMode };
        case 'SET_ENCRYPTION':
            return { ...state, encryptionEnabled: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_CURRENCY':
            return { ...state, currency: action.payload };
        case 'SET_CATEGORIES':
            return { ...state, categories: action.payload };
        case 'SET_DB_INITIALIZED':
            return { ...state, dbInitialized: action.payload };
        default:
            return state;
    }
};

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, {
        transactions: [],
        budgets: {},
        currentView: 'dashboard',
        darkMode: localStorage.getItem('darkMode') === 'true',
        encryptionEnabled: false,
        loading: true,
        currency: 'USD',
        categories: [],
        dbInitialized: false
    });

    const { toast, showToast, success, error: errorToast, info, warn } = useToast();
    const {
        encryptionKey,
        isEncrypted,
        setupEncryption: cryptoSetup,
        unlockEncryption: cryptoUnlock,
        encrypt,
        decrypt
    } = useCrypto();
    const { isOnline, addToSyncQueue } = useOfflineSync();

    // Initialize core systems
    useEffect(() => {
        const init = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });

                // Initialize database first
                const dbResult = await databaseManager.initialize();

                if (!dbResult.success) {
                    logger.error('Database initialization failed:', dbResult.error);
                    dispatch({ type: 'SET_DB_INITIALIZED', payload: false });
                    dispatch({ type: 'SET_LOADING', payload: false });
                    return;
                }

                dispatch({ type: 'SET_DB_INITIALIZED', payload: true });

                if (dbResult.recovered) {
                    logger.info('Database recovered from version conflict');
                }

                // Load initial data only after DB is ready
                await loadInitialData();

                // Load security config if exists
                const securityConfig = await databaseManager.loadSecurityConfig();
                if (securityConfig) {
                    securityManager.importConfig(securityConfig);
                }

            } catch (error) {
                logger.error('Core systems initialization failed', error);
                dispatch({ type: 'SET_DB_INITIALIZED', payload: false });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        init();
    }, []);

    // Load initial data with proper error handling
    const loadInitialData = async () => {
        try {
            const [transactions, budgets, settings] = await Promise.all([
                databaseManager.getTransactionsWithDecryption ?
                    databaseManager.getTransactionsWithDecryption() :
                    databaseManager.getAll('transactions').catch(() => []),
                databaseManager.getAll('budgets').catch(() => []),
                databaseManager.getAll('settings').catch(() => [])
            ]);

            dispatch({ type: 'SET_TRANSACTIONS', payload: transactions || [] });
            dispatch({ type: 'SET_BUDGETS', payload: budgets || [] });

            // Load settings
            if (settings && settings.length > 0) {
                settings.forEach(setting => {
                    if (setting.key === 'currency') {
                        dispatch({ type: 'SET_CURRENCY', payload: setting.value });
                    }
                    if (setting.key === 'categories') {
                        dispatch({ type: 'SET_CATEGORIES', payload: setting.value });
                    }
                    if (setting.key === 'encryption_enabled') {
                        dispatch({ type: 'SET_ENCRYPTION', payload: setting.value });
                    }
                });
            }

            logger.info(`Loaded ${transactions?.length || 0} transactions, ${budgets?.length || 0} budgets`);
        } catch (error) {
            logger.error('Failed to load initial data', error);
        }
    };

    // Handle dark mode
    useEffect(() => {
        localStorage.setItem('darkMode', state.darkMode);
        document.documentElement.classList.toggle('dark', state.darkMode);
    }, [state.darkMode]);

    // Handle encryption status
    useEffect(() => {
        dispatch({ type: 'SET_ENCRYPTION', payload: isEncrypted });
    }, [isEncrypted]);

    // Handle database operations with initialization check
    const ensureDbInitialized = () => {
        if (!state.dbInitialized) {
            throw new Error('Database not initialized. Please wait or refresh the page.');
        }
    };

    const loadSettings = async () => {
        try {
            const settings = await databaseManager.getAll('settings');
            const encSetting = settings.find(s => s.key === 'encryption_enabled');
            if (encSetting) {
                dispatch({ type: 'SET_ENCRYPTION', payload: encSetting.value });
            }
        } catch (error) {
            logger.error('Failed to load settings', error);
        }
    };

    const loadTransactions = async () => {
        try {
            let transactions = await databaseManager.getAll('transactions');

            // Decrypt if needed using SecurityManager
            if (state.encryptionEnabled && securityManager && securityManager.isInitialized()) {
                transactions = await Promise.all(
                    transactions.map(async (t) => {
                        if (t.encrypted && t.data && t.iv) {
                            try {
                                const decrypted = await securityManager.decryptData(t.data, t.iv);
                                return { ...decrypted, id: t.id };
                            } catch (error) {
                                logger.error('Failed to decrypt transaction', error, t.id);
                                return { ...t, decryptionError: true };
                            }
                        }
                        return t;
                    })
                );

                // Filter out transactions that failed decryption
                transactions = transactions.filter(tx => !tx.decryptionError);
            }

            dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
            return { success: true };
        } catch (error) {
            logger.error('Failed to load transactions', error);
            errorToast('Failed to load transactions');
            return { success: false, error: error.message };
        }
    };

    const loadBudgets = async () => {
        try {
            ensureDbInitialized();
            const budgets = await databaseManager.getAll('budgets');
            const budgetObj = {};
            budgets.forEach(b => {
                budgetObj[b.category] = b.amount;
            });
            dispatch({ type: 'SET_BUDGETS', payload: budgetObj });
            return { success: true };
        } catch (error) {
            logger.error('Failed to load budgets', error);
            return { success: false, error: error.message };
        }
    };

    const addTransaction = async (transaction) => {
        try {
            ensureDbInitialized();

            let dataToStore = {
                ...transaction,
                id: transaction.id || Date.now(),
                timestamp: transaction.timestamp || new Date().toISOString()
            };

            // Encrypt if enabled and security manager is available
            if (state.encryptionEnabled && securityManager && securityManager.isInitialized()) {
                const result = await securityManager.encrypt(dataToStore);
                if (result.success) {
                    dataToStore = {
                        encrypted: true,
                        data: result.encrypted.data,
                        timestamp: dataToStore.timestamp,
                        iv: result.encrypted.iv
                    };
                } else {
                    errorToast('Encryption failed');
                    return { success: false, error: 'Encryption failed' };
                }
            }

            const id = await databaseManager.add('transactions', dataToStore);
            const newTransaction = { ...transaction, id };

            dispatch({
                type: 'ADD_TRANSACTION',
                payload: newTransaction
            });

            success('Transaction added successfully');
            return { success: true, id };
        } catch (error) {
            logger.error('Failed to add transaction', error);
            errorToast('Failed to add transaction');
            return { success: false, error: error.message };
        }
    };

    const deleteTransaction = async (id) => {
        try {
            ensureDbInitialized();
            await databaseManager.delete('transactions', id);
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
            success('Transaction deleted');
            return { success: true };
        } catch (error) {
            logger.error('Failed to delete transaction', error);
            errorToast('Failed to delete transaction');
            return { success: false, error: error.message };
        }
    };

    const setBudget = async (category, amount) => {
        try {
            ensureDbInitialized();
            await databaseManager.put('budgets', { category, amount });
            dispatch({ type: 'SET_BUDGET', payload: { category, amount } });
            success('Budget updated');
            return { success: true };
        } catch (error) {
            logger.error('Failed to set budget', error);
            errorToast('Failed to set budget');
            return { success: false, error: error.message };
        }
    };

    // Save onboarding data to database
    const saveOnboardingData = async (setupData) => {
        try {
            ensureDbInitialized();

            // Setup encryption if enabled
            if (setupData.enableEncryption && setupData.pin) {
                const result = await securityManager.deriveKey(setupData.pin);
                if (!result.success) {
                    throw new Error('Failed to setup encryption: ' + result.error);
                }
                await databaseManager.put('settings', {
                    key: 'encryption_enabled',
                    value: true
                });
                await databaseManager.saveSecurityConfig();
                dispatch({ type: 'SET_ENCRYPTION', payload: true });
            }

            // Set auto-lock duration if provided
            if (setupData.autoLockMinutes && securityManager) {
                securityManager.setAutoLockDuration(setupData.autoLockMinutes);
            }

            // Save budgets
            if (setupData.budgets) {
                for (const [category, amount] of Object.entries(setupData.budgets)) {
                    if (amount > 0) {
                        await databaseManager.put('budgets', { category, amount });
                    }
                }
                // Reload budgets
                const budgets = await databaseManager.getAll('budgets');
                const budgetObj = {};
                budgets.forEach(b => {
                    budgetObj[b.category] = b.amount;
                });
                dispatch({ type: 'SET_BUDGETS', payload: budgetObj });
            }

            // Save currency
            if (setupData.currency) {
                await databaseManager.put('settings', {
                    key: 'currency',
                    value: setupData.currency
                });
                dispatch({ type: 'SET_CURRENCY', payload: setupData.currency });
            }

            // Mark onboarding as completed
            await databaseManager.put('settings', {
                key: 'onboarding_completed',
                value: true,
                timestamp: new Date().toISOString()
            });

            logger.info('Onboarding data saved successfully');
            return { success: true };
        } catch (error) {
            logger.error('Failed to save onboarding data', error);
            return { success: false, error: error.message };
        }
    };
    const setupEncryption = async (pin) => {
        try {
            ensureDbInitialized();
            console.log('Setting up encryption with PIN...');

            const result = await securityManager.deriveKey(pin);
            console.log('Encryption setup result:', result);

            if (result.success) {
                // Save encryption enabled flag
                await databaseManager.put('settings', {
                    key: 'encryption_enabled',
                    value: true
                });

                // Save security config including salt
                await databaseManager.saveSecurityConfig();

                // Update state
                dispatch({ type: 'SET_ENCRYPTION', payload: true });

                console.log('Encryption setup completed successfully');
                success('Encryption enabled successfully');

                // Reload transactions to encrypt existing data
                await loadTransactions();
                return { success: true };
            } else {
                console.error('Encryption setup failed:', result.error);
                errorToast('Failed to setup encryption: ' + result.error);
                return result;
            }
        } catch (error) {
            console.error('Encryption setup failed with error:', error);
            errorToast('Encryption setup failed');
            return { success: false, error: error.message };
        }
    };
    const unlockEncryption = async (passphrase) => {
        try {
            console.log('AppProvider: Attempting unlock...');
            console.log('Security manager state before unlock:', securityManager.getState());

            const result = await securityManager.unlock(passphrase);
            console.log('AppProvider: Unlock result:', result);
            console.log('Security manager state after unlock:', securityManager.getState());

            if (result.success) {
                // Update encryption state
                dispatch({ type: 'SET_ENCRYPTION', payload: true });

                // Force reload transactions to ensure they're decrypted
                await loadTransactions();

                console.log('AppProvider: Unlock successful, encryption state updated');
                success('App unlocked successfully!');
                return { success: true };
            } else {
                console.log('AppProvider: Unlock failed:', result.error);

                // Better error messages based on the specific error
                let userMessage = 'Unlock failed';
                if (result.error.includes('No encryption configured')) {
                    userMessage = 'Encryption not set up. Please enable encryption first.';
                } else if (result.error.includes('Wrong passphrase')) {
                    userMessage = 'Wrong PIN. Please try again.';
                } else {
                    userMessage = result.error;
                }

                errorToast(userMessage);
                return { success: false, error: userMessage };
            }
        } catch (error) {
            console.error('AppProvider: Unlock failed with error:', error);
            errorToast('Unlock failed');
            return { success: false, error: error.message };
        }
    };
    const exportData = async () => {
        try {
            ensureDbInitialized();

            const data = {
                transactions: state.transactions,
                budgets: state.budgets,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            let exportContent = JSON.stringify(data, null, 2);
            let filename = `expenseflow-export-${new Date().toISOString().split('T')[0]}.json`;

            // Offer encrypted export
            if (state.encryptionEnabled && securityManager && securityManager.isInitialized()) {
                const result = await securityManager.encrypt(data);
                if (result.success) {
                    exportContent = JSON.stringify(result.encrypted, null, 2);
                    filename = `expenseflow-encrypted-${new Date().toISOString().split('T')[0]}.json`;
                }
            }

            const blob = new Blob([exportContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            success('Data exported successfully');
            return { success: true };
        } catch (error) {
            logger.error('Export failed', error);
            errorToast('Failed to export data');
            return { success: false, error: error.message };
        }
    };

    const importData = async (file) => {
        try {
            ensureDbInitialized();

            const content = await file.text();
            const parsedData = JSON.parse(content);

            let data = parsedData;

            // Check if encrypted
            if (parsedData.iv && parsedData.data) {
                if (!securityManager.isInitialized()) {
                    errorToast('Please unlock encryption first');
                    return { success: false, error: 'Encryption locked' };
                }
                const result = await securityManager.decrypt(parsedData);
                if (result.success) {
                    data = result.data;
                } else {
                    errorToast('Failed to decrypt import file');
                    return { success: false, error: 'Decryption failed' };
                }
            }

            // Import transactions
            if (data.transactions) {
                for (const t of data.transactions) {
                    const { id, ...transaction } = t;
                    await databaseManager.add('transactions', transaction);
                }
            }

            // Import budgets
            if (data.budgets) {
                for (const [category, amount] of Object.entries(data.budgets)) {
                    await databaseManager.put('budgets', { category, amount });
                }
            }

            // Reload data
            await loadTransactions();
            await loadBudgets();

            success('Data imported successfully');
            return { success: true };
        } catch (error) {
            logger.error('Import failed', error);
            errorToast('Failed to import data');
            return { success: false, error: error.message };
        }
    };

    const calculateFinancialScore = () => {
        const thisMonth = new Date().toISOString().slice(0, 7);
        const monthTransactions = state.transactions.filter(t => t.date && t.date.startsWith(thisMonth));

        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
        const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);

        if (income === 0) return 0;

        const savingsRate = ((income - expenses) / income) * 100;
        let score = 0;

        // Savings rate (40 points)
        if (savingsRate >= 20) score += 40;
        else if (savingsRate >= 10) score += 30;
        else if (savingsRate >= 5) score += 20;
        else if (savingsRate >= 0) score += 10;

        // Budget discipline (30 points)
        const budgetCategories = Object.keys(state.budgets).filter(cat => state.budgets[cat] > 0);
        if (budgetCategories.length > 0) {
            const budgetDiscipline = budgetCategories.filter(category => {
                const spent = monthTransactions
                    .filter(t => t.category === category && t.type === 'expense')
                    .reduce((sum, t) => sum + (t.amount || 0), 0);
                return spent <= state.budgets[category];
            }).length;
            score += (budgetDiscipline / budgetCategories.length) * 30;
        }

        // Transaction tracking (30 points)
        if (monthTransactions.length >= 20) score += 30;
        else if (monthTransactions.length >= 10) score += 20;
        else if (monthTransactions.length >= 5) score += 10;

        return Math.min(Math.round(score), 100);
    };
    const refreshSecurityState = () => {
        if (securityManager) {
            const state = securityManager.getState();
            dispatch({ type: 'SET_ENCRYPTION', payload: !state.isLocked && state.isInitialized });
        }
    };
    const value = {
        ...state,
        dispatch,
        isOnline,
        toast,
        showToast,
        success,
        error: errorToast,
        info,
        warn,
        addTransaction,
        deleteTransaction,
        setBudget,
        refreshSecurityState,
        exportData,
        importData,
        setupEncryption,
        unlockEncryption,
        calculateFinancialScore,
        toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
        setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
        saveOnboardingData,
        securityManager,
        databaseManager,

        // Add session security methods
        lockApp: () => {
            if (securityManager) {
                securityManager.lock();
                dispatch({ type: 'SET_ENCRYPTION', payload: false });
            }
        },
        setAutoLockDuration: (minutes) => {
            if (securityManager) {
                securityManager.setAutoLockDuration(minutes);
            }
        },
        getSecurityStatus: () => {
            return securityManager ? securityManager.getStatus() : null;
        }
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};