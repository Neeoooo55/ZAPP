import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import JobManagement from './JobManagement';
import FinancialManagement from './FinancialManagement';
import Support from './Support';
import Analytics from './Analytics';
import AdminProfile from './AdminProfile';
import type { BackendUser } from '../api';

export type View = 'Dashboard' | 'Users' | 'Jobs' | 'Finance' | 'Support' | 'Analytics' | 'Profile';

const AdminShell: React.FC<{ user: BackendUser; onLogout: () => Promise<void>; onUserUpdated?: () => Promise<void> }> = ({ user, onLogout, onUserUpdated }) => {
  const [currentView, setCurrentView] = useState<View>('Dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Users':
        return <UserManagement />;
      case 'Jobs':
        return <JobManagement />;
      case 'Finance':
        return <FinancialManagement />;
      case 'Support':
        return <Support />;
      case 'Analytics':
        return <Analytics />;
      case 'Profile':
        return <AdminProfile user={user} onUpdated={onUserUpdated} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-gray-100 font-sans text-brand-gray-800">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onProfile={() => setCurrentView('Profile')} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray-100 p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
