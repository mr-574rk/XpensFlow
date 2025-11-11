// src/components/InsightsDashboard.jsx

import React, { useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Info,
    Zap,
    Target,
    Award,
    X
} from 'lucide-react';
import { intelligenceEngine } from '../core/IntelligenceEngine';

export const InsightsDashboard = ({ transactions, budgets, onClose }) => {
    const insights = useMemo(() => {
        return intelligenceEngine.analyzeSpending(transactions, budgets);
    }, [transactions, budgets]);

    const summary = useMemo(() => {
        return intelligenceEngine.generateRuleBasedSummary(insights);
    }, [insights]);

    const spendingRhythm = useMemo(() => {
        return intelligenceEngine.getSpendingRhythm(transactions);
    }, [transactions]);

    const categoryInsights = useMemo(() => {
        return intelligenceEngine.getCategoryInsights(transactions);
    }, [transactions]);

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle className="text-red-500" size={20} />;
            case 'warning':
                return <Info className="text-yellow-500" size={20} />;
            case 'positive':
                return <CheckCircle className="text-green-500" size={20} />;
            default:
                return <Info className="text-blue-500" size={20} />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700';
            case 'positive':
                return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700';
            default:
                return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700';
        }
    };

    const topInsights = insights.slice(0, 6);
    const criticalCount = insights.filter(i => i.severity === 'critical').length;
    const positiveCount = insights.filter(i => i.severity === 'positive').length;

    // Handle backdrop click to close
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Handle escape key to close
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto p-4 flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header with close button */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap size={28} className="text-indigo-500" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Insights</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Close insights"
                        >
                            <X size={24} className="text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                        <p className="text-lg opacity-90 mb-4">{summary}</p>
                        <div className="flex gap-4">
                            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                                <div className="text-sm opacity-80">Total Insights</div>
                                <div className="text-2xl font-bold">{insights.length}</div>
                            </div>
                            {criticalCount > 0 && (
                                <div className="bg-red-500 bg-opacity-30 rounded-lg px-4 py-2">
                                    <div className="text-sm opacity-80">Critical</div>
                                    <div className="text-2xl font-bold">{criticalCount}</div>
                                </div>
                            )}
                            {positiveCount > 0 && (
                                <div className="bg-green-500 bg-opacity-30 rounded-lg px-4 py-2">
                                    <div className="text-sm opacity-80">Positive</div>
                                    <div className="text-2xl font-bold">{positiveCount}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights Grid */}
                    {topInsights.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topInsights.map((insight, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-4 ${getSeverityColor(insight.severity)} hover:shadow-md transition`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getSeverityIcon(insight.severity)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {insight.message}
                                            </p>
                                            {insight.data && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {insight.data.category && (
                                                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
                                                            {insight.data.category}
                                                        </span>
                                                    )}
                                                    {insight.data.percentage !== undefined && (
                                                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
                                                            {insight.data.percentage.toFixed(1)}%
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                            <Award className="mx-auto text-gray-400 mb-3" size={48} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                No Insights Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Add more transactions to get personalized insights
                            </p>
                        </div>
                    )}

                    {/* Spending Rhythm */}
                    {spendingRhythm && spendingRhythm.byDay.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="text-purple-500" size={20} />
                                <h3 className="text-lg font-bold dark:text-white">Spending Pattern</h3>
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {spendingRhythm.byDay.map((day, index) => {
                                    const maxAmount = Math.max(...spendingRhythm.byDay.map(d => d.amount));
                                    const heightPercent = (day.amount / maxAmount) * 100;
                                    const isMax = day.amount === maxAmount;
                                    const isMin = day.amount === Math.min(...spendingRhythm.byDay.map(d => d.amount));

                                    return (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                {day.day}
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg h-32 flex items-end overflow-hidden">
                                                <div
                                                    className={`w-full rounded-t-lg transition-all ${isMax
                                                        ? 'bg-red-500'
                                                        : isMin
                                                            ? 'bg-green-500'
                                                            : 'bg-blue-500'
                                                        }`}
                                                    style={{ height: `${Math.max(heightPercent, 10)}%` }}
                                                />
                                            </div>
                                            <div className="text-xs font-medium mt-2 dark:text-white">
                                                ${day.amount.toFixed(0)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Most: {spendingRhythm.mostExpensiveDay?.day}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Least: {spendingRhythm.leastExpensiveDay?.day}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category Breakdown */}
                    {Object.keys(categoryInsights).length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-4 dark:text-white">
                                Category Analysis
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(categoryInsights)
                                    .sort(([, a], [, b]) => b.total - a.total)
                                    .slice(0, 5)
                                    .map(([category, data]) => (
                                        <div key={category}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium dark:text-white">{category}</span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {data.count} transactions
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${(data.total / Object.values(categoryInsights).reduce((sum, c) => sum + c.total, 0)) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold dark:text-white min-w-[80px] text-right">
                                                    ${data.total.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Avg: ${data.avg.toFixed(2)} per transaction
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};