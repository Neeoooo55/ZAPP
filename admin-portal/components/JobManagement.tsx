import React, { useEffect, useState } from 'react';
import { Job, JobStatus } from '../types';
import { api } from '../api';

const mapStatus = (s: string): JobStatus => {
  switch (s) {
    case 'completed': return JobStatus.Completed;
    case 'in_progress': return JobStatus.InProgress;
    case 'accepted': return JobStatus.Assigned;
    case 'pending': return JobStatus.Requested;
    case 'cancelled': return JobStatus.Cancelled;
    case 'declined': return JobStatus.Stalled;
    default: return JobStatus.Requested;
  }
};

const getStatusBadge = (status: JobStatus) => {
  switch (status) {
    case JobStatus.Completed: return 'bg-green-100 text-green-800';
    case JobStatus.InProgress: return 'bg-blue-100 text-blue-800';
    case JobStatus.Assigned: return 'bg-indigo-100 text-indigo-800';
    case JobStatus.Requested: return 'bg-gray-100 text-gray-800';
    case JobStatus.Stalled: return 'bg-yellow-100 text-yellow-800';
    case JobStatus.Cancelled: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const JobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.jobs();
        if (!mounted) return;
        const mapped: Job[] = res.jobs.map((j: any) => ({
          id: j._id,
          customerName: `${j.customerId?.firstName || ''} ${j.customerId?.lastName || ''}`.trim() || j.customerId?.email || 'Customer',
          tradespersonName: j.tradespersonId ? (`${j.tradespersonId?.firstName || ''} ${j.tradespersonId?.lastName || ''}`.trim() || j.tradespersonId?.email) : 'Unassigned',
          trade: j.category,
          status: mapStatus(j.status),
          requestTime: j.timeline?.requestedAt ? new Date(j.timeline.requestedAt).toLocaleString() : new Date(j.createdAt).toLocaleString(),
          location: j.location?.address || '—',
        }));
        setJobs(mapped);
      } catch (e) {
        setJobs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gray-900">Job & Dispatch Management</h1>
      <p className="text-brand-gray-600 mt-1">Monitor real-time job requests and intervene when necessary.</p>

      <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-brand-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Job ID</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Customer</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Tradesperson</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Trade</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Request Time</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-200">
              {loading ? (
                <tr><td className="py-4 px-4 text-brand-gray-600" colSpan={7}>Loading jobs…</td></tr>
              ) : (
                jobs.map(job => (
                <tr key={job.id}>
                  <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-brand-gray-900">{job.id}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-brand-gray-700">{job.customerName}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-brand-gray-700">{job.tradespersonName}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-brand-gray-700">{job.trade}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-brand-gray-700">{job.requestTime}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-brand-blue hover:text-indigo-900">Details</button>
                    {job.status === JobStatus.Stalled || job.status === JobStatus.Requested ? (
                      <button className="ml-4 text-green-600 hover:text-green-900">Assign</button>
                    ) : null}
                  </td>
                </tr>
              ))
              )}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
