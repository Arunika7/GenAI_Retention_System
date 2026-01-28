import axios from 'axios';

// Create an axios instance with default configuration
const apiClient = axios.create({
    baseURL: 'http://localhost:8000', // Configure base URL
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Predict customer churn based on behavioral data.
 * 
 * @param {Object} customerData - The customer features object.
 * @returns {Promise<Object>} - The prediction result (probability, risk, recommendations).
 */
export const predictChurn = async (customerData) => {
    try {
        const response = await apiClient.post('/api/churn/predict', customerData);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error; // Re-throw to let components handle specific UI updates
    }
};

/**
 * Fetch customer profile by ID.
 * 
 * @param {string} customerId - The unique customer identifier.
 * @returns {Promise<Object>} - The customer profile data.
 */
export const fetchCustomer = async (customerId) => {
    try {
        const response = await apiClient.get(`/api/churn/customer/${customerId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Simulate the impact of a retention intervention.
 * 
 * @param {Object} simulationData - customer_id, planned_discount, loyalty_points_bonus, intervention_channel
 * @returns {Promise<Object>} - The simulation results.
 */
export const simulateIntervention = async (simulationData) => {
    try {
        const response = await apiClient.post('/api/churn/simulate', simulationData);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Simulate comparison between two interventions.
 * 
 * @param {Object} payload - { customer_id, strategy_a, strategy_b }
 * @returns {Promise<Object>} - Comparison result.
 */
export const simulateComparison = async (payload) => {
    try {
        const response = await apiClient.post('/api/churn/simulate-comparison', payload);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Generate a personalized outreach draft.
 * 
 * @param {Object} outreachData - customer_id, intervention_type, intervention_details
 * @returns {Promise<Object>} - The generated content (subject, body).
 */
export const generateOutreach = async (outreachData) => {
    try {
        const response = await apiClient.post('/api/churn/generate-outreach', outreachData);
        return response.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Helper function to handle API errors consistently.
 * 
 * @param {Error} error - The error object from axios.
 */
const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error Response:', error.response.data);
        console.error('Status Code:', error.response.status);
    } else if (error.request) {
        // The request was made but no response was received
        console.error('API No Response:', error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('API Request Error:', error.message);
    }
};

export default apiClient;
