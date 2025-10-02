import React, { useEffect, useState } from 'react';
import Icon from './shared/Icon';
import { api } from '../api';

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentProps<typeof Icon>['name'];
  iconBgColor: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, changeType, icon, iconBgColor }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-brand-gray-500">{title}</p>
      <p className="text-3xl font-bold text-brand-gray-800 mt-1">{value}</p>
      {change && (
        <div className="flex items-center mt-2">
          <span className={`text-xs font-semibold ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className="text-xs text-brand-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
    <div className={`p-3 rounded-full ${iconBgColor}`}>
      <Icon name={icon} className="w-6 h-6 text-white" />
    </div>
  </div>
);


const AlertItem: React.FC<{ title: string; time: string; details: string; level: 'critical' | 'warning' }> = ({ title, time, details, level }) => (
          <div className="flex items-start space-x-4 py-3">
        <div className={`mt-1 flex-shrink-0 p-1.5 rounded-full ${level === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <Icon name="alert" className={`w-5 h-5 ${level === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
        </div>
        <div>
            <div className="flex items-baseline">
                <p className="font-semibold text-brand-gray-800">{title}</p>
                <p className="text-xs text-brand-gray-400 ml-2">{time}</p>
            </div>
            <p className="text-sm text-brand-gray-600">{details}</p>
        </div>
    </div>
);


const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ activeJobs: number; availableTrades: number; newSignups: number; openTickets: number }>(
    { activeJobs: 0, availableTrades: 0, newSignups: 0, openTickets: 0 }
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.overview();
        if (!mounted) return;
        setStats({
          activeJobs: res.overview?.jobs?.active ?? 0,
          availableTrades: res.overview?.tradespeople?.available ?? 0,
          newSignups: res.overview?.users?.newSignups7d ?? 0,
          openTickets: 0,
        });
      } catch (e) {
        // keep defaults
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gray-900">Main Dashboard</h1>
      <p className="text-brand-gray-600 mt-1">Here's a real-time overview of the platform's performance.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mt-6">
        <KpiCard title="Active Jobs" value={loading ? '—' : String(stats.activeJobs)} icon="jobs" iconBgColor="bg-blue-500" />
        <KpiCard title="Available Tradespeople" value={loading ? '—' : String(stats.availableTrades)} icon="users" iconBgColor="bg-green-500" />
        <KpiCard title="New Signups (7d)" value={loading ? '—' : String(stats.newSignups)} icon="users" iconBgColor="bg-indigo-500" />
        <KpiCard title="Total Revenue" value="$—" icon="finance" iconBgColor="bg-yellow-500" />
        <KpiCard title="Open Support Tickets" value={loading ? '—' : String(stats.openTickets)} icon="support" iconBgColor="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-brand-gray-800">Live Activity Map</h2>
          <div className="bg-white p-4 rounded-xl shadow-sm mt-4 h-96 flex items-center justify-center">
            <div className="w-full h-full bg-cover bg-center rounded-lg" style={{backgroundImage: "url('https://i.imgur.com/3Z4eC5x.png')"}}>
                {/* This is a static image placeholder for a live map */}
                <div className="w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-20 rounded-lg">
                    <p className="text-white text-lg font-bold bg-black bg-opacity-50 px-4 py-2 rounded-md">Live Map Placeholder</p>
                </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-brand-gray-800">Critical Alerts</h2>
          <div className="bg-white p-4 rounded-xl shadow-sm mt-4 h-96 overflow-y-auto divide-y divide-brand-gray-200">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
