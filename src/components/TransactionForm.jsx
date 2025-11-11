import React, { useState } from 'react';
import { X, Mic } from 'lucide-react';
import { CATEGORIES, PAYMENT_TYPES } from '../utils/constants';
import { validators } from '../utils/validators';
import { useVoiceInput } from '../hooks/useVoiceInput';

export const TransactionForm = ({ onClose, onSubmit, showToast }) => {
    const { isListening, startListening } = useVoiceInput();
    const [formData, setFormData] = useState({
        type: 'expense',
        category: CATEGORIES[0].name,
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentType: 'cash'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVoiceInput = () => {
        startListening((parsed) => {
            if (parsed) {
                setFormData(prev => ({
                    ...prev,
                    amount: parsed.amount.toString(),
                    description: parsed.description
                }));
                showToast?.('Voice input captured!', 'success');
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validators.isValidAmount(formData.amount)) {
            showToast?.('Please enter a valid amount', 'error');
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const transaction = {
                ...formData,
                amount: parseFloat(formData.amount),
                timestamp: new Date().toISOString(),
                id: Date.now() // Temporary ID, will be replaced by DB
            };

            const result = await onSubmit(transaction);

            if (result && result.success) {
                showToast?.('Transaction added successfully', 'success');
                onClose();
            } else {
                showToast?.('Failed to add transaction: ' + (result?.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Transaction submission error:', error);
            showToast?.('Failed to add transaction', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative animate-scale-in max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    disabled={isSubmitting}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 dark:text-white">Add Transaction</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Selection */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium dark:text-gray-300">Type</label>
                            <button
                                type="button"
                                onClick={handleVoiceInput}
                                disabled={isSubmitting}
                                className={`p-2 rounded-full transition ${isListening
                                    ? 'bg-red-500 animate-pulse'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                    } text-white disabled:opacity-50`}
                                title="Voice input"
                            >
                                <Mic size={20} />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleChange('type', 'expense')}
                                disabled={isSubmitting}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${formData.type === 'expense'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    } disabled:opacity-50`}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => handleChange('type', 'income')}
                                disabled={isSubmitting}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${formData.type === 'income'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    } disabled:opacity-50`}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.name} value={cat.name}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => handleChange('amount', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                            placeholder="0.00"
                            required
                            min="0.01"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Description
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                            placeholder="Optional notes"
                            maxLength={100}
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                            required
                        />
                    </div>

                    {/* Payment Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Payment Type
                        </label>
                        <select
                            value={formData.paymentType}
                            onChange={(e) => handleChange('paymentType', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        >
                            {PAYMENT_TYPES.map(pt => (
                                <option key={pt.value} value={pt.value}>
                                    {pt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Adding...
                            </>
                        ) : (
                            'Add Transaction'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};