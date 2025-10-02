import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../api';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState<{ name: string; Customers: number; Tradespeople: number; }[]>([]);
  const [jobsByStatus, setJobsByStatus] = useState<{ name: string; Count: number; }[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.overview();
        if (!mounted) return;
        const users = res.overview?.users || {};
        // Build a simple two-point time series using current totals
        setUsersData([
          { name: 'Current', Customers: users.customers ?? 0, Tradespeople: users.tradespeople ?? 0 }
        ]);
        const byStatus = res.overview?.jobs?.byStatus || {};
        setJobsByStatus(Object.keys(byStatus).map((k) => ({ name: k, Count: byStatus[k] || 0 })));
      } catch (e) {
        setUsersData([]);
        setJobsByStatus([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gray-900">Analytics & Reporting</h1>
      <p className="text-brand-gray-600 mt-1">Generate reports and analyze key operational metrics.</p>

      <div className="mt-6 bg-white rounded-xl shadow-sm p-5 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="date-range" className="block text-sm font-medium text-brand-gray-700">Date Range</label>
          <input type="date" id="date-range" defaultValue="2023-01-01" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md"/>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="geo-area" className="block text-sm font-medium text-brand-gray-700">Geographical Area</label>
          <select id="geo-area" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
            <option>All Areas</option>
            <option>New York, NY</option>
            <option>Los Angeles, CA</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="trade-type" className="block text-sm font-medium text-brand-gray-700">Trade Type</label>
          <select id="trade-type" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
            <option>All Trades</option>
            <option>Plumbing</option>
            <option>Electrical</option>
          </select>
        </div>
        <div className="self-end">
            <button className="py-2 px-6 bg-brand-blue text-white font-semibold rounded-md hover:bg-indigo-700 transition">Generate Report</button>
        </div>
         <div className="self-end">
            <button className="py-2 px-6 bg-brand-gray-600 text-white font-semibold rounded-md hover:bg-brand-gray-700 transition">Export Data</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-brand-gray-800">User Growth (YTD)</h3>
            <div className="w-full h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usersData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Customers" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="Tradespeople" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-brand-gray-800">Jobs by Status</h3>
             <div className="w-full h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobsByStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Count" fill="#1a73e8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
