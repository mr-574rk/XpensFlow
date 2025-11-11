import { CURRENCIES } from './constants';

export const formatters = {
    currency: (amount, currency = 'USD') => {
        const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

        return new Intl.NumberFormat(currencyInfo.locale, {
            style: 'currency',
            currency: currencyInfo.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    shortCurrency: (amount, currency = 'USD') => {
        const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

        if (amount >= 1000) {
            return `${currencyInfo.symbol}${(amount / 1000).toFixed(1)}K`;
        }
        return formatters.currency(amount, currency);
    },

    percentage: (value) => {
        return `${value.toFixed(1)}%`;
    },

    shortDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    },

    date: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },


    monthYear: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    },

    time: (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    largeNumber: (number) => {
        if (number >= 1000000) {
            return `${(number / 1000000).toFixed(1)}M`;
        } else if (number >= 1000) {
            return `${(number / 1000).toFixed(1)}K`;
        }
        return number.toString();
    }
};