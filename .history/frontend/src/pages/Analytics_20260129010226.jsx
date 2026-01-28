import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';

const Analytics = () => {
    const churnData = [
        { name: 'Jan', retained: 4000, churned: 240 },
        { name: 'Feb', retained: 3000, churned: 139 },
        { name: 'Mar', retained: 2000, churned: 980 },
        { name: 'Apr', retained: 2780, churned: 390 },
        { name: 'May', retained: 1890, churned: 480 },
        { name: 'Jun', retained: 2390, churned: 380 },
    ];

    const revenueData = [
        { name: 'Jan', value: 2400 },
        { name: 'Feb', value: 1398 },
        { name: 'Mar', value: 9800 },
        { name: 'Apr', value: 3908 },
        { name: 'May', value: 4800 },
        { name: 'Jun', value: 3800 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Cards */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Avg Churn Rate</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">12.4%</p>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center mt-1">
                        ↓ 2.1% <span className="text-gray-400 dark:text-gray-500 ml-1">vs last month</span>
                    </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">$1.2M</p>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center mt-1">
                        ↑ 8.4% <span className="text-gray-400 dark:text-gray-500 ml-1">vs last month</span>
                    </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">At-Risk Customers</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">843</p>
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center mt-1">
                        ↑ 143 <span className="text-gray-400 dark:text-gray-500 ml-1">new this week</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Churn Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Retention vs Churn</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={churnData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="retained" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="churned" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Revenue Impact</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
