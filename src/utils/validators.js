import { CATEGORIES } from './constants';

export const validators = {
  isValidAmount: (amount) => {
    return !isNaN(amount) && parseFloat(amount) > 0;
  },
  
  isValidDate: (date) => {
    return !isNaN(Date.parse(date));
  },
  
  isValidCategory: (category) => {
    return CATEGORIES.some(c => c.name === category);
  },
  
  isValidType: (type) => {
    return ['income', 'expense'].includes(type);
  },
  
  isValidPassphrase: (passphrase) => {
    return passphrase && passphrase.length >= 6;
  },
  
  isValidTransaction: (transaction) => {
    return (
      transaction &&
      validators.isValidAmount(transaction.amount) &&
      validators.isValidDate(transaction.date) &&
      validators.isValidCategory(transaction.category) &&
      validators.isValidType(transaction.type)
    );
  }
};