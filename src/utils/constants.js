// src/utils/constants.js

export const DB_NAME = 'ExpenseFlowDB';
export const DB_VERSION = 1;
export const ENCRYPTION_KEY_NAME = 'expenseflow_encryption_key';

export const CATEGORIES = [
    { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
    { name: 'Shopping', icon: '🛍️', color: '#FFE66D' },
    { name: 'Entertainment', icon: '🎬', color: '#A8E6CF' },
    { name: 'Bills & Utilities', icon: '💡', color: '#FF8B94' },
    { name: 'Healthcare', icon: '⚕️', color: '#C7CEEA' },
    { name: 'Education', icon: '📚', color: '#B4A7D6' },
    { name: 'Salary', icon: '💰', color: '#95E1D3' },
    { name: 'Investment', icon: '📈', color: '#667eea' },
    { name: 'Other', icon: '📌', color: '#F38181' }
];

export const PAYMENT_TYPES = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'card', label: '💳 Card' },
    { value: 'crypto', label: '₿ Crypto' },
    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
    { value: 'mobile_money', label: '📱 Mobile Money' }
];

export const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense'
};

export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARN: 'warn'
};

export const VIEW_TYPES = {
    DASHBOARD: 'dashboard',
    TRANSACTIONS: 'transactions',
    SETTINGS: 'settings'
};