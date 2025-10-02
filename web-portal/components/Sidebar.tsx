
import React from 'react';
import type { ViewType } from '../types';
import { DashboardIcon, GovernanceIcon, BenefitsIcon, CommunityIcon, ResourcesIcon, ContributionsIcon } from './IconComponents';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const NavItem: React.FC<{
  view: ViewType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ view, label, icon, isActive, onClick }) => {
  const baseClasses = "flex items-center px-4 py-3 my-1 font-medium rounded-lg cursor-pointer transition-all duration-200";
  const activeClasses = "bg-coop-blue text-white shadow-lg";
  const inactiveClasses = "text-coop-gray-darker hover:bg-coop-gray hover:text-coop-blue-dark";
  
  return (
    <li onClick={onClick}>
      <a className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {icon}
        <span className="ml-4">{label}</span>
      </a>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { view: 'dashboard' as ViewType, label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { view: 'governance' as ViewType, label: 'Co-op Governance', icon: <GovernanceIcon className="w-6 h-6" /> },
    { view: 'contributions' as ViewType, label: 'Contributions', icon: <ContributionsIcon className="w-6 h-6" /> },
    { view: 'benefits' as ViewType, label: 'Benefits', icon: <BenefitsIcon className="w-6 h-6" /> },
    { view: 'community' as ViewType, label: 'Community Hub', icon: <CommunityIcon className="w-6 h-6" /> },
    { view: 'resources' as ViewType, label: 'Training & Resources', icon: <ResourcesIcon className="w-6 h-6" /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold text-coop-blue-dark">Co-op Portal</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        <ul>
          {navItems.map(item => (
            <NavItem
              key={item.view}
              view={item.view}
              label={item.label}
              icon={item.icon}
              isActive={activeView === item.view}
              onClick={() => setActiveView(item.view)}
            />
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="bg-coop-gray-light p-4 rounded-lg text-center">
            <h4 className="font-bold text-coop-gray-darker">Need Help?</h4>
            <p className="text-sm text-coop-gray-dark mt-1">Contact your Member Success Rep.</p>
            <button className="mt-3 w-full bg-coop-blue text-white py-2 rounded-lg hover:bg-coop-blue-dark transition-colors duration-200">
                Contact Support
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
