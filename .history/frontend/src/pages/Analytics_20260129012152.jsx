import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { fetchAnalytics } from '../services/api';
import { TrendingDown, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAnalytics();
            setAnalyticsData(data);
        } catch (err) {
            setError('Failed to load analytics data. Please try again.');
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Transform risk distribution for charts
    const riskChartData = analyticsData ? [
        { name: 'Low Risk', value: analyticsData.risk_distribution.Low, color: '#10b981' },
        { name: 'Medium Risk', value: analyticsData.risk_distribution.Medium, color: '#f59e0b' },
        { name: 'High Risk', value: analyticsData.risk_distribution.High, color: '#ef4444' }
    ] : [];

    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    // Monthly trend data (static for now - could be enhanced later)
    const churnData = [
        { name: 'Jan', retained: 4000, churned: 240 },
        { name: 'Feb', retained: 3000, churned: 139 },
        { name: 'Mar', retained: 2000, churned: 980 },
        { name: 'Apr', retained: 2780, churned: 390 },
        { name: 'May', retained: 1890, churned: 480 },
        { name: 'Jun', retained: 2390, churned: 380 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-300" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        <button
                            onClick={loadAnalytics}
                            className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Cards */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Avg Churn Probability</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                {analyticsData ? `${(analyticsData.avg_churn_probability * 100).toFixed(1)}%` : 'N/A'}
                            </p>
                        </div>
                        <TrendingDown className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center mt-1">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Real-time data
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Total Customers</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                {analyticsData ? analyticsData.total_customers.toLocaleString() : 'N/A'}
                            </p>
                        </div>
                        <Users className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center mt-1">
                        Active customer base
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">High Risk Customers</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                {analyticsData ? analyticsData.at_risk_customers.toLocaleString() : 'N/A'}
                            </p>
                        </div>
                        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
                    </div>
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Requires attention
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Risk Distribution</h3>
                    <div className="h-80 flex items-center justify-center">
                        {riskChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {riskChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '8px', 
                                            border: 'none', 
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            backgroundColor: 'white'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No data available</p>
                        )}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {analyticsData ? analyticsData.risk_distribution.Low.toLocaleString() : 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Low Risk</p>
                        </div>
                        <div className="text-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {analyticsData ? analyticsData.risk_distribution.Medium.toLocaleString() : 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Medium Risk</p>
                        </div>
                        <div className="text-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {analyticsData ? analyticsData.risk_distribution.High.toLocaleString() : 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">High Risk</p>
                        </div>
                    </div>
                </div>

                {/* Retention vs Churn Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Retention Trend (Last 6 Months)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={churnData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis 
                                    dataKey="name" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    stroke="#9ca3af"
                                />
                                <YAxis 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    stroke="#9ca3af"
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'white'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="retained" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="churned" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data info footer */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Data Source:</strong> Real-time analytics computed from {analyticsData?.sample_size.toLocaleString()} sampled customers 
                    (extrapolated to {analyticsData?.total_customers.toLocaleString()} total customers). 
                    Last updated: {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default Analytics;
