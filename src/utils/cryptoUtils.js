import { logger } from './logger';

export const cryptoUtils = {
    /**
     * Generate encryption key from passphrase
     */
    async generateKey(passphrase) {
        try {
            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                enc.encode(passphrase),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            return await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: enc.encode('expenseflow-salt-2024'),
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            logger.error('Key generation failed', error);
            throw error;
        }
    },

    /**
     * Encrypt data using AES-GCM
     */
    async encrypt(data, key) {
        try {
            const enc = new TextEncoder();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                enc.encode(JSON.stringify(data))
            );

            return {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted))
            };
        } catch (error) {
            logger.error('Encryption failed', error);
            throw error;
        }
    },

    /**
     * Decrypt data using AES-GCM
     */
    async decrypt(encryptedData, key) {
        try {
            const dec = new TextDecoder();
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
                key,
                new Uint8Array(encryptedData.data)
            );

            return JSON.parse(dec.decode(decrypted));
        } catch (error) {
            logger.error('Decryption failed', error);
            throw error;
        }
    },

    /**
     * Generate random ID
     */
    generateId() {
        return window.crypto.randomUUID();
    }
};