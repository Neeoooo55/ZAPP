import React from 'react';
import Icon from './shared/Icon';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-brand-gray-200 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div className="flex items-center">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
          <input
            type="text"
            placeholder="Search for users, jobs, tickets..."
            className="w-64 lg:w-96 pl-10 pr-4 py-2 rounded-lg bg-brand-gray-100 border border-transparent focus:bg-white focus:border-brand-blue focus:outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex items-center space-x-5">
        <button className="relative text-brand-gray-500 hover:text-brand-gray-800">
          <Icon name="notification" className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="flex items-center space-x-3">
          <img
            src="https://picsum.photos/seed/admin/40/40"
            alt="Admin"
            className="w-10 h-10 rounded-full"
          />
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-brand-gray-800">Admin User</div>
            <div className="text-xs text-brand-gray-500">Core Team</div>
          </div>
           <button className="text-brand-gray-500 hover:text-brand-gray-800">
            <Icon name="chevronDown" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
