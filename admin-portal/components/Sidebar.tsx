import React from 'react';
import Icon from './shared/Icon';
import type { View } from '../App';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ComponentProps<typeof Icon>['name'];
  label: View;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-brand-blue text-white'
          : 'text-brand-gray-300 hover:bg-brand-gray-700 hover:text-white'
      }`}
    >
      <Icon name={icon} className="w-5 h-5" />
      <span className="ml-4 text-sm font-medium">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const navItems: { icon: React.ComponentProps<typeof Icon>['name']; label: View }[] = [
    { icon: 'dashboard', label: 'Dashboard' },
    { icon: 'users', label: 'Users' },
    { icon: 'jobs', label: 'Jobs' },
    { icon: 'finance', label: 'Finance' },
    { icon: 'support', label: 'Support' },
    { icon: 'analytics', label: 'Analytics' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-brand-gray-900 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-brand-gray-800 flex-shrink-0 px-4">
        <Icon name="logo" className="w-8 h-8 text-brand-blue" />
        <h1 className="text-xl font-bold ml-2 tracking-tight">TradePlatform</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        <ul>
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={currentView === item.label}
              onClick={() => setCurrentView(item.label)}
            />
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-brand-gray-800">
        <p className="text-xs text-brand-gray-500">&copy; 2024 TradePlatform Inc.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
