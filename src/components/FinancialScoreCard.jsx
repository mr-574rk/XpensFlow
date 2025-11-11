// src/components/FinancialScoreCard.jsx

import React from 'react';
import { TrendingUp, Award } from 'lucide-react';

export const FinancialScoreCard = ({ score }) => {
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-green-400 to-green-600';
        if (score >= 60) return 'from-blue-400 to-blue-600';
        if (score >= 40) return 'from-yellow-400 to-yellow-600';
        return 'from-red-400 to-red-600';
    };

    const getScoreMessage = (score) => {
        if (score >= 80) return { icon: '🎉', message: 'Excellent! You\'re crushing it!' };
        if (score >= 60) return { icon: '👍', message: 'Good job! Keep it up!' };
        if (score >= 40) return { icon: '💪', message: 'Making progress!' };
        return { icon: '📊', message: 'Let\'s improve together!' };
    };

    const scoreInfo = getScoreMessage(score);

    return (
        <div className={`bg-gradient-to-br ${getScoreGradient(score)} rounded-lg p-6 text-white shadow-lg col-span-1`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Award size={20} />
                    <h3 className="text-lg font-bold">Financial Score</h3>
                </div>
                <span className="text-sm opacity-90">This Month</span>
            </div>

            <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(score)} bg-white rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-4 shadow-inner`}>
                    {score}
                </div>

                <div className="space-y-2">
                    <p className="text-xl font-medium">{scoreInfo.icon}</p>
                    <p className="text-base font-medium">{scoreInfo.message}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                    <div className="flex items-center justify-center gap-2 text-sm opacity-90">
                        <TrendingUp size={16} />
                        <span>Track more to improve</span>
                    </div>
                </div>
            </div>
        </div>
    );
};