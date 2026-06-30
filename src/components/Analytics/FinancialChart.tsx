"use client";

import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';



interface FinancialData {
    name: string;
    income: number;
    expense: number;
}

export default function FinancialChart() {
    const [isMounted, setIsMounted] = useState(false);
    const [liveData, setLiveData] = useState<FinancialData[]>([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
        fetch('/api/analytics/revenue')
            .then(res => res.json())
            .then((apiData: FinancialData[]) => setLiveData(apiData))
            .catch(err => console.error("Failed to fetch analytics:", err));
    }, []);

    if (!isMounted || liveData.length === 0) {
        return (
            <div className="w-full h-[300px] flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-emerald-500"></div>
                <p className="font-black text-[10px] uppercase tracking-widest">Loading chart data...</p>
            </div>
        );
    }

    const chartDisplayData = liveData;

    return (
        <div className="w-full h-80 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height={300} debounce={100}>
                <AreaChart
                    data={chartDisplayData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff4d1c" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ff4d1c" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        tick={{ fontSize: 10, fontWeight: 700 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 10, fontWeight: 700 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: '#0a0a0f', 
                            borderColor: 'rgba(255,255,255,0.1)', 
                            borderRadius: '12px', 
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#ff4d1c"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        name="Gains"
                        animationDuration={1500}
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                        name="Expenses"
                        strokeDasharray="5 5"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
