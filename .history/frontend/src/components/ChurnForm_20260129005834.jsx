import React, { useState, useEffect } from 'react';
import { fetchCustomer } from '../services/api';
import { Search, Loader2 } from 'lucide-react';

const ChurnForm = ({ onSubmit, initialData }) => {
    const [searchLoading, setSearchLoading] = useState(false);
    
    const defaultFormData = {
        customer_id: '',
        age: 35,
        gender: 'Female',
        location: 'New York',
        tenure_months: 12,
        primary_category: 'Grocery',
        yearly_purchase_count: 12,
        avg_gap_days: 30,
        avg_order_value: 50.0,
        days_since_last_purchase: 10,
        discount_sensitivity: 'Medium',
        online_ratio: 0.5,
    };

    const [formData, setFormData] = useState(defaultFormData);

    // Handle initial data from navigation
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Simulation Presets
    const presets = {
        vipRecovery: {
            customer_id: 'SIM_VIP',
            age: 42,
            gender: 'Male',
            location: 'San Francisco',
            tenure_months: 48,
            primary_category: 'Electronics',
            yearly_purchase_count: 50,
            avg_gap_days: 1,
            avg_order_value: 5000,
            days_since_last_purchase: 2,
            discount_sensitivity: 'Low',
            online_ratio: 0.95,
        },
        standardSave: {
            customer_id: 'SIM_STD',
            age: 38,
            gender: 'Female',
            location: 'Austin',
            tenure_months: 24,
            primary_category: 'Household Essentials',
            yearly_purchase_count: 12,
            avg_gap_days: 10,
            avg_order_value: 1200,
            days_since_last_purchase: 25,
            discount_sensitivity: 'Medium',
            online_ratio: 0.6,
        },
    };

    const applyPreset = (presetKey) => {
        setFormData(presets[presetKey]);
    };

    const handleSearch = async () => {
        if (!formData.customer_id) return;
        setSearchLoading(true);
        try {
            const data = await fetchCustomer(formData.customer_id);
            // Merge fetched data into form
            setFormData(prev => ({
                ...prev,
                ...data
            }));
        } catch (err) {
            alert('Customer not found. Please try a valid ID (e.g., FM_CUST_000001)');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' || type === 'range' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customer_id) return;
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 h-full transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                Customer Behavior Data
                {initialData && (
                    <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        Pre-filled
                    </span>
                )}
            </h2>

            {/* Simulation Presets */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Simulation Presets</label>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => applyPreset('vipRecovery')}
                        className="flex-1 min-w-[160px] px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                        <div className="flex flex-col items-center">
                            <span className="font-semibold">💎 VIP Recovery</span>
                            <span className="text-xs opacity-90 mt-1">High-value customer</span>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => applyPreset('standardSave')}
                        className="flex-1 min-w-[160px] px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <div className="flex flex-col items-center">
                            <span className="font-semibold">🛒 Standard Save</span>
                            <span className="text-xs opacity-90 mt-1">Regular customer</span>
                        </div>
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Click a preset to auto-fill the form with sample data, then customize as needed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Customer ID + Search */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer ID</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="customer_id"
                            value={formData.customer_id}
                            onChange={handleChange}
                            placeholder="e.g., FM_CUST_000001"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={searchLoading || !formData.customer_id}
                            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-md hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 flex items-center transition-colors"
                        >
                            {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            <span className="ml-2">Fetch</span>
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Try IDs like FM_CUST_000001 to FM_CUST_050000</p>
                </div>

                {/* Demographics Read-only Section */}
                {formData.location && (
                    <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-4">
                        <div>
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Age / Gender</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formData.age} / {formData.gender}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formData.location}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tenure</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formData.tenure_months} months</span>
                        </div>
                    </div>
                )}

                {/* Primary Category */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Category</label>
                    <select
                        name="primary_category"
                        value={formData.primary_category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="Grocery">Grocery</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Baby Care">Baby Care</option>
                        <option value="Household Essentials">Household Essentials</option>
                        <option value="Dairy & Bakery">Dairy & Bakery</option>
                        <option value="Snacks & Beverages">Snacks & Beverages</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Seasonal Items">Seasonal Items</option>
                    </select>
                </div>

                {/* Yearly Purchase Count */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yearly Purchases</label>
                    <input
                        type="number"
                        name="yearly_purchase_count"
                        value={formData.yearly_purchase_count}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Avg Gap Days */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Days Between Visits</label>
                    <input
                        type="number"
                        name="avg_gap_days"
                        value={formData.avg_gap_days}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Avg Order Value */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Order Value ($)</label>
                    <input
                        type="number"
                        name="avg_order_value"
                        value={formData.avg_order_value}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Days Since Last Purchase */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Days Since Last Visit</label>
                    <input
                        type="number"
                        name="days_since_last_purchase"
                        value={formData.days_since_last_purchase}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Discount Sensitivity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Sensitivity</label>
                    <div className="flex space-x-4 mt-2">
                        {['Low', 'Medium', 'High'].map((level) => (
                            <label key={level} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="discount_sensitivity"
                                    value={level}
                                    checked={formData.discount_sensitivity === level}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{level}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Online Ratio Slider */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Online Purchase Ratio: {(formData.online_ratio * 100).toFixed(0)}%
                    </label>
                    <input
                        type="range"
                        name="online_ratio"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.online_ratio}
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Mostly In-Store</span>
                        <span>Balanced</span>
                        <span>Mostly Online</span>
                    </div>
                </div>

            </div>

            <div className="mt-8">
                <button
                    type="submit"
                    className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Predict Churn Risk
                </button>
            </div>
        </form>
    );
};

export default ChurnForm;
