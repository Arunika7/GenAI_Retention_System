import React from 'react';

const Settings = () => {
    const [notifications, setNotifications] = React.useState({
        email: true,
        weekly: false
    });
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            alert("Settings saved successfully!");
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">System Settings</h3>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Model Configuration</h4>
                        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">GenAI Inference Engine</p>
                                    <p className="text-xs text-gray-500">Currently using Llama-3-70b optimized model</p>
                                </div>
                                <span className="text-green-600 text-sm font-medium">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Retraining Frequency</p>
                                    <p className="text-xs text-gray-500">Automated weekly updates</p>
                                </div>
                                <button className="text-blue-600 text-sm hover:underline" onClick={() => alert("Scheduled for Sunday 2AM EST")}>Edit</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Notifications</h4>
                        <div className="space-y-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">Email alerts for High Risk churn</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.weekly}
                                    onChange={(e) => setNotifications({ ...notifications, weekly: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">Weekly digest reports</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center"
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
