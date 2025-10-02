import React, { useState } from 'react';
import { api, type BackendUser } from '../api';

const AdminProfile: React.FC<{ user: BackendUser; onUpdated?: () => Promise<void> }> = ({ user, onUpdated }) => {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.updateMe({ firstName: form.firstName, lastName: form.lastName, phone: form.phone });
      setMessage('Profile updated');
      if (onUpdated) await onUpdated();
    } catch (e) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-brand-gray-900 mb-1">Profile</h2>
      <p className="text-brand-gray-600 mb-6">Manage your admin profile details.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-brand-gray-700">First Name</label>
          <input name="firstName" value={form.firstName} onChange={onChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-gray-700">Last Name</label>
          <input name="lastName" value={form.lastName} onChange={onChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-gray-700">Email</label>
          <input value={user.email} disabled className="mt-1 w-full px-3 py-2 border rounded-md bg-brand-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-gray-700">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-brand-blue text-white rounded-md disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {message && <span className="text-sm text-brand-gray-600">{message}</span>}
      </div>
    </div>
  );
};

export default AdminProfile;
