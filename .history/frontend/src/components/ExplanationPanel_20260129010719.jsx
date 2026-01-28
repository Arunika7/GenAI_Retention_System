import React from 'react';

const ExplanationPanel = ({ summary, key_factors }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Risk Analysis</h3>

            {/* Executive Summary */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                    {summary || "No specific analysis available for this profile."}
                </p>
            </div>

            {/* Key Drivers */}
            <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Key Risk Factors</h4>
                {key_factors && key_factors.length > 0 ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
                        <ul className="space-y-2">
                            {key_factors.map((factor, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-red-400 dark:bg-red-500 rounded-full mr-2"></span>
                                    <span className="text-gray-800 dark:text-gray-200 text-sm">{factor}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 border-dashed">
                        No specific risk factors flagged.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ExplanationPanel;
