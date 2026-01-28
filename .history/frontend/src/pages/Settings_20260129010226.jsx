import React from 'react';

const Settings = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">System Settings</h3>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Model Configuration</h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">GenAI Inference Engine</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Currently using GPT-4o optimized model</p>
                                </div>
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Retraining Frequency</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Automated weekly updates</p>
                                </div>
                                <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">Edit</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Notifications</h4>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input type="checkbox" checked className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700" readOnly />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email alerts for High Risk churn</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Weekly digest reports</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
