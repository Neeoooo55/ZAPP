import React, { useState } from 'react';
import { api } from '../api';

const Register: React.FC<{ onSuccess: () => void; onBackToLogin: () => void }> = ({ onSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    trade: '',
    businessName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.trade) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'tradesperson',
        trades: [formData.trade],
        businessName: formData.businessName || `${formData.firstName} ${formData.lastName}`,
      });
      
      // Auto-login after successful registration
      await api.login(formData.email, formData.password);
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-coop-gray-light py-8">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-coop-gray-darker mb-2">Join the Cooperative</h1>
        <p className="text-sm text-coop-gray-dark mb-6">Create your tradesperson account</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-coop-gray-dark mb-1">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-coop-gray rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-coop-gray-dark mb-1">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-coop-gray rounded-md"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-coop-gray-dark mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-coop-gray rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-coop-gray-dark mb-1">Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-coop-gray rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-coop-gray-dark mb-1">Primary Trade/Service *</label>
          <select
            value={formData.trade}
            onChange={(e) => handleChange('trade', e.target.value)}
            className="w-full px-3 py-2 border border-coop-gray rounded-md"
            required
          >
            <option value="">Select your trade</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="hvac">HVAC</option>
            <option value="carpentry">Carpentry</option>
            <option value="painting">Painting</option>
            <option value="general">General Repairs</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-coop-gray-dark mb-1">Business Name (Optional)</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            className="w-full px-3 py-2 border border-coop-gray rounded-md"
            placeholder="Your business name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-coop-gray-dark mb-1">Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full px-3 py-2 border border-coop-gray rounded-md"
            required
            minLength={6}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-coop-gray-dark mb-1">Confirm Password *</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full px-3 py-2 border border-coop-gray rounded-md"
            required
          />
        </div>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coop-blue text-white py-2 rounded-lg hover:bg-coop-blue-dark disabled:opacity-50 mb-3"
        >
          {loading ? 'Creating Account…' : 'Sign Up'}
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full text-coop-blue text-sm py-2 hover:underline"
        >
          Already have an account? Sign In
        </button>

        <p className="text-xs text-coop-gray-dark mt-4 text-center">
          By signing up, you agree to join the tradesperson cooperative.
        </p>
      </form>
    </div>
  );
};

export default Register;

