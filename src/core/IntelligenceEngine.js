/* eslint-disable no-unused-vars */
// src/core/IntelligenceEngine.js

import { logger } from '../utils/logger';
import { formatters } from '../utils/formatters';

/**
 * IntelligenceEngine - Smart insights and pattern detection
 * Provides rule-based and optional AI-powered analysis
 */
class IntelligenceEngine {
    constructor() {
        this.aiMode = false; // Toggle for AI features
        this.insightsCache = new Map();
        this.patterns = [];
    }

    /**
     * Analyze spending patterns and generate insights
     */
    analyzeSpending(transactions, budgets) {
        try {
            const insights = [];
            const thisMonth = new Date().toISOString().slice(0, 7);
            const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
                .toISOString()
                .slice(0, 7);

            const currentMonthData = this.aggregateByMonth(transactions, thisMonth);
            const lastMonthData = this.aggregateByMonth(transactions, lastMonth);

            // 1. Month-over-month comparison
            const momInsights = this.compareMonths(currentMonthData, lastMonthData);
            insights.push(...momInsights);

            // 2. Budget compliance
            const budgetInsights = this.analyzeBudgetCompliance(
                currentMonthData,
                budgets
            );
            insights.push(...budgetInsights);

            // 3. Unusual spending detection
            const anomalies = this.detectAnomalies(transactions);
            insights.push(...anomalies);

            // 4. Spending trends
            const trends = this.detectTrends(transactions);
            insights.push(...trends);

            // 5. Savings potential
            const savings = this.calculateSavingsPotential(
                currentMonthData,
                lastMonthData
            );
            insights.push(...savings);

            // Sort by priority
            insights.sort((a, b) => b.priority - a.priority);

            logger.info(`Generated ${insights.length} insights`);
            return insights;
        } catch (error) {
            logger.error('Insight generation failed', error);
            return [];
        }
    }

    /**
     * Aggregate transactions by month
     */
    aggregateByMonth(transactions, month) {
        const filtered = transactions.filter((t) => t.date.startsWith(month));

        const income = filtered
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = filtered
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const byCategory = filtered.reduce((acc, t) => {
            if (t.type === 'expense') {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
            }
            return acc;
        }, {});

        return {
            income,
            expenses,
            balance: income - expenses,
            byCategory,
            count: filtered.length
        };
    }

    /**
     * Compare current month with previous month
     */
    compareMonths(current, previous) {
        const insights = [];

        // Income comparison
        if (previous.income > 0) {
            const incomeChange = ((current.income - previous.income) / previous.income) * 100;

            if (Math.abs(incomeChange) > 10) {
                insights.push({
                    type: 'income_change',
                    severity: incomeChange > 0 ? 'positive' : 'warning',
                    priority: 8,
                    title: incomeChange > 0 ? '📈 Income Increased' : '📉 Income Decreased',
                    message: `Your income ${incomeChange > 0 ? 'increased' : 'decreased'} by ${formatters.percentage(Math.abs(incomeChange))} compared to last month.`,
                    data: { change: incomeChange, current: current.income, previous: previous.income }
                });
            }
        }

        // Expense comparison
        if (previous.expenses > 0) {
            const expenseChange = ((current.expenses - previous.expenses) / previous.expenses) * 100;

            if (Math.abs(expenseChange) > 5) {
                insights.push({
                    type: 'expense_change',
                    severity: expenseChange < 0 ? 'positive' : 'warning',
                    priority: 9,
                    title: expenseChange < 0 ? '🎉 Spending Reduced' : '⚠️ Spending Increased',
                    message: `You spent ${formatters.percentage(Math.abs(expenseChange))} ${expenseChange > 0 ? 'more' : 'less'} than last month. ${expenseChange < 0 ? 'Great job!' : 'Consider reviewing your expenses.'}`,
                    data: { change: expenseChange, current: current.expenses, previous: previous.expenses }
                });
            }
        }

        // Category-wise comparison
        Object.keys(current.byCategory).forEach((category) => {
            const currentAmount = current.byCategory[category];
            const previousAmount = previous.byCategory[category] || 0;

            if (previousAmount > 0) {
                const change = ((currentAmount - previousAmount) / previousAmount) * 100;

                if (Math.abs(change) > 30) {
                    insights.push({
                        type: 'category_change',
                        severity: change > 0 ? 'warning' : 'positive',
                        priority: 6,
                        title: `${category}: ${change > 0 ? 'Increased' : 'Decreased'}`,
                        message: `${category} spending ${change > 0 ? 'increased' : 'decreased'} by ${formatters.percentage(Math.abs(change))}.`,
                        data: { category, change, current: currentAmount, previous: previousAmount }
                    });
                }
            }
        });

        return insights;
    }

    /**
     * Analyze budget compliance
     */
    analyzeBudgetCompliance(monthData, budgets) {
        const insights = [];

        Object.entries(budgets).forEach(([category, limit]) => {
            if (limit === 0) return;

            const spent = monthData.byCategory[category] || 0;
            const percentage = (spent / limit) * 100;

            if (percentage > 100) {
                insights.push({
                    type: 'budget_exceeded',
                    severity: 'critical',
                    priority: 10,
                    title: `🚨 ${category} Budget Exceeded`,
                    message: `You've spent ${formatters.currency(spent)} out of ${formatters.currency(limit)} budget (${formatters.percentage(percentage - 100)} over).`,
                    data: { category, spent, limit, percentage }
                });
            } else if (percentage > 90) {
                insights.push({
                    type: 'budget_warning',
                    severity: 'warning',
                    priority: 8,
                    title: `⚠️ ${category} Budget Almost Reached`,
                    message: `You've used ${formatters.percentage(percentage)} of your ${category} budget. ${formatters.currency(limit - spent)} remaining.`,
                    data: { category, spent, limit, percentage }
                });
            } else if (percentage < 50) {
                insights.push({
                    type: 'budget_on_track',
                    severity: 'positive',
                    priority: 3,
                    title: `✅ ${category} On Track`,
                    message: `Great! You've only used ${formatters.percentage(percentage)} of your ${category} budget.`,
                    data: { category, spent, limit, percentage }
                });
            }
        });

        return insights;
    }

    /**
     * Detect spending anomalies using statistical methods
     */
    detectAnomalies(transactions) {
        const insights = [];

        // Group by category
        const byCategory = transactions.reduce((acc, t) => {
            if (t.type === 'expense') {
                if (!acc[t.category]) acc[t.category] = [];
                acc[t.category].push(t.amount);
            }
            return acc;
        }, {});

        // Detect outliers using z-score
        Object.entries(byCategory).forEach(([category, amounts]) => {
            if (amounts.length < 5) return; // Need enough data

            const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
            const variance =
                amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) /
                amounts.length;
            const stdDev = Math.sqrt(variance);

            amounts.forEach((amount) => {
                const zScore = (amount - mean) / stdDev;

                if (Math.abs(zScore) > 2) {
                    // Outlier detected
                    insights.push({
                        type: 'anomaly',
                        severity: 'info',
                        priority: 5,
                        title: `📊 Unusual ${category} Spending`,
                        message: `Detected an unusual ${category} expense of ${formatters.currency(amount)} (${zScore > 0 ? 'higher' : 'lower'} than usual).`,
                        data: { category, amount, mean, zScore }
                    });
                }
            });
        });

        return insights.slice(0, 3); // Limit to top 3
    }

    /**
     * Detect spending trends
     */
    detectTrends(transactions) {
        const insights = [];

        // Get last 3 months of data
        const months = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toISOString().slice(0, 7));
        }

        const monthlyData = months.map((month) => ({
            month,
            data: this.aggregateByMonth(transactions, month)
        }));

        // Check for consistent increase/decrease
        const expenses = monthlyData.map((m) => m.data.expenses);

        if (expenses[0] > expenses[1] && expenses[1] > expenses[2]) {
            insights.push({
                type: 'trend_increasing',
                severity: 'warning',
                priority: 7,
                title: '📈 Consistent Spending Increase',
                message: 'Your expenses have been increasing for the past 3 months. Consider reviewing your spending habits.',
                data: { expenses }
            });
        } else if (expenses[0] < expenses[1] && expenses[1] < expenses[2]) {
            insights.push({
                type: 'trend_decreasing',
                severity: 'positive',
                priority: 7,
                title: '📉 Excellent Progress!',
                message: 'Your expenses have been decreasing for 3 months straight. Keep it up!',
                data: { expenses }
            });
        }

        return insights;
    }

    /**
     * Calculate savings potential
     */
    calculateSavingsPotential(current, previous) {
        const insights = [];

        if (current.balance < 0) {
            insights.push({
                type: 'negative_balance',
                severity: 'critical',
                priority: 10,
                title: '⚠️ Negative Balance',
                message: `You're spending ${formatters.currency(Math.abs(current.balance))} more than you earn. Consider reducing expenses.`,
                data: { balance: current.balance }
            });
        } else {
            const savingsRate = (current.balance / current.income) * 100;

            if (savingsRate > 20) {
                insights.push({
                    type: 'high_savings',
                    severity: 'positive',
                    priority: 8,
                    title: '💰 Excellent Savings Rate!',
                    message: `You're saving ${formatters.percentage(savingsRate)} of your income. That's fantastic!`,
                    data: { savingsRate, amount: current.balance }
                });
            } else if (savingsRate < 5) {
                insights.push({
                    type: 'low_savings',
                    severity: 'warning',
                    priority: 7,
                    title: '💡 Low Savings Rate',
                    message: `You're only saving ${formatters.percentage(savingsRate)} of your income. Try to increase this to at least 10%.`,
                    data: { savingsRate, amount: current.balance }
                });
            }
        }

        return insights;
    }

    /**
     * Get spending rhythm (best/worst days)
     */
    getSpendingRhythm(transactions) {
        const byDayOfWeek = transactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => {
                const day = new Date(t.date).getDay();
                acc[day] = (acc[day] || 0) + t.amount;
                return acc;
            }, {});

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayData = Object.entries(byDayOfWeek).map(([day, amount]) => ({
            day: days[day],
            amount
        }));

        dayData.sort((a, b) => b.amount - a.amount);

        return {
            mostExpensiveDay: dayData[0],
            leastExpensiveDay: dayData[dayData.length - 1],
            byDay: dayData
        };
    }

    /**
     * Get category insights
     */
    getCategoryInsights(transactions) {
        const categories = transactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = { total: 0, count: 0, avg: 0 };
                }
                acc[t.category].total += t.amount;
                acc[t.category].count++;
                return acc;
            }, {});

        // Calculate averages
        Object.keys(categories).forEach((cat) => {
            categories[cat].avg = categories[cat].total / categories[cat].count;
        });

        return categories;
    }

    /**
     * Generate AI-powered summary (optional)
     */
    async generateAISummary(insights, transactions) {
        if (!this.aiMode) {
            return this.generateRuleBasedSummary(insights);
        }

        // Placeholder for AI integration
        // Could integrate with OpenAI API or local model
        logger.info('AI mode not implemented yet');
        return this.generateRuleBasedSummary(insights);
    }

    /**
     * Generate rule-based summary
     */
    generateRuleBasedSummary(insights) {
        const critical = insights.filter((i) => i.severity === 'critical');
        const warnings = insights.filter((i) => i.severity === 'warning');
        const positive = insights.filter((i) => i.severity === 'positive');

        let summary = '';

        if (critical.length > 0) {
            summary += `⚠️ You have ${critical.length} critical issue${critical.length > 1 ? 's' : ''} that need attention. `;
        }

        if (positive.length > 0) {
            summary += `✅ Great job! ${positive.length} positive trend${positive.length > 1 ? 's' : ''} detected. `;
        }

        if (warnings.length > 0) {
            summary += `💡 ${warnings.length} area${warnings.length > 1 ? 's' : ''} need${warnings.length === 1 ? 's' : ''} improvement.`;
        }

        return summary || 'Your finances are looking good! Keep tracking.';
    }

    /**
     * Enable/disable AI mode
     */
    setAIMode(enabled) {
        this.aiMode = enabled;
        logger.info(`AI mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Clear insights cache
     */
    clearCache() {
        this.insightsCache.clear();
        logger.info('Insights cache cleared');
    }
}

// Singleton instance
export const intelligenceEngine = new IntelligenceEngine();
export default IntelligenceEngine;