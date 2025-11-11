import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { CATEGORIES } from '../utils/constants';
import { X } from 'lucide-react';

// Transactions List
export const Transactions = () => {
    const { transactions, deleteTransaction } = useApp();
    const [filter, setFilter] = useState('all');

    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    const filteredTransactions = filter === 'all'
        ? sortedTransactions
        : sortedTransactions.filter(t => t.type === filter);

    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                {['all', 'income', 'expense'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === f
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
                        No transactions yet. Add your first one!
                    </div>
                ) : (
                    filteredTransactions.map(transaction => {
                        const category = CATEGORIES.find(c => c.name === transaction.category);
                        return (
                            <div
                                key={transaction.id}
                                className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{category?.icon || '📌'}</div>
                                    <div>
                                        <div className="font-medium">{transaction.category}</div>
                                        <div className="text-sm text-gray-500">
                                            {transaction.description || 'No description'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(transaction.date).toLocaleDateString()} • {transaction.paymentType}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => deleteTransaction(transaction.id)}
                                        className="text-red-400 hover:text-red-600 transition"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};