import React from 'react';

export const BudgetCard = ({ category, limit, spent, icon }) => {
    const remaining = limit - spent;
    const percentage = Math.min((spent / limit) * 100, 100);
    const isOverBudget = spent > limit;

    const getProgressColor = () => {
        if (isOverBudget) return 'bg-red-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusText = () => {
        if (isOverBudget) return 'Over Budget';
        if (remaining <= 0) return 'Budget Used';
        return `${remaining.toLocaleString()} left`;
    };

    const getStatusColor = () => {
        if (isOverBudget) return 'text-red-600 dark:text-red-400';
        if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {category}
                    </h4>
                </div>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Spent: {spent.toLocaleString()}</span>
                    <span>Limit: {limit.toLocaleString()}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {percentage.toFixed(1)}% used
                </div>
            </div>
        </div>
    );
};