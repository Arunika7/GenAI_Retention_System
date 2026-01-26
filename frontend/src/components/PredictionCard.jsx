import React from 'react';

const PredictionCard = ({ churn_probability, churn_risk, confidence_score }) => {
    // Determine styling based on risk level
    const getRiskStyles = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high':
                return {
                    container: 'bg-red-50 border-red-100',
                    text: 'text-red-700',
                    bar: 'bg-red-500'
                };
            case 'medium':
                return {
                    container: 'bg-yellow-50 border-yellow-100',
                    text: 'text-yellow-700',
                    bar: 'bg-yellow-500'
                };
            case 'low':
                return {
                    container: 'bg-green-50 border-green-100',
                    text: 'text-green-700',
                    bar: 'bg-green-500'
                };
            default:
                return {
                    container: 'bg-gray-50 border-gray-100',
                    text: 'text-gray-700',
                    bar: 'bg-gray-500'
                };
        }
    };

    const styles = getRiskStyles(churn_risk);
    const probabilityPercent = (churn_probability * 100).toFixed(1);
    const confidencePercent = (confidence_score * 100).toFixed(1);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Prediction Result</h3>

            {/* Main Risk Indicator */}
            <div className={`rounded-xl border p-6 mb-6 text-center ${styles.container}`}>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Churn Risk</p>
                <div className={`text-4xl font-bold mb-2 ${styles.text}`}>
                    {churn_risk || 'N/A'}
                </div>
            </div>

            {/* Probability Meter */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-600">Churn Probability</span>
                    <span className="text-xl font-bold text-gray-900">{probabilityPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                        style={{ width: `${probabilityPercent}%` }}
                    ></div>
                </div>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-sm text-gray-500">Model Confidence</span>
                <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{confidencePercent}%</span>
                </div>
            </div>
        </div>
    );
};

export default PredictionCard;
