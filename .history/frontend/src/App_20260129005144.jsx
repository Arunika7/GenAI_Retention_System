import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const navigateWithCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard selectedCustomer={selectedCustomer} clearSelection={() => setSelectedCustomer(null)} />;
      case 'analytics':
        return <Analytics />;
      case 'customers':
        return <Customers onSelectCustomer={navigateWithCustomer} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard selectedCustomer={selectedCustomer} clearSelection={() => setSelectedCustomer(null)} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

export default App;
