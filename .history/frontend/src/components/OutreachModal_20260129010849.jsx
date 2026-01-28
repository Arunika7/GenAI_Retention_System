import React from 'react';

const OutreachModal = ({ isOpen, onClose, outreachData, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/20">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">GenAI Outreach Studio</h2>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider mt-0.5">Personalized retention draft</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="h-10 w-10 border-4 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Groq is drafting your message...</p>
                        </div>
                    ) : outreachData ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Subject Line</label>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-medium">
                                    {outreachData.subject_line}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Message Body</label>
                                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 leading-relaxed min-h-[200px] whitespace-pre-wrap">
                                    {outreachData.message_body}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <span>Optimized for: <strong>{outreachData.channel_optimized || 'Email'}</strong></span>
                                <span className="flex items-center">
                                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                    AI Generated Concept
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">No content generated.</p>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Dismiss
                    </button>
                    <button
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        onClick={() => {
                            navigator.clipboard.writeText(`Subject: ${outreachData?.subject_line}\n\n${outreachData?.message_body}`);
                            alert('Copied to clipboard!');
                        }}
                    >
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OutreachModal;
