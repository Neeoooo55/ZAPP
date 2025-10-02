import React, { useState } from 'react';
import { api } from '../api';

const Login: React.FC<{ onSuccess: () => void; onSignUp: () => void }> = ({ onSuccess, onSignUp }) => {
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
    <div className="flex items-center justify-center h-screen bg-coop-gray-light">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-coop-gray-darker mb-6">Tradesperson Login</h1>
        <label className="block text-sm font-medium text-coop-gray-dark">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 mb-4 w-full px-3 py-2 border border-coop-gray rounded-md"
          required
        />
        <label className="block text-sm font-medium text-coop-gray-dark">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 mb-4 w-full px-3 py-2 border border-coop-gray rounded-md"
          required
        />
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coop-blue text-white py-2 rounded-lg hover:bg-coop-blue-dark disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <button
          type="button"
          onClick={onSignUp}
          className="w-full mt-3 text-coop-blue text-sm py-2 hover:underline"
        >
          New to the cooperative? Sign Up
        </button>
        <p className="text-xs text-coop-gray-dark mt-3 text-center">Use your ZAPP tradesperson credentials.</p>
      </form>
    </div>
  );
};

export default Login;

