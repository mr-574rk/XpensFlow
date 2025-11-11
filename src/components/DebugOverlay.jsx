// src/components/DebugOverlay.jsx

import React, { useState, useEffect } from 'react';
import { X, Database, Lock, Activity, Zap, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { securityManager } from '../core/SecurityManager';
import { databaseManager } from '../core/DatabaseManager';

export const DebugOverlay = ({ isOpen, onClose }) => {
    const [stats, setStats] = useState({
        security: null,
        database: null,
        memory: null,
        errors: []
    });

    useEffect(() => {
        if (isOpen) {
            loadStats();
            const interval = setInterval(loadStats, 2000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const loadStats = async () => {
        // Security stats
        const securityStatus = securityManager.getStatus();

        // Database stats
        const dbStats = await databaseManager.getStats();

        // Memory stats (Chrome only)
        const memory = performance.memory ? {
            usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
            totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
            limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
        } : null;

        // Recent errors
        const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');

        setStats({
            security: securityStatus,
            database: dbStats,
            memory,
            errors: errors.slice(-5)
        });
    };

    const clearErrors = () => {
        sessionStorage.removeItem('app_errors');
        setStats(prev => ({ ...prev, errors: [] }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
            <div className="bg-gray-900 text-gray-100 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <Activity className="text-green-400" size={24} />
                        <h2 className="text-xl font-bold">Debug Console</h2>
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-pulse">
                            LIVE
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                        title="Close (ESC)"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Security Status */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Lock className="text-blue-400" size={20} />
                            <h3 className="font-bold">Security Status</h3>
                        </div>
                        {stats.security && (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`ml-2 font-mono ${stats.security.isLocked ? 'text-red-400' : 'text-green-400'}`}>
                                        {stats.security.isLocked ? 'LOCKED' : 'UNLOCKED'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Encryption:</span>
                                    <span className={`ml-2 font-mono ${stats.security.hasEncryption ? 'text-green-400' : 'text-gray-500'}`}>
                                        {stats.security.hasEncryption ? 'ENABLED' : 'DISABLED'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Auto-lock:</span>
                                    <span className="ml-2 font-mono text-yellow-400">
                                        {stats.security.autoLockMinutes}min
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Cache Size:</span>
                                    <span className="ml-2 font-mono text-blue-400">
                                        {stats.security.cacheSize}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-400">Last Activity:</span>
                                    <span className="ml-2 font-mono text-purple-400 text-xs">
                                        {new Date(stats.security.lastActivity).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Database Status */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Database className="text-purple-400" size={20} />
                            <h3 className="font-bold">Database Status</h3>
                        </div>
                        {stats.database && (
                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-gray-400">Transactions:</span>
                                        <span className="ml-2 font-mono text-purple-400">
                                            {stats.database.transactions}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Budgets:</span>
                                        <span className="ml-2 font-mono text-purple-400">
                                            {stats.database.budgets}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Settings:</span>
                                        <span className="ml-2 font-mono text-purple-400">
                                            {stats.database.settings}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Backups:</span>
                                        <span className="ml-2 font-mono text-purple-400">
                                            {stats.database.backups}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-400">Encrypted:</span>
                                        <span className={`ml-2 font-mono ${stats.database.encrypted ? 'text-green-400' : 'text-gray-500'}`}>
                                            {stats.database.encrypted ? 'YES' : 'NO'}
                                        </span>
                                    </div>
                                </div>
                                {stats.database.dbSize && (
                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                        <div className="text-gray-400 mb-2">Storage Usage:</div>
                                        <div className="bg-gray-900 rounded p-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>{(stats.database.dbSize.usage / 1048576).toFixed(2)} MB</span>
                                                <span>{stats.database.dbSize.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.min(stats.database.dbSize.percentage, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs mt-1 text-gray-500">
                                                <span>Used</span>
                                                <span>Quota: {(stats.database.dbSize.quota / 1048576).toFixed(0)} MB</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Memory Usage */}
                    {stats.memory && (
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="text-yellow-400" size={20} />
                                <h3 className="font-bold">Memory Usage</h3>
                                <span className="text-xs text-gray-500">(Chrome only)</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Used Heap:</span>
                                    <span className="font-mono text-yellow-400">
                                        {stats.memory.usedJSHeapSize} MB
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Heap:</span>
                                    <span className="font-mono text-yellow-400">
                                        {stats.memory.totalJSHeapSize} MB
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Heap Limit:</span>
                                    <span className="font-mono text-yellow-400">
                                        {stats.memory.limit} MB
                                    </span>
                                </div>
                                <div className="mt-2 bg-gray-900 rounded p-2">
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(parseFloat(stats.memory.usedJSHeapSize) / parseFloat(stats.memory.limit)) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-center mt-1 text-gray-500">
                                        {((parseFloat(stats.memory.usedJSHeapSize) / parseFloat(stats.memory.limit)) * 100).toFixed(1)}% of limit
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Errors */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="text-red-400" size={20} />
                                <h3 className="font-bold">Recent Errors</h3>
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {stats.errors.length}
                                </span>
                            </div>
                            {stats.errors.length > 0 && (
                                <button
                                    onClick={clearErrors}
                                    className="text-xs text-gray-400 hover:text-white transition"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        {stats.errors.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                ✓ No errors logged
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {stats.errors.map((error, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-900 rounded p-3 text-xs border border-red-900"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-red-400 font-mono">
                                                {error.message}
                                            </span>
                                            <span className="text-gray-500 text-[10px]">
                                                {new Date(error.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        {error.stack && (
                                            <pre className="text-gray-400 text-[10px] mt-2 overflow-x-auto">
                                                {error.stack.split('\n').slice(0, 2).join('\n')}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* System Information */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity className="text-cyan-400" size={20} />
                            <h3 className="font-bold">System Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-400">Network:</span>
                                <span className={`ml-2 font-mono flex items-center gap-1 ${navigator.onLine ? 'text-green-400' : 'text-red-400'}`}>
                                    {navigator.onLine ? (
                                        <>
                                            <Wifi size={14} />
                                            ONLINE
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff size={14} />
                                            OFFLINE
                                        </>
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Platform:</span>
                                <span className="ml-2 font-mono text-blue-400">
                                    {navigator.platform}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Language:</span>
                                <span className="ml-2 font-mono text-blue-400">
                                    {navigator.language}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Cookies:</span>
                                <span className={`ml-2 font-mono ${navigator.cookieEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                    {navigator.cookieEnabled ? 'ENABLED' : 'DISABLED'}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-400">User Agent:</span>
                                <div className="ml-2 font-mono text-xs text-gray-500 break-all">
                                    {navigator.userAgent}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="text-green-400" size={20} />
                            <h3 className="font-bold">Performance</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Page Load Time:</span>
                                <span className="font-mono text-green-400">
                                    {performance.timing ?
                                        ((performance.timing.loadEventEnd - performance.timing.navigationStart) / 1000).toFixed(2) + 's'
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">DOM Ready:</span>
                                <span className="font-mono text-green-400">
                                    {performance.timing ?
                                        ((performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart) / 1000).toFixed(2) + 's'
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Storage API:</span>
                                <span className={`font-mono ${'indexedDB' in window ? 'text-green-400' : 'text-red-400'}`}>
                                    {'indexedDB' in window ? 'AVAILABLE' : 'NOT AVAILABLE'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Crypto API:</span>
                                <span className={`font-mono ${window.crypto && window.crypto.subtle ? 'text-green-400' : 'text-red-400'}`}>
                                    {window.crypto && window.crypto.subtle ? 'AVAILABLE' : 'NOT AVAILABLE'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-800 px-6 py-3 border-t border-gray-700 text-xs text-gray-500 flex justify-between items-center">
                    <span>Debug mode active • Updates every 2s</span>
                    <span>Press <kbd className="px-2 py-1 bg-gray-700 rounded">ESC</kbd> to close</span>
                </div>
            </div>
        </div>
    );
};