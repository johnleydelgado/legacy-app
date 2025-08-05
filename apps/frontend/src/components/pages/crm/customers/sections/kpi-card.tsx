'use client';

import * as React from 'react';
import {ArrowDown, ArrowUp} from "lucide-react";

const KpiCard = (
    {
        title,
        value,
        percentage,
        icon: Icon
    }: {
        title: string;
        value: number;
        percentage: number;
        icon: any
}) => (
    <div 
        className="bg-white border border-gray-200 transition-all hover:shadow-md"
        style={{
            borderRadius: '14px', // xl radius from design guide
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // shadow-sm
            padding: '24px' // space-6
        }}
    >
        <div className="flex items-center gap-4 mb-4">
            <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#67A3F0' }}
            >
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
        <div 
            className="font-bold leading-none mb-2"
            style={{ 
                fontSize: '30px', // text-3xl
                color: '#000000' // brand black
            }}
        >
            {value.toLocaleString()}
        </div>
        <div 
            className="text-sm font-medium mb-2"
            style={{ color: '#6C757D' }} // brand muted gray
        >
            {title}
        </div>
        <div className="flex items-center">
            {percentage > 0 ? (
                <div className="flex items-center" style={{ color: '#22c55e' }}>
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{percentage}%</span>
                </div>
            ) : percentage < 0 ? (
                <div className="flex items-center" style={{ color: '#ef4444' }}>
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{Math.abs(percentage)}%</span>
                </div>
            ) : (
                <div className="flex items-center" style={{ color: '#6b7280' }}>
                    <span className="text-sm font-medium">0%</span>
                </div>
            )}
            <span 
                className="text-xs ml-2"
                style={{ color: '#6C757D' }} // brand muted gray
            >
                from previous period
            </span>
        </div>
    </div>
);

export default KpiCard;
