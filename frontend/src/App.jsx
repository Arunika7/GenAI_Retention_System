import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomerId(customerId);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard initialCustomerId={selectedCustomerId} />;
      case 'analytics':
        return <Analytics />;
      case 'customers':
        return <Customers onSelectCustomer={handleCustomerSelect} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

export default App;
