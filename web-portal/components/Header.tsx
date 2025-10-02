import React from 'react';
import type { User, ViewType } from '../types';

interface HeaderProps {
  user: User;
  activeView: ViewType;
  onProfileClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeView, onProfileClick, onLogout }) => {
  const viewTitles: Record<ViewType, string> = {
    dashboard: 'My Dashboard',
    governance: 'Co-op Governance',
    benefits: 'Benefits & Resources',
    community: 'Community Hub',
    resources: 'Training & Resources',
    contributions: 'Monthly Contributions',
    profile: 'My Profile',
  };

  return (
    <header className="flex items-center justify-between h-20 px-8 bg-white border-b">
      <h2 className="text-3xl font-bold text-coop-gray-darker">{viewTitles[activeView]}</h2>
      <div className="flex items-center gap-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-coop-gray-dark hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          aria-label="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
        <div 
          className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-coop-gray-light transition-colors"
          onClick={onProfileClick}
          role="button"
          aria-label="View Profile"
        >
          <div className="text-right mr-4">
            <p className="font-semibold text-coop-gray-darker">{user.name}</p>
            <p className="text-sm text-coop-gray-dark">{user.primaryTrade}</p>
          </div>
          <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Header;