export const formatters = {
    currency: (amount, currency = '$') => {
        return `${currency}${Math.abs(amount).toFixed(2)}`;
    },

    date: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    shortDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    },

    percentage: (value) => {
        return `${value.toFixed(1)}%`;
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