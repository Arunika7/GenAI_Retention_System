import React, { useState } from 'react';
import { simulateComparison } from '../services/api';
import { X, Award, TrendingDown, DollarSign } from 'lucide-react';

const StrategyInput = ({ title, config, onChange }) => (
    <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">{title}</h4>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Strategy Name
            </label>
            <input
                type="text"
                value={config.name}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Discount (%)
            </label>
            <input
                type="number"
                min="0"
                max="100"
                value={config.planned_discount}
                onChange={(e) => onChange('planned_discount', e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Loyalty Points
            </label>
            <input
                type="number"
                min="0"
                value={config.loyalty_points_bonus}
                onChange={(e) => onChange('loyalty_points_bonus', e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
    </div>
);

const ResultCard = ({ result, isWinner }) => {
    if (!result) return null;

    return (
        <div className={`relative p-6 rounded-xl border-2 ${isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
            {isWinner && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                    <Award className="w-3 h-3 mr-1" /> WINNER
                </div>
            )}

            <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">{result.name}</h4>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                        <TrendingDown className="w-4 h-4 mr-1" /> New Churn Prob
                    </span>
                    <span className="font-mono font-bold text-gray-900">
                        {(result.new_churn_probability * 100).toFixed(1)}%
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                        Reduction
                    </span>
                    <span className="font-mono font-bold text-green-600">
                        -{(result.churn_reduction_absolute * 100).toFixed(1)}%
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" /> Cost
                    </span>
                    <span className="font-mono font-bold text-red-600">
                        ${result.intervention_cost.toFixed(2)}
                    </span>
                </div>

                <div className="pt-3 border-t border-gray-200 mt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">Net Retention Score</span>
                        <span className={`font-mono font-black text-lg ${result.net_retention_score > 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                            {result.net_retention_score.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ABComparisonModal = ({ isOpen, onClose, customerId }) => {
    const [strategyA, setStrategyA] = useState({ name: 'Conservative', planned_discount: 5, loyalty_points_bonus: 0 });
    const [strategyB, setStrategyB] = useState({ name: 'Aggressive', planned_discount: 20, loyalty_points_bonus: 500 });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleRunTest = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        // Validation
        const isInvalid = (val) => val === '' || isNaN(val) || val < 0;

        if (isInvalid(strategyA.planned_discount) || isInvalid(strategyA.loyalty_points_bonus) ||
            isInvalid(strategyB.planned_discount) || isInvalid(strategyB.loyalty_points_bonus)) {
            setError("Please enter valid positive numbers for all fields.");
            setLoading(false);
            return;
        }

        try {
            const data = await simulateComparison({
                customer_id: customerId,
                strategy_a: strategyA,
                strategy_b: strategyB
            });
            setResult(data);
        } catch (err) {
            console.error("Comparison failed:", err);
            setError(err.response?.data?.detail || "Failed to run comparison. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    // Simplified Model Layout to ensuring visibility
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay - ensure fixed position and z-index */}
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75"
                aria-hidden="true"
            ></div>

            {/* Container for centering - handles backdrop click */}
            <div
                className="flex min-h-screen items-center justify-center p-4 text-center relative"
                onClick={onClose}
            >
                {/* Modal Panel */}
                <div
                    className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-4xl p-6"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                A/B Intervention Simulator
                            </h3>
                            <p className="text-sm text-gray-500">
                                Compare financial impact and retention lift of two strategies.
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <X className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <StrategyInput
                                title="Strategy A"
                                config={strategyA}
                                onChange={(field, val) => setStrategyA(prev => ({ ...prev, [field]: val }))}
                            />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <StrategyInput
                                title="Strategy B"
                                config={strategyB}
                                onChange={(field, val) => setStrategyB(prev => ({ ...prev, [field]: val }))}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center mb-8">
                        <button
                            onClick={handleRunTest}
                            disabled={loading}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Running Simulation...' : 'Run Comparison Analysis'}
                        </button>
                    </div>

                    {result && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                            <ResultCard result={result.strategy_a} isWinner={result.winner === result.strategy_a.name} />
                            <ResultCard result={result.strategy_b} isWinner={result.winner === result.strategy_b.name} />
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default ABComparisonModal;
