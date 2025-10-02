import React, { useEffect, useState } from 'react';
import AdminShell from './components/AdminShell';
import { api, type BackendUser } from './api';
import Login from './components/Login';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<BackendUser | null>(null);

  const refreshAuth = async () => {
    try {
      const status = await api.status();
      setAuthed(!!status.isAuthenticated);
      setRole(status.role || null);
      if (status.isAuthenticated) {
        const me = await api.me();
        setUser(me.user as BackendUser);
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

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-brand-gray-800">Loading…</div>;
  }

  if (!authed) {
    return <Login onSuccess={refreshAuth} />;
  }

  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-2">Admin access required</h2>
          <p className="text-brand-gray-600">You are logged in, but not as an admin.</p>
        </div>
      </div>
    );
  }

  const onLogout = async () => {
    await api.logout();
    await refreshAuth();
  };

  const refreshUser = async () => {
    try {
      const me = await api.me();
      setUser(me.user as BackendUser);
    } catch (e) {
      // ignore
    }
  };

  return <AdminShell user={user!} onLogout={onLogout} onUserUpdated={refreshUser} />;
};

export default App;
