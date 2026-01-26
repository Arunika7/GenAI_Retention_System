import React from 'react';

const Customers = () => {
    const customers = [
        { id: 'CUST-001', name: 'Alice Johnson', category: 'Grocery', spend: 4500, risk: 'Low' },
        { id: 'CUST-002', name: 'Bob Smith', category: 'Electronics', spend: 1200, risk: 'High' },
        { id: 'CUST-003', name: 'Charlie Brown', category: 'Household', spend: 890, risk: 'Medium' },
        { id: 'CUST-004', name: 'Diana Prince', category: 'Beauty', spend: 3200, risk: 'Low' },
        { id: 'CUST-005', name: 'Evan Wright', category: 'Grocery', spend: 150, risk: 'High' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Customer Database</h3>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                    Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Churn Risk</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.spend.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.risk === 'High' ? 'bg-red-100 text-red-800' :
                                            customer.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {customer.risk}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">Showing 5 of 12,403 records</p>
            </div>
        </div>
    );
};

export default Customers;
