import { useState, useCallback } from 'react';
import { cryptoUtils } from '../utils/cryptoUtils';
import { logger } from '../utils/logger';

export const useCrypto = () => {
    const [encryptionKey, setEncryptionKey] = useState(null);
    const [isEncrypted, setIsEncrypted] = useState(false);

    const setupEncryption = useCallback(async (passphrase) => {
        try {
            if (!passphrase || passphrase.length < 6) {
                return { success: false, error: 'Passphrase must be at least 6 characters' };
            }

            const key = await cryptoUtils.generateKey(passphrase);
            setEncryptionKey(key);
            setIsEncrypted(true);

            logger.info('Encryption setup successful');
            return { success: true };
        } catch (error) {
            logger.error('Encryption setup failed', error);
            return { success: false, error: error.message };
        }
    }, []);

    const unlockEncryption = useCallback(async (passphrase) => {
        try {
            if (!passphrase) {
                return { success: false, error: 'Passphrase is required' };
            }

            const key = await cryptoUtils.generateKey(passphrase);
            setEncryptionKey(key);

            logger.info('Encryption unlocked successfully');
            return { success: true };
        } catch (error) {
            logger.error('Encryption unlock failed', error);
            return { success: false, error: 'Invalid passphrase' };
        }
    }, []);

    const encrypt = useCallback(async (data) => {
        if (!encryptionKey) {
            return { success: false, error: 'No encryption key available' };
        }

        try {
            const encryptedData = await cryptoUtils.encrypt(data, encryptionKey);
            return { success: true, data: encryptedData };
        } catch (error) {
            logger.error('Encryption failed', error);
            return { success: false, error: error.message };
        }
    }, [encryptionKey]);

    const decrypt = useCallback(async (encryptedData) => {
        if (!encryptionKey) {
            return { success: false, error: 'No encryption key available' };
        }

        try {
            const decryptedData = await cryptoUtils.decrypt(encryptedData, encryptionKey);
            return { success: true, data: decryptedData };
        } catch (error) {
            logger.error('Decryption failed', error);
            return { success: false, error: error.message };
        }
    }, [encryptionKey]);

    const resetEncryption = useCallback(() => {
        setEncryptionKey(null);
        setIsEncrypted(false);
        logger.info('Encryption reset');
    }, []);

    return {
        encryptionKey,
        isEncrypted,
        setupEncryption,
        unlockEncryption,
        encrypt,
        decrypt,
        resetEncryption
    };
};