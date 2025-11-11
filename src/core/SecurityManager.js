// src/core/SecurityManager.js

import { logger } from '../utils/logger';

/**
 * SecurityManager - Zero-knowledge encryption with PBKDF2 salt
 * Implements secure key derivation and auto-lock functionality
 */
class SecurityManager {
    constructor() {
        this.encryptionKey = null;
        this.salt = null;
        this.isLocked = true;
        this.lockTimeout = null;
        this.autoLockMinutes = 15;
        this.lastActivity = Date.now();
        this.integrityCache = new Map();
        this.loadAutoLockSettings();
        this.loadSalt();
    }

    /**
     * Generate cryptographically secure salt
     */
    generateSalt() {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        this.salt = Array.from(salt);
        return this.salt;
    }

    isInitialized() {
        return this.salt !== null && this.encryptionKey !== null && !this.isLocked;
    }

    getState() {
        return {
            isInitialized: this.isInitialized(),
            isLocked: this.isLocked,
            hasSalt: !!this.salt,
            hasEncryptionKey: !!this.encryptionKey
        };
    }
    /**
      * Load salt from persistent storage
      */
    loadSalt() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const savedSalt = localStorage.getItem('expenseflow_encryption_salt');
                if (savedSalt) {
                    this.salt = JSON.parse(savedSalt);
                    console.log('Loaded salt from storage:', this.salt ? 'Yes' : 'No');
                }
            }
        } catch (error) {
            console.warn('Failed to load salt from storage:', error);
        }
    }

    /**
     * Save salt to persistent storage
     */
    saveSalt() {
        try {
            if (this.salt && typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('expenseflow_encryption_salt', JSON.stringify(this.salt));
                console.log('Salt saved to storage');
            }
        } catch (error) {
            console.warn('Failed to save salt to storage:', error);
        }
    }

    /**
     * Clear salt from storage (for testing/reset)
     */
    clearSalt() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem('expenseflow_encryption_salt');
                console.log('Salt cleared from storage');
            }
        } catch (error) {
            console.warn('Failed to clear salt from storage:', error);
        }
    }
    /**
     * Derive encryption key from PIN using PBKDF2
     */
    async deriveKey(pin, salt = null) {
        try {
            // If no salt provided, generate new one or use existing
            if (!salt) {
                if (!this.salt) {
                    this.salt = this.generateSalt();
                    this.saveSalt(); // Save the new salt
                }
                salt = this.salt;
            } else {
                this.salt = salt;
                this.saveSalt(); // Save the provided salt
            }

            console.log('Deriving key with salt:', this.salt ? 'Present' : 'Missing');

            // Validate PIN strength
            if (!this.isValidPIN(pin)) {
                throw new Error('PIN must be at least 6 characters with numbers and letters');
            }

            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                enc.encode(pin),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: new Uint8Array(salt),
                    iterations: 310000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false, // Not extractable for security
                ['encrypt', 'decrypt']
            );

            this.encryptionKey = key;
            this.isLocked = false;
            this.resetAutoLock();

            console.log('Encryption key derived successfully, app unlocked');
            return { success: true, salt: this.salt };
        } catch (error) {
            console.error('Key derivation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unlock with PIN - fixed version
     */
    async unlock(pin) {
        console.log('SecurityManager.unlock called, current salt:', this.salt);

        if (!this.salt) {
            const errorMsg = 'No encryption configured. Please set up encryption first.';
            console.error(errorMsg);
            return { success: false, error: errorMsg };
        }

        try {
            const result = await this.deriveKey(pin, this.salt);
            console.log('SecurityManager.unlock result:', result);
            return result;
        } catch (error) {
            console.error('SecurityManager.unlock error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validate PIN strength
     */
    isValidPIN(pin) {
        if (pin.length < 6) return false;

        // Must contain at least one number and one letter
        const hasNumber = /\d/.test(pin);
        const hasLetter = /[a-zA-Z]/.test(pin);

        return hasNumber && hasLetter;
    }

    /**
     * Encrypt data with integrity checksum
     */
    async encrypt(data, additionalData = null) {
        try {
            if (this.isLocked || !this.encryptionKey) {
                throw new Error('Security manager is locked');
            }

            this.updateActivity();

            const enc = new TextEncoder();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            // Add timestamp and checksum for integrity
            const payload = {
                data,
                timestamp: Date.now(),
                checksum: await this.calculateChecksum(data)
            };

            if (additionalData) {
                payload.metadata = additionalData;
            }

            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                this.encryptionKey,
                enc.encode(JSON.stringify(payload))
            );

            const result = {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted)),
                version: '2.0' // Version for future migrations
            };

            // Cache integrity hash
            const hash = await this.calculateChecksum(result);
            this.integrityCache.set(hash, Date.now());

            return { success: true, encrypted: result };
        } catch (error) {
            logger.error('Encryption failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Decrypt data with integrity verification
     */
    async decrypt(encryptedData) {
        try {
            if (this.isLocked || !this.encryptionKey) {
                throw new Error('Security manager is locked');
            }

            this.updateActivity();

            // Verify data integrity
            const hash = await this.calculateChecksum(encryptedData);
            if (!this.integrityCache.has(hash)) {
                logger.warn('Data integrity check failed - hash not in cache');
            }

            const dec = new TextDecoder();
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
                this.encryptionKey,
                new Uint8Array(encryptedData.data)
            );

            const payload = JSON.parse(dec.decode(decrypted));

            // Verify checksum
            const dataChecksum = await this.calculateChecksum(payload.data);
            if (dataChecksum !== payload.checksum) {
                logger.error('Data checksum mismatch - data may be corrupted');
                throw new Error('Data integrity verification failed');
            }

            return { success: true, data: payload.data, metadata: payload.metadata };
        } catch (error) {
            logger.error('Decryption failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Simple decrypt method for transaction data (compatibility)
     */
    async decryptData(encryptedData, iv) {
        try {
            if (this.isLocked || !this.encryptionKey) {
                throw new Error('Security manager is locked');
            }

            this.updateActivity();

            // Convert from base64 if needed
            const encryptedArray = typeof encryptedData === 'string'
                ? new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)))
                : new Uint8Array(encryptedData);

            const ivArray = typeof iv === 'string'
                ? new Uint8Array(atob(iv).split('').map(char => char.charCodeAt(0)))
                : new Uint8Array(iv);

            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: ivArray
                },
                this.encryptionKey,
                encryptedArray
            );

            const decoder = new TextDecoder();
            const decryptedString = decoder.decode(decrypted);
            return JSON.parse(decryptedString);
        } catch (error) {
            logger.error('Decryption failed', error);
            throw error;
        }
    }

    /**
     * Calculate SHA-256 checksum for integrity verification
     */
    async calculateChecksum(data) {
        const enc = new TextEncoder();
        const hashBuffer = await window.crypto.subtle.digest(
            'SHA-256',
            enc.encode(JSON.stringify(data))
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        this.lastActivity = Date.now();
        this.resetAutoLock();
    }

    /**
     * Setup auto-lock timer
     */
    resetAutoLock() {
        if (this.lockTimeout) {
            clearTimeout(this.lockTimeout);
        }

        this.lockTimeout = setTimeout(() => {
            this.lock();
            logger.info('Auto-lock triggered due to inactivity');
        }, this.autoLockMinutes * 60 * 1000);
    }

    /**
     * Manually lock the app
     */
    lock() {
        this.encryptionKey = null;
        this.isLocked = true;
        this.integrityCache.clear();

        if (this.lockTimeout) {
            clearTimeout(this.lockTimeout);
            this.lockTimeout = null;
        }

        logger.info('Security manager locked');
    }



    /**
     * Change PIN
     */
    async changePIN(oldPIN, newPIN) {
        try {
            // Verify old PIN
            const unlockResult = await this.unlock(oldPIN);
            if (!unlockResult.success) {
                return { success: false, error: 'Invalid current PIN' };
            }

            // Generate new salt and derive new key
            const newSalt = this.generateSalt();
            const result = await this.deriveKey(newPIN, newSalt);

            if (result.success) {
                logger.info('PIN changed successfully');
            }

            return result;
        } catch (error) {
            logger.error('PIN change failed', error);
            return { success: false, error: error.message };
        }
    }
    /**
     * Get security configuration for export
     */
    getConfig() {
        return {
            salt: this.salt,
            autoLockMinutes: this.autoLockMinutes,
            version: '2.0',
            lastActivity: this.lastActivity
        };
    }
    /**
     * Set auto-lock duration
     */
    async setAutoLockDuration(minutes) {
        this.autoLockMinutes = minutes;
        this.resetAutoLock();

        // Save to persistent storage
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('expenseflow_autolock_minutes', minutes.toString());
            }
        } catch (error) {
            logger.warn('Failed to save auto-lock settings:', error);
        }

        logger.info(`Auto-lock set to ${minutes} minutes`);
    }
    /**
      * Load auto-lock settings from storage
      */
    loadAutoLockSettings() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = localStorage.getItem('expenseflow_autolock_minutes');
                if (saved) {
                    this.autoLockMinutes = parseInt(saved) || 15;
                }
            }
        } catch (error) {
            logger.warn('Failed to load auto-lock settings:', error);
        }
    }
    /**
     * Get security status
     */
    getStatus() {
        return {
            isLocked: this.isLocked,
            hasEncryption: this.salt !== null,
            autoLockMinutes: this.autoLockMinutes,
            lastActivity: this.lastActivity,
            cacheSize: this.integrityCache.size
        };
    }

    /**
     * Export security config (salt only, never the key)
     */
    exportConfig() {
        return {
            salt: this.salt,
            autoLockMinutes: this.autoLockMinutes,
            version: '2.0'
        };
    }

    /**
     * Import security config
     */
    importConfig(config) {
        if (config.salt) {
            this.salt = config.salt;
        }
        if (config.autoLockMinutes) {
            this.autoLockMinutes = config.autoLockMinutes;
        }
        logger.info('Security config imported');
    }

    /**
     * Clear all security data (use with caution)
     */
    clearAll() {
        this.lock();
        this.salt = null;
        this.integrityCache.clear();
        logger.warn('All security data cleared');
    }
}

// Singleton instance
export const securityManager = new SecurityManager();
export default SecurityManager;