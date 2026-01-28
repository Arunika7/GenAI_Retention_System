import React, { useState, useMemo, useEffect } from 'react';
import { fetchAllCustomers } from '../services/api';

const Customers = ({ onSelectCustomer }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [displayLimit] = useState(15); // Display only 15 records at a time

    // Fetch customers from API on component mount
    useEffect(() => {
        const loadCustomers = async () => {
            try {
                setLoading(true);
                // Fetch all customers - the backend has ~12k records
                const response = await fetchAllCustomers(0, 15000); // Fetch up to 15k to ensure we get all
                setCustomers(response.customers);
                setTotalRecords(response.total);
                setError(null);
            } catch (err) {
                console.error('Failed to load customers:', err);
                setError('Failed to load customer data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadCustomers();
    }, []);

    // Filtered customers using useMemo for performance
    const filteredCustomers = useMemo(() => {
        let filtered = customers;

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            
            filtered = customers.filter(customer => {
                // Search across multiple fields
                return (
                    (customer.customer_id && customer.customer_id.toLowerCase().includes(searchLower)) ||
                    (customer.primary_category && customer.primary_category.toLowerCase().includes(searchLower)) ||
                    (customer.discount_sensitivity && customer.discount_sensitivity.toLowerCase().includes(searchLower)) ||
                    (customer.location && customer.location.toLowerCase().includes(searchLower))
                );
            });
        }

        // Return only first 15 for display
        return filtered.slice(0, displayLimit);
    }, [searchTerm, customers, displayLimit]);

    // Calculate churn risk based on customer data
    const calculateRisk = (customer) => {
        const daysSince = customer.days_since_last_purchase || 0;
        if (daysSince > 30) return 'High';
        if (daysSince > 15) return 'Medium';
        return 'Low';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading customers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12">
                <div className="flex flex-col items-center justify-center text-red-600">
                    <svg className="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Customer Database</h3>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                        Export CSV
                    </button>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by customer ID, category, discount sensitivity, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                
                {/* Results count */}
                {searchTerm && (
                    <p className="mt-2 text-sm text-gray-600">
                        Found {customers.filter(customer => {
                            const searchLower = searchTerm.toLowerCase();
                            return (
                                (customer.customer_id && customer.customer_id.toLowerCase().includes(searchLower)) ||
                                (customer.primary_category && customer.primary_category.toLowerCase().includes(searchLower)) ||
                                (customer.discount_sensitivity && customer.discount_sensitivity.toLowerCase().includes(searchLower)) ||
                                (customer.location && customer.location.toLowerCase().includes(searchLower))
                            );
                        }).length} {customers.filter(customer => {
                            const searchLower = searchTerm.toLowerCase();
                            return (
                                (customer.customer_id && customer.customer_id.toLowerCase().includes(searchLower)) ||
                                (customer.primary_category && customer.primary_category.toLowerCase().includes(searchLower)) ||
                                (customer.discount_sensitivity && customer.discount_sensitivity.toLowerCase().includes(searchLower)) ||
                                (customer.location && customer.location.toLowerCase().includes(searchLower))
                            );
                        }).length === 1 ? 'result' : 'results'} (showing first {displayLimit})
                    </p>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demographics</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Sensitivity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Churn Risk</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.customer_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customer_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.gender || 'N/A'} ({customer.age || 'N/A'})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.primary_category || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.location || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            customer.discount_sensitivity === 'High' ? 'bg-purple-100 text-purple-800' :
                                            customer.discount_sensitivity === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {customer.discount_sensitivity || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${customer.avg_order_value ? customer.avg_order_value.toFixed(2) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            calculateRisk(customer) === 'High' ? 'bg-red-100 text-red-800' :
                                            calculateRisk(customer) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {calculateRisk(customer)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <svg className="h-12 w-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm font-medium">No results found</p>
                                        <p className="text-xs mt-1">Try adjusting your search terms</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {filteredCustomers.length} of {totalRecords.toLocaleString()} total records (displaying up to {displayLimit} at a time)
                </p>
            </div>
        </div>
    );
};

export default Customers;
