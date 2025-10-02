import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const userGrowthData = [
  { name: 'Jan', Customers: 40, Tradespeople: 24 },
  { name: 'Feb', Customers: 30, Tradespeople: 13 },
  { name: 'Mar', Customers: 45, Tradespeople: 38 },
  { name: 'Apr', Customers: 50, Tradespeople: 39 },
  { name: 'May', Customers: 60, Tradespeople: 48 },
  { name: 'Jun', Customers: 70, Tradespeople: 52 },
];

const revenueData = [
    { name: 'Plumbing', Revenue: 4000 },
    { name: 'Electrical', Revenue: 3000 },
    { name: 'Carpentry', Revenue: 2000 },
    // FIX: Corrected a typo in the object key.
    { name: 'Handyman', Revenue: 2780 },
    { name: 'Painting', Revenue: 1890 },
];

const Analytics: React.FC = () => {
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
                    <LineChart data={userGrowthData}>
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
            <h3 className="text-lg font-semibold text-brand-gray-800">Revenue by Trade (This Month)</h3>
             <div className="w-full h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Revenue" fill="#1a73e8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;