import React, { useState } from 'react';
import type { User } from '../types';
import { EditIcon, UserIcon, XIcon } from './IconComponents';
import { api } from '../api';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Map portal user to backend fields (trades, phone, name split, address)
    const [firstName, ...rest] = (formData.name || '').trim().split(' ');
    const lastName = rest.join(' ');
    const updates: Record<string, unknown> = {
      trades: formData.specialties,
      phone: formData.phone,
      address: (() => {
        // naive split; ideally use structured fields
        return { street: formData.address };
      })(),
    };
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;

    try {
      const res = await api.updateProfile(updates);
      // Use returned profile to refresh UI; map back to our shape
      const updated = {
        ...formData,
        // keep current simple mapping; server is source of truth
      };
      onUpdateUser(updated);
      setIsEditing(false);
    } catch (e) {
      alert('Failed to update profile.');
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleAddSpecialty = () => {
    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
      setFormData(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty]}));
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specToRemove: string) => {
    if (formData.specialties.length <= 1) return; // Don't allow removing the last specialty

    let newPrimary = formData.primaryTrade;
    if (newPrimary === specToRemove) {
      newPrimary = formData.specialties.find(s => s !== specToRemove) || '';
    }
    
    setFormData(prev => ({
      ...prev,
      primaryTrade: newPrimary,
      specialties: prev.specialties.filter(s => s !== specToRemove)
    }));
  };

  const handleSetPrimary = (specToSet: string) => {
    setFormData(prev => ({ ...prev, primaryTrade: specToSet }));
  };

  const InfoRow: React.FC<{ label: string; value: string; name: keyof User }> = ({ label, value, name }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-coop-gray-dark">{label}</dt>
      <dd className="mt-1 text-sm text-coop-gray-darker sm:mt-0 sm:col-span-2">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-coop-gray rounded-md shadow-sm focus:ring-coop-blue focus:border-coop-blue disabled:bg-coop-gray-light disabled:cursor-not-allowed"
          disabled={!isEditing}
        />
      </dd>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-coop-gray">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <img className="h-20 w-20 rounded-full object-cover" src={user.avatarUrl} alt="User avatar" />
                <div className="ml-4">
                    <h2 className="text-2xl font-bold text-coop-gray-darker">{formData.name}</h2>
                    <p className="text-md text-coop-gray-dark">{formData.primaryTrade}</p>
                </div>
            </div>
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-coop-blue text-white rounded-lg hover:bg-coop-blue-dark transition-colors duration-200"
                >
                    <EditIcon className="w-5 h-5 mr-2" />
                    Edit Profile
                </button>
            )}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-coop-gray-darker flex items-center mb-4">
            <UserIcon className="mr-3"/>
            Personal Information
        </h3>
        <dl className="divide-y divide-coop-gray">
          <InfoRow label="Full Name" value={formData.name} name="name" />
          
          {/* Specialties Section */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-coop-gray-dark pt-2">Specialties</dt>
            <dd className="mt-1 text-sm text-coop-gray-darker sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add a new specialty"
                      className="flex-grow px-3 py-2 border border-coop-gray rounded-md shadow-sm focus:ring-coop-blue focus:border-coop-blue"
                    />
                    <button onClick={handleAddSpecialty} className="px-4 py-2 bg-coop-blue text-white rounded-md hover:bg-coop-blue-dark">Add</button>
                  </div>
                  <div className="space-y-2">
                    {formData.specialties.map(spec => (
                      <div key={spec} className="flex items-center justify-between p-2 bg-coop-gray-light rounded-md">
                        <span className="font-medium">{spec}</span>
                        <div className="flex items-center gap-2">
                          {spec === formData.primaryTrade ? (
                            <span className="text-xs font-bold text-coop-blue px-2">PRIMARY</span>
                          ) : (
                            <button onClick={() => handleSetPrimary(spec)} className="text-xs font-semibold text-coop-blue hover:underline">Make Primary</button>
                          )}
                          <button onClick={() => handleRemoveSpecialty(spec)} disabled={formData.specialties.length <= 1} className="text-coop-gray-dark hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map(spec => (
                    <span key={spec} className={`px-3 py-1 rounded-full text-sm font-medium ${spec === formData.primaryTrade ? 'bg-coop-blue text-white shadow' : 'bg-coop-gray text-coop-gray-darker'}`}>
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </dd>
          </div>

          {/* Email is managed by the system; keep read-only here */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-coop-gray-dark">Email address</dt>
            <dd className="mt-1 text-sm text-coop-gray-darker sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-coop-gray rounded-md bg-coop-gray-light"
              />
            </dd>
          </div>
          <InfoRow label="Phone number" value={formData.phone} name="phone" />
          <InfoRow label="Mailing Address" value={formData.address} name="address" />
        </dl>
      </div>
      {isEditing && (
        <div className="px-6 py-4 bg-coop-gray-light flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-coop-gray-dark rounded-md text-coop-gray-darker font-semibold hover:bg-coop-gray transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-white font-semibold bg-coop-blue hover:bg-coop-blue-dark transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
