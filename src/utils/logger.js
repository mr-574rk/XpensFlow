const LOG_LEVELS = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    DEBUG: 'debug'
};

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
    info: (message, data) => {
        if (isDevelopment) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
        }
    },

    warn: (message, data) => {
        if (isDevelopment) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
        }
    },

    error: (message, data) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data || '');
    },

    debug: (message, data) => {
        if (isDevelopment) {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }
};