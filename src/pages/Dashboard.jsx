// src/pages/Dashboard.jsx - \
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react';
import { FinancialScoreCard } from '../components/FinancialScoreCard';
import { BudgetCard } from '../components/BudgetCard';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { InsightsDashboard } from '../components/InsightsDashboard';
import { CATEGORIES } from '../utils/constants';
import { formatters } from '../utils/formatters';
import { useApp } from '../context/useApp'; // Import the hook

export const Dashboard = ({ transactions, budgets, calculateFinancialScore }) => {
    const [showInsights, setShowInsights] = useState(false);
    const { currency } = useApp(); // Get currency from context

    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    const monthTransactions = transactions.filter(t => t?.date && t.date.startsWith(thisMonth));
    const lastMonthTransactions = transactions.filter(t => t?.date && t.date.startsWith(lastMonth));

    const totalIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const lastMonthExpense = lastMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const balance = totalIncome - totalExpense;
    const expenseChange = lastMonthExpense > 0
        ? ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100
        : 0;

    const financialScore = calculateFinancialScore();

    // Top spending categories
    const categorySpending = CATEGORIES.map(cat => {
        const spent = monthTransactions
            .filter(t => t?.category === cat.name && t?.type === 'expense')
            .reduce((sum, t) => sum + (t?.amount || 0), 0);
        return { ...cat, spent };
    })
        .filter(c => c.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Page Header with Insights Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Your financial overview ({currency})
                    </p>
                </div>
                <button
                    onClick={() => setShowInsights(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
                >
                    <Zap size={20} />
                    <span className="font-medium">Smart Insights</span>
                </button>
            </div>

            {/* Insight Banner */}
            {expenseChange !== 0 && Math.abs(expenseChange) > 5 && (
                <div className={`${expenseChange > 0
                    ? 'bg-orange-50 border-orange-200 dark:bg-orange-900 dark:border-orange-700'
                    : 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700'
                    } border rounded-lg p-4`}>
                    <p className={`text-sm font-medium ${expenseChange > 0
                        ? 'text-orange-800 dark:text-orange-200'
                        : 'text-green-800 dark:text-green-200'
                        }`}>
                        💡 {expenseChange > 0
                            ? `You spent ${formatters.percentage(Math.abs(expenseChange))} more than last month`
                            : `Great! You spent ${formatters.percentage(Math.abs(expenseChange))} less than last month`}
                    </p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-90">Income</span>
                        <TrendingUp size={20} />
                    </div>
                    <div className="text-3xl font-bold">{formatters.currency(totalIncome, currency)}</div>
                    <div className="text-xs mt-2 opacity-80">This month</div>
                </div>

                <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-90">Expenses</span>
                        <TrendingDown size={20} />
                    </div>
                    <div className="text-3xl font-bold">{formatters.currency(totalExpense, currency)}</div>
                    <div className="text-xs mt-2 opacity-80">This month</div>
                </div>

                <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'
                    } rounded-lg p-6 text-white shadow-lg`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-90">Balance</span>
                        <DollarSign size={20} />
                    </div>
                    <div className="text-3xl font-bold">{formatters.currency(Math.abs(balance), currency)}</div>
                    <div className="text-xs mt-2 opacity-80">
                        {balance >= 0 ? 'Positive' : 'Negative'}
                    </div>
                </div>

                <FinancialScoreCard score={financialScore} currency={currency} />
            </div>

            {/* Budget Status */}
            {Object.keys(budgets).length > 0 && (
                <div>
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Budget Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(budgets)
                            .filter(([_, limit]) => limit > 0)
                            .map(([category, limit]) => {
                                const spent = monthTransactions
                                    .filter(t => t.category === category && t.type === 'expense')
                                    .reduce((sum, t) => sum + (t.amount || 0), 0);
                                const categoryInfo = CATEGORIES.find(c => c.name === category);

                                return (
                                    <BudgetCard
                                        key={category}
                                        category={category}
                                        limit={limit}
                                        spent={spent}
                                        icon={categoryInfo?.icon || '📌'}
                                        currency={currency}
                                    />
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Top Spending Categories */}
            {categorySpending.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Top Spending Categories</h3>
                    <div className="space-y-3">
                        {categorySpending.map((cat, index) => (
                            <div key={cat.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800">
                                        <span className="text-2xl">{cat.icon}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium dark:text-white">{cat.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatters.percentage((cat.spent / totalExpense) * 100)} of total
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg dark:text-white">
                                        {formatters.currency(cat.spent, currency)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        #{index + 1}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics Dashboard */}
            <AnalyticsDashboard transactions={transactions} currency={currency} />

            {/* Insights Modal */}
            {showInsights && (
                <InsightsDashboard
                    transactions={transactions}
                    budgets={budgets}
                    onClose={() => setShowInsights(false)}
                    currency={currency}
                />
            )}
        </div>
    );
};