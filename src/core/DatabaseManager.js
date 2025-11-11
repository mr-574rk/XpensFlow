// src/core/DatabaseManager.js - Encrypted IndexedDB Wrapper

import { logger } from '../utils/logger';
import { securityManager } from './SecurityManager';

class DatabaseManager {
    constructor() {
        this.dbName = 'ExpenseFlowDB';
        this.version = 3; // Increment when schema changes
        this.db = null;
        this.isInitialized = false;
        this.backupLimit = 3; // Keep last 3 backups
    }

    // Initialize database
    async initialize() {
        try {
            // Check current database version first
            const currentVersion = await this.getCurrentVersion();

            if (currentVersion && currentVersion > this.version) {
                logger.warn(`Existing database version ${currentVersion} is newer than expected ${this.version}`);
                // Use the existing version
                this.version = currentVersion;
            }

            this.db = await this.openDatabase();
            this.isInitialized = true;
            logger.info('DatabaseManager initialized successfully');

            await this.performMaintenance();

            return { success: true };
        } catch (error) {
            logger.error('Database initialization failed', error);

            // If version error, try to recover
            if (error.name === 'VersionError') {
                return await this.handleVersionError(error);
            }

            return { success: false, error: error.message };
        }
    }
    async getCurrentVersion() {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName);

            request.onsuccess = () => {
                const db = request.result;
                const version = db.version;
                db.close();
                resolve(version);
            };

            request.onerror = () => {
                resolve(null);
            };
        });
    }

    // Handle version conflicts gracefully
    async handleVersionError(error) {
        logger.warn('Handling version conflict', error);

        try {
            // Try to open with no version (will use existing)
            const db = await this.openDatabaseNoVersion();
            this.db = db;
            this.version = db.version;
            this.isInitialized = true;

            logger.info(`Recovered with existing database version ${this.version}`);
            return { success: true, recovered: true };
        } catch (recoveryError) {
            logger.error('Version recovery failed', recoveryError);
            return { success: false, error: recoveryError.message };
        }
    }
    // Add this method to your DatabaseManager class

    /**
     * Get database statistics for debugging and monitoring
     */
    async getStats() {
        if (!this.isInitialized) {
            return {
                transactions: 0,
                budgets: 0,
                settings: 0,
                backups: 0,
                encrypted: false,
                dbSize: null
            };
        }

        try {
            const [transactions, budgets, settings, backups] = await Promise.all([
                this.getCount('transactions'),
                this.getCount('budgets'),
                this.getCount('settings'),
                this.getCount('backups')
            ]);

            // Get storage estimate
            let dbSize = null;
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                dbSize = {
                    usage: estimate.usage,
                    quota: estimate.quota,
                    percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
                };
            }

            return {
                transactions,
                budgets,
                settings,
                backups,
                encrypted: !!this.encryptionEnabled,
                dbSize
            };
        } catch (error) {
            logger.error('Failed to get database stats', error);
            return {
                transactions: 0,
                budgets: 0,
                settings: 0,
                backups: 0,
                encrypted: false,
                dbSize: null,
                error: error.message
            };
        }
    }
    // Open database without specifying version
    openDatabaseNoVersion() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName); // No version specified

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = () => {
                // This shouldn't happen when no version is specified
                logger.info('Database upgrade occurred during recovery');
            };
        });
    }

    // Open or create database
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                logger.error('IndexedDB open failed', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                logger.info('Database opened successfully');
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createObjectStores(db);
                logger.info('Database schema upgraded to version', event.oldVersion, '→', event.newVersion);
            };

            request.onblocked = () => {
                logger.warn('Database upgrade blocked - close other tabs');
            };
        });
    }

    // Create object stores
    createObjectStores(db) {
        // Main data stores
        if (!db.objectStoreNames.contains('transactions')) {
            const store = db.createObjectStore('transactions', {
                keyPath: 'id',
                autoIncrement: true
            });
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('category', 'category', { unique: false });
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('budgets')) {
            db.createObjectStore('budgets', { keyPath: 'category' });
        }

        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Backup store for versioning
        if (!db.objectStoreNames.contains('backups')) {
            const backupStore = db.createObjectStore('backups', {
                keyPath: 'id',
                autoIncrement: true
            });
            backupStore.createIndex('timestamp', 'timestamp', { unique: false });
            backupStore.createIndex('version', 'version', { unique: false });
        }

        // Analytics and metadata store
        if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
        }
    }
    async getTransactionsWithDecryption() {
        try {
            let transactions = await this.getAll('transactions');

            // Check if encryption is enabled
            const encryptionSetting = await this.get('settings', 'encryption_enabled');
            const isEncrypted = encryptionSetting?.value === true;

            if (isEncrypted && securityManager && securityManager.isInitialized()) {
                transactions = await Promise.all(
                    transactions.map(async (t) => {
                        if (t.encrypted && t.data && t.iv) {
                            try {
                                const decrypted = await securityManager.decrypt({
                                    data: t.data,
                                    iv: t.iv
                                });
                                if (decrypted.success) {
                                    return { ...decrypted.data, id: t.id };
                                }
                            } catch (error) {
                                logger.error('Failed to decrypt transaction', error);
                            }
                        }
                        return t.encrypted ? null : t;
                    })
                );
                // Filter out null values (failed decryptions)
                return transactions.filter(t => t !== null);
            }

            return transactions;
        } catch (error) {
            logger.error('Failed to get transactions with decryption', error);
            return [];
        }
    }
    // Generic CRUD operations
    async add(storeName, data) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName, indexName = null, range = null) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const source = indexName ? store.index(indexName) : store;
            const request = range ? source.getAll(range) : source.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Backup functionality
    async createBackup(description = 'Manual backup') {
        await this.ensureInitialized();

        try {
            // Collect all data
            const [transactions, budgets, settings] = await Promise.all([
                this.getAll('transactions'),
                this.getAll('budgets'),
                this.getAll('settings')
            ]);

            const backup = {
                timestamp: new Date().toISOString(),
                version: this.version,
                description,
                data: {
                    transactions,
                    budgets,
                    settings
                },
                checksum: await this.generateChecksum({ transactions, budgets, settings })
            };

            // Encrypt backup if security manager is available and unlocked
            if (securityManager && securityManager.salt && !securityManager.isLocked) {
                const encrypted = await securityManager.encrypt(backup);
                if (encrypted.success) {
                    backup.encrypted = true;
                    backup.data = encrypted.encrypted;
                }
            }

            // Store backup
            const backupId = await this.add('backups', backup);

            // Clean up old backups
            await this.cleanupOldBackups();

            logger.info(`Backup created: ${backupId}`, { description });
            return { success: true, id: backupId };
        } catch (error) {
            logger.error('Backup creation failed', error);
            return { success: false, error: error.message };
        }
    }

    // Restore from backup
    async restoreBackup(backupId) {
        await this.ensureInitialized();

        try {
            const backup = await this.get('backups', backupId);
            if (!backup) {
                throw new Error('Backup not found');
            }

            let backupData = backup.data;

            // Decrypt if encrypted
            if (backup.encrypted && securityManager && securityManager.isInitialized()) {
                backupData = await securityManager.decryptData(backupData);
            }

            // Verify checksum
            const currentChecksum = await this.generateChecksum(backupData);
            if (currentChecksum !== backup.checksum) {
                throw new Error('Backup integrity check failed');
            }

            // Clear existing data
            await this.clearStore('transactions');
            await this.clearStore('budgets');
            await this.clearStore('settings');

            // Restore data
            const { transactions, budgets, settings } = backupData;

            await Promise.all([
                ...transactions.map(t => this.add('transactions', t)),
                ...budgets.map(b => this.put('budgets', b)),
                ...settings.map(s => this.put('settings', s))
            ]);

            logger.info(`Backup restored: ${backupId}`);
            return { success: true };
        } catch (error) {
            logger.error('Backup restoration failed', error);
            return { success: false, error: error.message };
        }
    }

    // Get all backups
    async getBackups() {
        await this.ensureInitialized();
        return this.getAll('backups', 'timestamp', IDBKeyRange.lowerBound(new Date(0)));
    }

    // Cleanup old backups
    async cleanupOldBackups() {
        try {
            const backups = await this.getBackups();
            if (backups.length > this.backupLimit) {
                // Sort by timestamp (oldest first)
                backups.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                // Delete oldest backups beyond limit
                const toDelete = backups.slice(0, backups.length - this.backupLimit);
                await Promise.all(
                    toDelete.map(backup => this.delete('backups', backup.id))
                );

                logger.info(`Cleaned up ${toDelete.length} old backups`);
            }
        } catch (error) {
            logger.error('Backup cleanup failed', error);
        }
    }

    // Storage usage tracking
    async getStorageStats() {
        if (!this.db) return null;

        try {
            const stores = Array.from(this.db.objectStoreNames);
            const stats = {};

            for (const storeName of stores) {
                const count = await this.getCount(storeName);
                const size = await this.estimateStoreSize(storeName);
                stats[storeName] = { count, size };
            }

            // Total database size estimation
            stats.totalSize = Object.values(stats).reduce((sum, store) => sum + store.size, 0);
            stats.totalRecords = Object.values(stats).reduce((sum, store) => sum + store.count, 0);

            return stats;
        } catch (error) {
            logger.error('Storage stats calculation failed', error);
            return null;
        }
    }

    // Get record count for a store
    async getCount(storeName) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Estimate store size (rough calculation)
    async estimateStoreSize(storeName) {
        const data = await this.getAll(storeName);
        const jsonString = JSON.stringify(data);
        return new Blob([jsonString]).size;
    }

    // Automatic maintenance tasks
    async performMaintenance() {
        try {
            // Clean up old backups
            await this.cleanupOldBackups();

            // Update metadata
            await this.updateMetadata();

            // Create automatic backup if significant changes
            await this.createAutomaticBackupIfNeeded();

            logger.info('Database maintenance completed');
        } catch (error) {
            logger.error('Database maintenance failed', error);
        }
    }

    // Create automatic backup based on conditions
    async createAutomaticBackupIfNeeded() {
        try {
            const lastBackup = await this.getLastBackup();
            const transactionCount = await this.getCount('transactions');

            // Backup if no backup exists or significant changes occurred
            if (!lastBackup || transactionCount > (lastBackup.data?.transactions?.length || 0) + 10) {
                await this.createBackup('Automatic backup');
            }
        } catch (error) {
            logger.error('Automatic backup check failed', error);
        }
    }

    // Get most recent backup
    async getLastBackup() {
        const backups = await this.getBackups();
        return backups.length > 0 ? backups[backups.length - 1] : null;
    }

    // Clear all data from a store
    async clearStore(storeName) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Export all data for download
    async exportData() {
        await this.ensureInitialized();

        const [transactions, budgets, settings, backups] = await Promise.all([
            this.getAll('transactions'),
            this.getAll('budgets'),
            this.getAll('settings'),
            this.getBackups()
        ]);

        return {
            exportDate: new Date().toISOString(),
            version: this.version,
            data: {
                transactions,
                budgets,
                settings,
                backups: backups.map(b => ({ id: b.id, timestamp: b.timestamp, description: b.description }))
            },
            stats: await this.getStorageStats()
        };
    }

    // Import data from export
    async importData(importData) {
        await this.ensureInitialized();

        try {
            // Clear existing data
            await this.clearStore('transactions');
            await this.clearStore('budgets');
            await this.clearStore('settings');

            // Import new data
            const { transactions, budgets, settings } = importData.data;

            await Promise.all([
                ...transactions.map(t => this.add('transactions', t)),
                ...budgets.map(b => this.put('budgets', b)),
                ...settings.map(s => this.put('settings', s))
            ]);

            logger.info('Data import completed successfully');
            return { success: true };
        } catch (error) {
            logger.error('Data import failed', error);
            return { success: false, error: error.message };
        }
    }

    // Utility methods
    async ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('DatabaseManager not initialized. Call initialize() first.');
        }
    }

    async generateChecksum(data) {
        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(jsonString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async updateMetadata() {
        const stats = await this.getStorageStats();
        const metadata = {
            key: 'database_stats',
            lastUpdated: new Date().toISOString(),
            stats,
            version: this.version
        };

        await this.put('metadata', metadata);
    }

    // Security configuration
    async saveSecurityConfig() {
        try {
            await this.ensureInitialized();

            if (securityManager && securityManager.isInitialized()) {
                // Check if getConfig method exists, otherwise use exportConfig
                const config = securityManager.getConfig ?
                    securityManager.getConfig() :
                    securityManager.exportConfig();

                await this.put('settings', {
                    key: 'security_config',
                    value: config,
                    timestamp: new Date().toISOString()
                });
                logger.info('Security config saved successfully');
            }
        } catch (error) {
            logger.error('Failed to save security config', error);
        }
    }

    async loadSecurityConfig() {
        const config = await this.get('settings', 'security_config');
        return config ? config.value : null;
    }

    // Debug and diagnostics
    async getDiagnostics() {
        return {
            initialized: this.isInitialized,
            dbName: this.dbName,
            version: this.version,
            objectStores: this.db ? Array.from(this.db.objectStoreNames) : [],
            stats: await this.getStorageStats(),
            backups: (await this.getBackups()).length
        };
    }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();