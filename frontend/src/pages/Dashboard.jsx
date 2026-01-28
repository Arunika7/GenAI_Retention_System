import React, { useState } from 'react';
import ChurnForm from '../components/ChurnForm';
import PredictionCard from '../components/PredictionCard';
import ExplanationPanel from '../components/ExplanationPanel';
import RecommendationsPanel from '../components/RecommendationsPanel';
import OutreachModal from '../components/OutreachModal';
import ABComparisonModal from '../components/ABComparisonModal';
import { predictChurn, simulateIntervention, generateOutreach } from '../services/api';

const Dashboard = () => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Simulation & Outreach State
    const [discount, setDiscount] = useState(0);
    const [points, setPoints] = useState(0);
    const [simResults, setSimResults] = useState(null);
    const [simLoading, setSimLoading] = useState(false);
    const [outreachData, setOutreachData] = useState(null);
    const [outreachLoading, setOutreachLoading] = useState(false);
    const [isOutreachOpen, setIsOutreachOpen] = useState(false);
    const [isABTestOpen, setIsABTestOpen] = useState(false);

    const handlePrediction = async (formData) => {
        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const data = await predictChurn(formData);
            setPrediction(data);
            // Reset simulation if prediction changes
            setSimResults(null);
            setDiscount(0);
            setPoints(0);
        } catch (err) {
            console.error("Prediction failed:", err);
            setError("Failed to generate prediction. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const runSimulation = async (valDiscount, valPoints) => {
        if (!prediction) return;
        setSimLoading(true);
        try {
            const results = await simulateIntervention({
                customer_id: prediction.customer_id,
                planned_discount: valDiscount,
                loyalty_points_bonus: valPoints
            });
            setSimResults(results);
        } catch (err) {
            console.error("Simulation failed:", err);
        } finally {
            setSimLoading(false);
        }
    };

    const handleOutreachDraft = async () => {
        if (!prediction) return;
        setIsOutreachOpen(true);
        setOutreachLoading(true);
        try {
            const data = await generateOutreach({
                customer_id: prediction.customer_id,
                intervention_type: discount > 0 ? "Discount" : "Engagement",
                intervention_details: discount > 0 ? `${discount}% Discount` : "Loyalty Rewards"
            });
            setOutreachData(data);
        } catch (err) {
            console.error("Outreach generation failed:", err);
        } finally {
            setOutreachLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">FreshMart Retention Intelligence</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                GenAI-Powered Customer Churn Prediction & Recommendations
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                System Active
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Error Notification */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-fade-in">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Input Form */}
                    <div className="lg:col-span-4 sticky top-28">
                        <ChurnForm onSubmit={handlePrediction} />
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-8 space-y-6">
                        {loading ? (
                            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                <p className="mt-6 text-gray-800 font-semibold text-lg">Running Analysis...</p>
                                <p className="text-sm text-gray-500">Processing customer tokens & generating retention strategy</p>
                            </div>
                        ) : prediction ? (
                            <div className="animate-fade-in space-y-6">
                                {/* Top Row: Quantitative Score & Profile */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <PredictionCard
                                        churn_probability={prediction.churn_probability}
                                        churn_risk={prediction.churn_risk}
                                        confidence_score={prediction.confidence_score}
                                    />

                                    {/* Simplified Customer Profile / Strategy Badge */}
                                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-lg p-6 text-white shadow-md flex flex-col justify-between h-full">
                                        <div>
                                            <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold mb-1">Customer Profile</p>
                                            <p className="text-xl font-mono font-bold tracking-wide text-white">{prediction.customer_id}</p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold mb-1">Recommended Strategy</p>
                                            <p className="text-lg font-medium text-white">
                                                {prediction.churn_risk === 'High' ? '🚨 Immediate Intervention' :
                                                    prediction.churn_risk === 'Medium' ? '⚠️ Nurture & Monitor' : '✨ Upsell & Engage'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle Row: Qualitative Analysis */}
                                <ExplanationPanel
                                    summary={prediction.explanation_summary || "Analysis based on behavioral patterns."}
                                    key_factors={prediction.key_factors || []}
                                />

                                {/* Bottom Row: Actions */}
                                <RecommendationsPanel
                                    recommended_actions={prediction.recommendations}
                                />

                                {/* NEW: Strategy Command Center (Simulation & Outreach) */}
                                <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
                                    <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Strategy Command Center</h3>
                                            <p className="text-xs text-indigo-600 font-semibold uppercase">Simulate Interventions & Generate Outreach</p>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setIsABTestOpen(true)}
                                                className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-all"
                                            >
                                                Run A/B Test
                                            </button>
                                            <button
                                                onClick={handleOutreachDraft}
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center"
                                            >
                                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Generate Outreach Draft
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Left: What-If Sliders */}
                                        <div className="space-y-8">
                                            <div>
                                                <div className="flex justify-between mb-4">
                                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Planned Discount</label>
                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">{discount}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="40" step="5" value={discount}
                                                    onChange={(e) => {
                                                        const v = Number(e.target.value);
                                                        setDiscount(v);
                                                        runSimulation(v, points);
                                                    }}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-4">
                                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Loyalty Bonus</label>
                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">{points} pts</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="2000" step="100" value={points}
                                                    onChange={(e) => {
                                                        const v = Number(e.target.value);
                                                        setPoints(v);
                                                        runSimulation(discount, v);
                                                    }}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Right: Simulation Result */}
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                                            {simLoading && <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                                <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>}

                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Simulated Outcome</p>

                                            <div className="flex items-center space-x-6">
                                                <div className="text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Before</p>
                                                    <p className="text-xl font-bold text-gray-400 line-through">
                                                        {(prediction.churn_probability * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                                <div className="h-8 w-px bg-gray-200"></div>
                                                <div className="text-center">
                                                    <p className="text-[10px] text-indigo-500 uppercase font-bold mb-1">After</p>
                                                    <p className="text-3xl font-black text-indigo-600">
                                                        {simResults ? (simResults.new_probability * 100).toFixed(1) : (prediction.churn_probability * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <p className="text-sm font-bold text-gray-800">
                                                    {simResults?.risk_reduction_level || "Standby for simulation..."}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {simResults?.impact_description || "Adjust sliders to see impact on retention."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Empty State
                            <div className="bg-white rounded-lg p-16 text-center shadow-sm border border-dashed border-gray-300 min-h-[600px] flex flex-col items-center justify-center">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
                                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                                    Enter customer behavioral data on the left to generate advanced churn predictions and personalized retention strategies.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <OutreachModal
                isOpen={isOutreachOpen}
                onClose={() => setIsOutreachOpen(false)}
                outreachData={outreachData}
                loading={outreachLoading}
            />

            <ABComparisonModal
                isOpen={isABTestOpen}
                onClose={() => setIsABTestOpen(false)}
                customerId={prediction?.customer_id}
            />
        </div>
    );
};

export default Dashboard;
