// components/pages/crm/quotes/sections/OwnerBreakdownCard.tsx
import React from 'react';
import { User } from 'lucide-react';
import { DashboardOwnerBreakdown } from '@/services/quotes/types';

interface LightOwnerBreakdownCardProps {
    ownerBreakdown: DashboardOwnerBreakdown[];
    loading?: boolean;
}

export const OwnerBreakdownCard: React.FC<LightOwnerBreakdownCardProps> = (
    {
        ownerBreakdown,
        loading = false
    }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse">{}</div>
                <div className="space-y-3">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="flex justify-between items-center py-3 animate-pulse">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3">{}</div>
                                <div className="h-4 bg-gray-200 rounded w-20">{}</div>
                            </div>
                            <div className="text-right">
                                <div className="h-4 bg-gray-200 rounded w-16 mb-1">{}</div>
                                <div className="h-5 bg-gray-200 rounded w-20">{}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Breakdown</h3>
            <div className="space-y-3">
                {ownerBreakdown.map((owner, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mr-3">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{owner.owner}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">{owner.count} quotes</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {formatCurrency(owner.totalValue)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
