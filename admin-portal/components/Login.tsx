import React, { useState } from 'react';
import { api } from '../api';

const Login: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.login(email, password);
      onSuccess();
    } catch (e) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-brand-gray-100">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-brand-gray-800 mb-6">Admin Login</h1>
        <label className="block text-sm font-medium text-brand-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 mb-4 w-full px-3 py-2 border rounded-md"
          required
        />
        <label className="block text-sm font-medium text-brand-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 mb-4 w-full px-3 py-2 border rounded-md"
          required
        />
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-blue text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-xs text-brand-gray-600 mt-3">Use your existing ZAPP credentials.</p>
      </form>
    </div>
  );
};

export default Login;

