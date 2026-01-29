import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

const Analytics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    const churnChartData = [
        { name: 'Jan', retained: 4000, churned: 240 },
        { name: 'Feb', retained: 3000, churned: 139 },
        { name: 'Mar', retained: 2000, churned: 980 },
        { name: 'Apr', retained: 2780, churned: 390 },
        { name: 'May', retained: 1890, churned: 480 },
        { name: 'Jun', retained: 2390, churned: 380 },
    ];

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/churn/analytics');
            const data = await res.json();
            setMetrics(data);
        } catch (err) {
            console.error("Failed to load analytics", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading Real-Time Analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">System Analytics</h2>
                <button
                    onClick={fetchAnalytics}
                    className="text-sm bg-white border border-gray-300 px-3 py-1 rounded shadow-sm hover:bg-gray-50"
                >
                    Refresh Data
                </button>
            </div>

            {/* REAL Metrics from Backend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Avg Churn Risk</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {metrics ? (metrics.avg_churn_rate * 100).toFixed(1) : "-"}%
                    </p>
                    <span className="text-green-600 text-sm font-medium flex items-center mt-1">
                        Based on {metrics?.total_customers} active customers
                    </span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Est. Annual Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        ${metrics ? (metrics.total_revenue_est / 1000000).toFixed(2) : "-"}M
                    </p>
                    <span className="text-gray-400 text-xs mt-1">
                        Projected based on current retention
                    </span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-red-500 text-sm font-medium uppercase">High Risk Segment</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {metrics?.high_risk_count || 0}
                    </p>
                    <span className="text-red-600 text-sm font-medium flex items-center mt-1">
                        Immediate Action Required
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visualizations (Kept Trend Data for visual demo, but we could make this dynamic too) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Retention vs Churn (Trend)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={churnChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="retained" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="churned" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Current Risk Distribution</h3>
                    <div className="h-80 flex items-center justify-center">
                        {/* Simple Distribution Bar */}
                        <div className="w-full space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-red-700">High Risk</span>
                                    <span className="text-sm font-medium text-red-700">{metrics?.high_risk_count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${(metrics?.high_risk_count / metrics?.total_customers) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-yellow-700">Medium Risk</span>
                                    <span className="text-sm font-medium text-yellow-700">{metrics?.medium_risk_count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${(metrics?.medium_risk_count / metrics?.total_customers) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-green-700">Low Risk</span>
                                    <span className="text-sm font-medium text-green-700">{metrics?.low_risk_count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(metrics?.low_risk_count / metrics?.total_customers) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
