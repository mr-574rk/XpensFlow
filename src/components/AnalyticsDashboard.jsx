// src/components/AnalyticsDashboard.jsx 
import React, { useState, useEffect, useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import { formatters } from '../utils/formatters';

// Chart skeleton component
const ChartSkeleton = ({ height = 300 }) => (
    <div
        className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
        style={{ height: `${height}px` }}
    ></div>
);

// Memoized chart components to prevent unnecessary re-renders
const CategoryPieChart = React.memo(({ categoryData, totalExpense }) => {
    if (!categoryData.length) return null;

    const topCategories = [...categoryData]
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatters.currency(value)} />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-2">
                {topCategories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-sm dark:text-white">{cat.icon} {cat.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold dark:text-white">
                                {formatters.currency(cat.value)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatters.percentage((cat.value / totalExpense) * 100)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

const TrendLineChart = React.memo(({ trendData }) => {
    if (!trendData.some(day => day.income > 0 || day.expense > 0)) return null;

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                    formatter={(value) => formatters.currency(value)}
                    contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                />
                <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
});

const MonthlyBarChart = React.memo(({ monthlyData }) => {
    if (!monthlyData.some(month => month.income > 0 || month.expense > 0)) return null;

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                    formatter={(value) => formatters.currency(value)}
                    contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                    }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
});

export const AnalyticsDashboard = ({ transactions }) => {
    const [shouldRenderCharts, setShouldRenderCharts] = useState(false);

    // Defer chart rendering for better performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRenderCharts(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Memoized data calculations - THIS IS THE KEY PERFORMANCE OPTIMIZATION
    const { categoryData, trendData, monthlyData, totalExpense } = useMemo(() => {
        // Safe filtering with null checks
        const thisMonth = new Date().toISOString().slice(0, 7);
        const monthTransactions = transactions.filter(t => t?.date && t.date.startsWith(thisMonth));

        // Category breakdown with safe calculations
        const categoryData = CATEGORIES.map(cat => {
            const total = monthTransactions
                .filter(t => t?.category === cat.name && t?.type === 'expense')
                .reduce((sum, t) => sum + (t?.amount || 0), 0);
            return {
                name: cat.name,
                value: total,
                color: cat.color,
                icon: cat.icon
            };
        }).filter(c => c.value > 0);

        // Daily trends (last 7 days) with safe filtering
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const trendData = last7Days.map(date => {
            const dayTransactions = transactions.filter(t => t?.date === date);
            return {
                date: formatters.shortDate(date),
                income: dayTransactions
                    .filter(t => t?.type === 'income')
                    .reduce((sum, t) => sum + (t?.amount || 0), 0),
                expense: dayTransactions
                    .filter(t => t?.type === 'expense')
                    .reduce((sum, t) => sum + (t?.amount || 0), 0)
            };
        });

        // Monthly comparison (last 6 months) with safe filtering
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return d.toISOString().slice(0, 7);
        });

        const monthlyData = last6Months.map(month => {
            const monthTrans = transactions.filter(t => t?.date && t.date.startsWith(month));
            return {
                month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
                income: monthTrans
                    .filter(t => t?.type === 'income')
                    .reduce((sum, t) => sum + (t?.amount || 0), 0),
                expense: monthTrans
                    .filter(t => t?.type === 'expense')
                    .reduce((sum, t) => sum + (t?.amount || 0), 0)
            };
        });

        const totalExpense = categoryData.reduce((sum, cat) => sum + cat.value, 0);

        return { categoryData, trendData, monthlyData, totalExpense };
    }, [transactions]);

    const hasExpenseData = categoryData.length > 0;
    const hasTrendData = trendData.some(day => day.income > 0 || day.expense > 0);
    const hasMonthlyData = monthlyData.some(month => month.income > 0 || month.expense > 0);

    return (
        <div className="space-y-6">
            {/* Category Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                    <TrendingDown size={20} className="text-red-500" />
                    Expenses by Category
                </h3>
                {hasExpenseData ? (
                    shouldRenderCharts ? (
                        <CategoryPieChart categoryData={categoryData} totalExpense={totalExpense} />
                    ) : (
                        <ChartSkeleton height={300} />
                    )
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        No expense data for this month
                    </div>
                )}
            </div>

            {/* 7-Day Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500" />
                    Last 7 Days Trend
                </h3>
                {hasTrendData ? (
                    shouldRenderCharts ? (
                        <TrendLineChart trendData={trendData} />
                    ) : (
                        <ChartSkeleton height={300} />
                    )
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        No transaction data for the last 7 days
                    </div>
                )}
            </div>

            {/* 6-Month Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white">6-Month Overview</h3>
                {hasMonthlyData ? (
                    shouldRenderCharts ? (
                        <MonthlyBarChart monthlyData={monthlyData} />
                    ) : (
                        <ChartSkeleton height={300} />
                    )
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        No transaction data for the last 6 months
                    </div>
                )}
            </div>
        </div>
    );
};