import React, { useEffect, useMemo, useState } from 'react';
import type { User, ViewType } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Governance from './components/Governance';
import Dashboard from './components/Dashboard';
import Contributions from './components/Contributions';
import Profile from './components/Profile';
import { api, type BackendUser } from './api';
import Login from './components/Login';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const mapUser = (u: BackendUser): User => {
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    const address = u.address
      ? [u.address.street, u.address.city, u.address.state, u.address.zipCode].filter(Boolean).join(', ')
      : '';
    const specialties = (u.trades && u.trades.length ? u.trades : ['general']).map(String);
    return {
      name: name || (u.businessInfo?.businessName || 'Tradesperson'),
      primaryTrade: specialties[0] || 'general',
      specialties,
      avatarUrl: 'https://picsum.photos/seed/tradesperson/100/100',
      email: u.email,
      phone: u.phone || '',
      address,
    };
  };

  const refreshAuth = async () => {
    try {
      const status = await api.status();
      setAuthed(!!status.isAuthenticated);
      setRole(status.role || null);
      if (status.isAuthenticated) {
        const me = await api.me();
        const mapped = mapUser(me.user as BackendUser);
        setUser(mapped);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
      setAuthed(false);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'governance':
        return <Governance />;
      case 'dashboard':
        return user ? <Dashboard user={user} /> : null;
      case 'contributions':
        return <Contributions />;
      case 'profile':
        return user ? <Profile user={user} onUpdateUser={setUser} /> : null;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-12 bg-white rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold text-coop-gray-darker mb-2 capitalize">{activeView}</h2>
              <p className="text-coop-gray-dark">This feature is coming soon.</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-coop-gray-darker">Loading…</div>
    );
  }

  if (!authed) {
    return <Login onSuccess={refreshAuth} />;
  }

  if (role !== 'tradesperson') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-2">Tradesperson access required</h2>
          <p className="text-coop-gray-dark">This portal is only available to tradespeople.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-coop-gray-light font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {user && (
          <Header user={user} activeView={activeView} onProfileClick={() => setActiveView('profile')} />
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-coop-gray-light p-4 md:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
