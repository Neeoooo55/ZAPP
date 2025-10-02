
import React, { useEffect, useMemo, useState } from 'react';
import type { User } from '../types';
import { api, type Job } from '../api';

interface DashboardProps {
  user: User;
}

const StatCard: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => (
  <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
    <h3 className="text-sm font-medium text-coop-gray-dark uppercase">{title}</h3>
    <p className="text-3xl font-bold text-coop-gray-darker mt-2">{value}</p>
    <div className="flex items-center mt-2">
      <span className={`text-sm font-semibold ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
      <span className="text-xs text-coop-gray-dark ml-2">vs. last month</span>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.jobs();
        if (mounted) setJobs(data.jobs || []);
      } catch (e) {
        if (mounted) setError('Failed to load jobs');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const { monthlyEarnings, completedCount, acceptanceRate } = useMemo(() => {
    const completed = jobs.filter(j => j.status === 'completed');
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentCompleted = completed.filter(j => {
      const d = j.timeline?.completedAt ? new Date(j.timeline.completedAt) : null;
      return d ? d >= monthAgo : false;
    });
    const totalRecent = recentCompleted.reduce((sum, j) => sum + (j.completionDetails?.finalCost?.total || j.actualCost || 0), 0);

    // Crude acceptance rate: accepted / (accepted + declined) among tradesperson-related jobs
    const accepted = jobs.filter(j => j.status === 'accepted' || j.status === 'in_progress' || j.status === 'completed').length;
    const declined = jobs.filter(j => j.status === 'declined').length;
    const accRate = (accepted + declined) > 0 ? Math.round((accepted / (accepted + declined)) * 100) : null;

    return {
      monthlyEarnings: `$${totalRecent.toFixed(0)}`,
      completedCount: String(completed.length),
      acceptanceRate: accRate !== null ? `${accRate}%` : 'N/A',
    };
  }, [jobs]);

  const recentActivity = useMemo(() => {
    const recent = [...jobs]
      .filter(j => j.status === 'completed')
      .sort((a, b) => {
        const da = a.timeline?.completedAt ? new Date(a.timeline.completedAt).getTime() : 0;
        const db = b.timeline?.completedAt ? new Date(b.timeline.completedAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);
    return recent;
  }, [jobs]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-coop-gray-darker mb-6">Welcome back, {user.name.split(' ')[0]}!</h1>
      {loading && <div className="text-coop-gray-dark mb-4">Loading jobs…</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Monthly Earnings" value={monthlyEarnings} change="" changeType="increase" />
        <StatCard title="Jobs Completed" value={completedCount} change="" changeType="increase" />
        <StatCard title="Average Rating" value={(/* could derive from backend user later */ '—')} change="" changeType="decrease" />
        <StatCard title="Acceptance Rate" value={acceptanceRate} change="" changeType="increase" />
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-coop-gray-darker">Recent Activity</h3>
            <ul className="mt-4 space-y-4">
                {recentActivity.map(j => (
                  <li key={j._id} className="flex items-center justify-between p-3 bg-coop-gray-light rounded-md">
                    <div>
                      <p className="font-semibold text-coop-gray-darker">{j.category}</p>
                      <p className="text-sm text-coop-gray-dark">{j.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${(j.completionDetails?.finalCost?.total || j.actualCost || 0).toFixed(2)}</p>
                      <p className="text-xs text-coop-gray-dark">{j.timeline?.completedAt ? new Date(j.timeline.completedAt).toLocaleString() : ''}</p>
                    </div>
                  </li>
                ))}
                {!loading && recentActivity.length === 0 && (
                  <li className="p-3 bg-coop-gray-light rounded-md text-coop-gray-dark">No recent activity.</li>
                )}
            </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-coop-gray-darker">Upcoming Votes</h3>
             <div className="mt-4 p-4 border border-coop-blue-light rounded-lg bg-blue-50">
                <h4 className="font-bold text-coop-blue-dark">Q3 Rate Adjustment</h4>
                <p className="text-sm text-coop-gray-darker mt-1">Vote on the proposed 5% increase for hourly rates.</p>
                <p className="text-xs text-coop-gray-dark mt-2">Voting closes in 3 days.</p>
                <button className="mt-3 w-full bg-coop-blue text-white text-sm py-2 rounded-lg hover:bg-coop-blue-dark transition-colors duration-200">
                    View Proposal
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
