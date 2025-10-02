import React from 'react';
import Icon from './shared/Icon';

const Header: React.FC<{ user: { firstName?: string; lastName?: string; email: string }; onProfile: () => void; onLogout: () => void }> = ({ user, onProfile, onLogout }) => {
  return (
    <header className="h-20 bg-white border-b border-brand-gray-200 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-brand-gray-800">ZAPP Admin Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
        <div
          className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-brand-gray-100 transition-colors"
          onClick={onProfile}
          role="button"
          aria-label="View Profile"
        >
          <div className="text-right mr-4">
            <p className="font-semibold text-brand-gray-800">{(`${user.firstName || ''} ${user.lastName || ''}`).trim() || user.email}</p>
            <p className="text-sm text-brand-gray-500">Administrator</p>
          </div>
          <img
            src="https://picsum.photos/seed/admin/48/48"
            alt="Admin avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
