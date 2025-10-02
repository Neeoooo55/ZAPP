import React, { useEffect, useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { api } from '../api';

const mapRole = (role: string): UserRole => role === 'tradesperson' ? UserRole.Tradesperson : UserRole.Customer;
const mapStatus = (_: any): UserStatus => UserStatus.Active; // default until status exists in backend

const getStatusBadge = (status: UserStatus) => {
  switch (status) {
    case UserStatus.Active: return 'bg-green-100 text-green-800';
    case UserStatus.Suspended: return 'bg-yellow-100 text-yellow-800';
    case UserStatus.Pending: return 'bg-blue-100 text-blue-800';
    case UserStatus.Rejected: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const UserTable: React.FC<{ users: User[], showTradeDetails?: boolean, showVerification?: boolean }> = ({ users, showTradeDetails, showVerification }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-brand-gray-50">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Name</th>
                    {showTradeDetails && <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Trade</th>}
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Status</th>
                    {showVerification && <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Verification</th>}
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Signup Date</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-200">
                {users.map(user => (
                    <tr key={user.id}>
                        <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <img className="w-8 h-8 rounded-full" src={user.avatarUrl} alt={user.name} />
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-brand-gray-900">{user.name}</div>
                                    <div className="text-xs text-brand-gray-500">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        {showTradeDetails && <td className="py-3 px-4 whitespace-nowrap text-sm text-brand-gray-700">{user.trade || 'N/A'}</td>}
                        <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                                {user.status}
                            </span>
                        </td>
                        {showVerification && (
                            <td className="py-3 px-4 whitespace-nowrap text-sm text-brand-gray-700 space-x-2">
                                <span className={user.backgroundCheck ? 'text-green-600' : 'text-red-600'}>BG</span>
                                <span className={user.licenseVerified ? 'text-green-600' : 'text-red-600'}>License</span>
                            </td>
                        )}
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-brand-gray-700">{user.signupDate}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                            <a href="#" className="text-brand-blue hover:text-indigo-900">View</a>
                            <a href="#" className="ml-4 text-yellow-600 hover:text-yellow-900">Suspend</a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'tradespeople' | 'vetting'>('customers');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.users();
        if (!mounted) return;
        const mapped: User[] = res.users
          .filter((u: any) => u.role !== 'admin')
          .map((u: any) => ({
            id: u._id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || (u.businessInfo?.businessName || 'User'),
            email: u.email,
            role: mapRole(u.role),
            status: mapStatus(u.status),
            signupDate: (u.createdAt || '').slice(0, 10),
            avatarUrl: `https://picsum.photos/seed/${u._id}/40/40`,
            trade: (u.trades && u.trades[0]) || undefined,
            licenseVerified: false,
            backgroundCheck: false,
          }));
        setUsers(mapped);
      } catch (e) {
        setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const TABS = [
    { id: 'customers', label: 'Customers' },
    { id: 'tradespeople', label: 'Tradespeople' },
    { id: 'vetting', label: 'Vetting & Onboarding' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'customers':
        return <UserTable users={users.filter(u => u.role === UserRole.Customer)} />;
      case 'tradespeople':
        return <UserTable users={users.filter(u => u.role === UserRole.Tradesperson && u.status === UserStatus.Active)} showTradeDetails />;
      case 'vetting':
        return <UserTable users={users.filter(u => u.role === UserRole.Tradesperson && u.status !== UserStatus.Active)} showTradeDetails showVerification />;
      default:
        return null;
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gray-900">User Management</h1>
      <p className="text-brand-gray-600 mt-1">Search, view, and manage all user profiles.</p>
      
      <div className="mt-6 border-b border-brand-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-brand-gray-500 hover:text-brand-gray-700 hover:border-brand-gray-300'
                }`
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-6 bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="p-6 text-brand-gray-600">Loading users…</div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default UserManagement;
