"use client";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';

const data = [
    { name: '1', income: 400, expense: 240 },
    { name: '5', income: 300, expense: 139 },
    { name: '10', income: 500, expense: 300 },
    { name: '15', income: 450, expense: 200 },
    { name: '20', income: 600, expense: 400 },
    { name: '25', income: 700, expense: 500 },
    { name: '30', income: 800, expense: 450 },
];

export default function FinancialChart() {
    const [isMounted, setIsMounted] = useState(false);
    const [liveData, setLiveData] = useState<any[]>([]);

    useEffect(() => {
        setIsMounted(true);
        fetch('/api/analytics/revenue')
            .then(res => res.json())
            .then(apiData => setLiveData(apiData))
            .catch(err => console.error("Failed to fetch analytics:", err));
    }, []);

    if (!isMounted || liveData.length === 0) {
        return (
            <div className="w-full h-[300px] flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <p className="font-black text-[10px] uppercase tracking-widest">Syncing with Ledger...</p>
            </div>
        );
    }

    const chartDisplayData = liveData;

    return (
        <div style={{ width: '100%', height: 300 }} className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart
                    data={chartDisplayData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#007BFF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#0f172a"
                        tick={{ fontSize: 12, fontWeight: 800 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#0f172a"
                        tick={{ fontSize: 12, fontWeight: 800 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#007BFF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        name="Gains"
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                        name="Expenses"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
