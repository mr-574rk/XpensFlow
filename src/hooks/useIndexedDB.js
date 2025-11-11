// src/hooks/useIndexedDB.js

import { useState, useEffect } from 'react';
import { DB_NAME, DB_VERSION } from '../utils/constants';
import { logger } from '../utils/logger';

export const useIndexedDB = () => {
    const [db, setDb] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initDB = () => {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = () => {
                    logger.error('IndexedDB failed to open', request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    logger.info('IndexedDB opened successfully');
                    resolve(request.result);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;

                    if (!db.objectStoreNames.contains('transactions')) {
                        const store = db.createObjectStore('transactions', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        store.createIndex('date', 'date', { unique: false });
                        store.createIndex('category', 'category', { unique: false });
                        store.createIndex('type', 'type', { unique: false });
                        logger.info('Created transactions store');
                    }

                    if (!db.objectStoreNames.contains('budgets')) {
                        db.createObjectStore('budgets', { keyPath: 'category' });
                        logger.info('Created budgets store');
                    }

                    if (!db.objectStoreNames.contains('settings')) {
                        db.createObjectStore('settings', { keyPath: 'key' });
                        logger.info('Created settings store');
                    }
                };
            });
        };

        initDB()
            .then(database => {
                setDb(database);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });

        return () => {
            if (db) {
                db.close();
                logger.info('IndexedDB connection closed');
            }
        };
    }, []);

    const getAll = (storeName) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    const add = (storeName, data) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    const put = (storeName, data) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    const remove = (storeName, key) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    };

    const clear = (storeName) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    };

    return {
        db,
        loading,
        error,
        getAll,
        add,
        put,
        remove,
        clear
    };
};