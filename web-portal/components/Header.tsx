import React from 'react';
import type { User, ViewType } from '../types';

interface HeaderProps {
  user: User;
  activeView: ViewType;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeView, onProfileClick }) => {
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
    </header>
  );
};

export default Header;