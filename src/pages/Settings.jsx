/* eslint-disable no-unused-vars */
// src/pages/Settings.jsx - UPDATED

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Download, Upload, Moon, Sun, Trash2, Database, Shield } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import { formatters } from '../utils/formatters';
import { useApp } from '../context/useApp';
import { DebugOverlay } from '../components/DebugOverlay';

export const Settings = () => {
    const {
        budgets,
        setBudget,
        exportData,
        importData,
        darkMode,
        toggleTheme,
        encryptionEnabled,
        setupEncryption,
        unlockEncryption,
        showToast,
        databaseManager,
        securityManager,
        lockApp,
        setAutoLockDuration,
        getSecurityStatus
    } = useApp();

    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].name);
    const [budgetAmount, setBudgetAmount] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [showEncryptionSetup, setShowEncryptionSetup] = useState(false);
    const [showDebugOverlay, setShowDebugOverlay] = useState(false);
    const [dbStats, setDbStats] = useState(null);
    const [backups, setBackups] = useState([]);
    const [autoLockMinutes, setAutoLockMinutes] = useState(15);
    const [securityStatus, setSecurityStatus] = useState(null);

    const fileInputRef = useRef(null);

    // Load database stats
    useEffect(() => {
        loadDatabaseStats();
        loadBackups();
        loadSecuritySettings();
    }, []);

    const loadDatabaseStats = async () => {
        try {
            if (databaseManager && databaseManager.isInitialized) {
                const stats = await databaseManager.getStats();
                setDbStats(stats);
            }
        } catch (error) {
            console.error('Failed to load DB stats:', error);
        }
    };

    const loadBackups = async () => {
        try {
            if (databaseManager && databaseManager.isInitialized) {
                const backupList = await databaseManager.getBackups();
                setBackups(backupList || []);
            }
        } catch (error) {
            console.error('Failed to load backups:', error);
        }
    };
    const loadSecuritySettings = () => {
        if (securityManager) {
            const status = securityManager.getStatus();
            setSecurityStatus(status);
            setAutoLockMinutes(status.autoLockMinutes || 15);
        }
    };
    const handleSetBudget = (e) => {
        e.preventDefault();
        if (budgetAmount && parseFloat(budgetAmount) > 0) {
            setBudget(selectedCategory, parseFloat(budgetAmount));
            setBudgetAmount('');
        }
    };

    const handleEncryptionSetup = async (e) => {
        e.preventDefault();
        if (passphrase.length < 6) {
            showToast('Passphrase must be at least 6 characters', 'error');
            return;
        }

        // Check PIN validity
        const hasNumber = /\d/.test(passphrase);
        const hasLetter = /[a-zA-Z]/.test(passphrase);

        if (!hasNumber || !hasLetter) {
            showToast('PIN must contain both letters and numbers', 'error');
            return;
        }

        const result = await setupEncryption(passphrase);
        if (result && result.success) {
            setShowEncryptionSetup(false);
            setPassphrase('');
        }
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        await unlockEncryption(passphrase);
        setPassphrase('');
        loadSecuritySettings(); // Refresh security status
    };

    const handleFileImport = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            importData(file);
        }
    };

    const handleClearBudget = (category) => {
        if (confirm(`Clear budget for ${category}?`)) {
            setBudget(category, 0);
        }
    };

    const handleCreateBackup = async () => {
        try {
            if (databaseManager && databaseManager.isInitialized) {
                const result = await databaseManager.createBackup('Manual backup');
                if (result.success) {
                    showToast('Backup created successfully', 'success');
                    await loadBackups();
                    await loadDatabaseStats();
                } else {
                    showToast('Failed to create backup: ' + result.error, 'error');
                }
            }
        } catch (error) {
            showToast('Failed to create backup', 'error');
            console.error('Backup error:', error);
        }
    };

    const handleRestoreBackup = async (backupId) => {
        if (!confirm('This will replace all current data with the backup. Continue?')) {
            return;
        }

        try {
            if (databaseManager && databaseManager.isInitialized) {
                const result = await databaseManager.restoreBackup(backupId);
                if (result.success) {
                    showToast('Backup restored successfully. Reloading...', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast('Failed to restore backup: ' + result.error, 'error');
                }
            }
        } catch (error) {
            showToast('Failed to restore backup', 'error');
            console.error('Restore error:', error);
        }
    };
    const handleAutoLockChange = (minutes) => {
        setAutoLockMinutes(minutes);
        setAutoLockDuration(minutes);
        showToast(`Auto-lock set to ${minutes} minutes`, 'success');
        loadSecuritySettings(); // Refresh status
    };

    const handleLockNow = () => {
        lockApp();
        showToast('App locked successfully', 'success');
        loadSecuritySettings(); // Refresh status
    };
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your preferences and data
                </p>
            </div>
            {encryptionEnabled && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                        <Shield size={20} />
                        Session Security
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                Auto-lock After Inactivity
                            </label>
                            <select
                                value={autoLockMinutes}
                                onChange={(e) => handleAutoLockChange(parseInt(e.target.value))}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value={1}>1 minute</option>
                                <option value={5}>5 minutes</option>
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={0}>Never (not recommended)</option>
                            </select>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Automatically lock the app after period of inactivity
                            </p>
                        </div>

                        <button
                            onClick={handleLockNow}
                            className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                        >
                            <Lock size={20} />
                            Lock App Now
                        </button>

                        {/* Security Status */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="font-medium mb-2 dark:text-white">Security Status</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">App Lock:</span>
                                    <span className={`ml-2 font-medium ${securityStatus?.isLocked ? 'text-red-500' : 'text-green-500'}`}>
                                        {securityStatus?.isLocked ? 'Locked' : 'Unlocked'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Auto-lock:</span>
                                    <span className="ml-2 font-medium dark:text-white">
                                        {autoLockMinutes === 0 ? 'Disabled' : `${autoLockMinutes} min`}
                                    </span>
                                </div>
                                {securityStatus && !securityStatus.isLocked && (
                                    <div className="col-span-2">
                                        <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
                                        <span className="ml-2 font-medium dark:text-white">
                                            {new Date(securityStatus.lastActivity).toLocaleTimeString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Budget Management</h3>
                <form onSubmit={handleSetBudget} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.name} value={cat.name}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Monthly Limit
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
                    >
                        Set Budget
                    </button>
                </form>

                {Object.keys(budgets).length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-medium mb-3 dark:text-white">Current Budgets</h4>
                        <div className="space-y-2">
                            {Object.entries(budgets)
                                .filter(([_, amount]) => amount > 0)
                                .map(([category, amount]) => {
                                    const cat = CATEGORIES.find(c => c.name === category);
                                    return (
                                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{cat?.icon}</span>
                                                <span className="dark:text-white">{category}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium dark:text-white">
                                                    {formatters.currency(amount)}
                                                </span>
                                                <button
                                                    onClick={() => handleClearBudget(category)}
                                                    className="text-red-500 hover:text-red-600 transition"
                                                    title="Clear budget"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>

            {/* Security & Encryption */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                    {encryptionEnabled ? (
                        <Lock size={20} className="text-green-500" />
                    ) : (
                        <Unlock size={20} className="text-gray-400" />
                    )}
                    Data Encryption
                </h3>

                {!encryptionEnabled ? (
                    showEncryptionSetup ? (
                        <form onSubmit={handleEncryptionSetup} className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Set a PIN to encrypt all your data. You'll need this PIN to access your data.
                            </p>
                            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded p-3">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    ⚠️ PIN must be 6+ characters with both letters and numbers
                                </p>
                            </div>
                            <input
                                type="password"
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter PIN (min 6 characters)"
                                minLength={6}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition"
                                >
                                    Enable Encryption
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEncryptionSetup(false);
                                        setPassphrase('');
                                    }}
                                    className="px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 rounded-lg font-medium hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowEncryptionSetup(true)}
                            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                        >
                            <Lock size={20} />
                            Enable Encryption
                        </button>
                    )
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
                            <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                                <Shield size={16} />
                                ✓ Your data is encrypted and secure
                            </p>
                        </div>
                        <form onSubmit={handleUnlock} className="space-y-2">
                            <input
                                type="password"
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter PIN to unlock"
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
                            >
                                Unlock Data
                            </button>
                        </form>
                    </div>
                )}
            </div>
            {/* Database Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                    <Database size={20} />
                    Database Management
                </h3>

                {dbStats && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium mb-2 dark:text-white">Statistics</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
                                <span className="ml-2 font-medium dark:text-white">{dbStats.transactions}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Budgets:</span>
                                <span className="ml-2 font-medium dark:text-white">{dbStats.budgets}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Backups:</span>
                                <span className="ml-2 font-medium dark:text-white">{dbStats.backups}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Encrypted:</span>
                                <span className={`ml-2 font-medium ${dbStats.encrypted ? 'text-green-500' : 'text-gray-500'}`}>
                                    {dbStats.encrypted ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleCreateBackup}
                        className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 transition flex items-center justify-center gap-2"
                    >
                        <Database size={20} />
                        Create Backup
                    </button>

                    {backups.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium mb-2 dark:text-white">Available Backups</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {backups.map((backup) => (
                                    <div key={backup.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <div className="text-sm">
                                            <div className="font-medium dark:text-white">
                                                {backup.description || 'Backup'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(backup.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRestoreBackup(backup.id)}
                                            className="text-blue-500 hover:text-blue-600 text-sm"
                                        >
                                            Restore
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {encryptionEnabled && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                        Troubleshooting
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        If you're having issues with encryption, you can reset the security configuration.
                        This will require setting up encryption again.
                    </p>
                    <button
                        onClick={async () => {
                            if (confirm('This will reset all encryption settings. You will need to set up encryption again. Continue?')) {
                                if (securityManager) {
                                    securityManager.clearAll();
                                    securityManager.clearSalt();
                                    showToast('Encryption settings reset. Please set up encryption again.', 'info');
                                    setTimeout(() => window.location.reload(), 2000);
                                }
                            }
                        }}
                        className="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition text-sm"
                    >
                        Reset Encryption Configuration
                    </button>
                </div>
            )}
            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Data Management</h3>
                <div className="space-y-3">
                    <button
                        onClick={exportData}
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        Export Data
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
                    >
                        <Upload size={20} />
                        Import Data
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Appearance</h3>
                <button
                    onClick={toggleTheme}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
            </div>

            {/* Developer Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Developer Tools</h3>
                <button
                    onClick={() => setShowDebugOverlay(true)}
                    className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition"
                >
                    🔧 Open Debug Console
                </button>
            </div>

            {/* Debug Overlay */}
            <DebugOverlay
                isOpen={showDebugOverlay}
                onClose={() => setShowDebugOverlay(false)}
            />

            {/* Privacy Info */}
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Lock size={16} />
                    Privacy First
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    All your data is stored locally on your device using IndexedDB. Nothing is sent to external servers.
                    You have complete control and ownership of your financial information. When encryption is enabled,
                    your data is protected with AES-GCM 256-bit encryption.
                </p>
            </div>
        </div>
    );
};