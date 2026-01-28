import React from 'react';

const RecommendationsPanel = ({ recommended_actions }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col transition-colors duration-200">
            <div className="flex items-center mb-5">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recommended Actions</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">AI Generated Strategy</p>
                </div>
            </div>

            {recommended_actions && recommended_actions.length > 0 ? (
                <div className="space-y-3 flex-grow">
                    {recommended_actions.map((action, idx) => (
                        <div key={idx} className="group flex items-start p-4 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/50 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200">
                            <span className="flex-shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center bg-blue-600 rounded-full text-white text-xs font-bold mr-3">
                                {idx + 1}
                            </span>
                            <span className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-relaxed group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                                {action}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No specific actions recommended at this time.</p>
                </div>
            )}
        </div>
    );
};

export default RecommendationsPanel;
