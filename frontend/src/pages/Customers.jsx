import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, User, Eye, Download } from 'lucide-react';

const Customers = ({ onSelectCustomer }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [totalCount, setTotalCount] = useState(0);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = () => {
        setDebouncedSearch(search);
        setPage(1);
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, debouncedSearch]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page,
                limit: 100, // Default to 100 as requested
                search: debouncedSearch
            });

            const res = await fetch(`http://localhost:8000/api/churn/customers?${query}`);
            const data = await res.json();

            if (data.data) {
                setCustomers(data.data);
                setTotalCount(data.total);
                setTotalPages(Math.ceil(data.total / 100));
            } else {
                setCustomers([]);
                console.warn("Unexpected API response:", data);
            }
        } catch (err) {
            console.error("Failed to fetch customers", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Customer Database</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                        {totalCount.toLocaleString()}
                    </span>
                </div>

                <div className="flex w-full md:w-auto space-x-3">
                    <div className="relative flex-1 md:w-80">
                        <input
                            type="text"
                            placeholder="Search by ID (e.g. FM_CUST_123)..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset to page 1 on search
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-2 text-xs text-gray-500 font-medium uppercase tracking-wider">Loading Records...</p>
                        </div>
                    </div>
                )}

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-0 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Lifetime Value</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Churn Risk</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.length > 0 ? (
                            customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-blue-600 font-mono">
                                        {customer.id}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {customer.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                                        ${customer.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-bold rounded-full ${customer.risk === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                                            customer.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                'bg-green-100 text-green-700 border border-green-200'
                                            }`}>
                                            {customer.risk.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                            title="View Analysis"
                                            onClick={() => window.open(`http://localhost:5173/?customer_id=${customer.id}`, '_blank')}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <User className="h-12 w-12 text-gray-300 mb-3" />
                                        <p>No customers found matching "{debouncedSearch}"</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Sticky Pagination Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{Math.min((page - 1) * 100 + 1, totalCount)}</span> to <span className="font-medium">{Math.min(page * 100, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                </p>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Customers;
