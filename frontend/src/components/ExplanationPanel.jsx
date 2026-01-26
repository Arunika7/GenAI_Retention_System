import React from 'react';

const ExplanationPanel = ({ summary, key_factors }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Analysis</h3>

            {/* Executive Summary */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Executive Summary</h4>
                <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {summary || "No specific analysis available for this profile."}
                </p>
            </div>

            {/* Key Drivers */}
            <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Key Risk Factors</h4>
                {key_factors && key_factors.length > 0 ? (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <ul className="space-y-2">
                            {key_factors.map((factor, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-red-400 rounded-full mr-2"></span>
                                    <span className="text-gray-800 text-sm">{factor}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                        No specific risk factors flagged.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ExplanationPanel;
