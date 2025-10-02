import React, { useEffect, useState } from 'react';
import { SupportTicket, TicketStatus, Dispute } from '../types';
import { api } from '../api';

const getTicketStatusBadge = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.Open: return 'bg-blue-100 text-blue-800';
        case TicketStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
        case TicketStatus.Resolved: return 'bg-green-100 text-green-800';
        case TicketStatus.Closed: return 'bg-gray-100 text-gray-800';
    }
};

const Support: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tickets');
    
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<any[]>([]);
    const [disputes, setDisputes] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [t, d] = await Promise.all([api.tickets(), api.disputes()]);
                if (!mounted) return;
                setTickets(t.tickets || []);
                setDisputes(d.disputes || []);
            } catch (e) {
                setTickets([]);
                setDisputes([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-gray-900">Support & Disputes</h1>
            <p className="text-brand-gray-600 mt-1">Manage support requests and mediate disputes.</p>

            <div className="mt-6 border-b border-brand-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('tickets')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tickets' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-gray-500 hover:text-brand-gray-700'}`}>Ticketing System</button>
                    <button onClick={() => setActiveTab('disputes')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'disputes' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-gray-500 hover:text-brand-gray-700'}`}>Dispute Center</button>
                </nav>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
                {activeTab === 'tickets' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            {/* ... tickets table ... */}
                            <thead className="bg-brand-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Ticket ID</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Subject</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">User</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Priority</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Last Update</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-gray-200">
                                {loading ? (
                                  <tr><td className="py-6 px-4 text-brand-gray-600" colSpan={7}>Loading…</td></tr>
                                ) : tickets.length === 0 ? (
                                  <tr><td className="py-6 px-4 text-brand-gray-600" colSpan={7}>No tickets yet.</td></tr>
                                ) : (
                                  tickets.map((ticket: any) => (
                                    <tr key={ticket._id}>
                                        <td className="py-3 px-4 text-sm font-medium text-brand-gray-900">{ticket._id}</td>
                                        <td className="py-3 px-4 text-sm text-brand-gray-700">{ticket.subject}</td>
                                        <td className="py-3 px-4 text-sm text-brand-gray-700">{`${ticket.user?.firstName || ''} ${ticket.user?.lastName || ''}`.trim() || ticket.user?.email}</td>
                                        <td className="py-3 px-4"><span className={`font-semibold ${ticket.priority === 'High' ? 'text-red-600' : ticket.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{ticket.priority}</span></td>
                                        <td className="py-3 px-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTicketStatusBadge(ticket.status as TicketStatus)}`}>{ticket.status}</span></td>
                                        <td className="py-3 px-4 text-sm text-brand-gray-700">{ticket.lastUpdate ? new Date(ticket.lastUpdate).toLocaleString() : ''}</td>
                                        <td className="py-3 px-4 text-sm font-medium"><a href="#" className="text-brand-blue hover:text-indigo-900">View</a></td>
                                    </tr>
                                  ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                           <thead className="bg-brand-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Dispute ID</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Job ID</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Parties Involved</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Reason</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-brand-gray-200">
                                {loading ? (
                                  <tr><td className="py-6 px-4 text-brand-gray-600" colSpan={6}>Loading…</td></tr>
                                ) : disputes.length === 0 ? (
                                  <tr><td className="py-6 px-4 text-brand-gray-600" colSpan={6}>No disputes yet.</td></tr>
                                ) : (
                                  disputes.map((d: any) => (
                                    <tr key={d._id}>
                                        <td className="py-3 px-4 text-sm font-medium text-brand-gray-900">{d._id}</td>
                                        <td className="py-3 px-4 text-sm text-brand-gray-700">{d.jobId?._id || ''}</td>
                                        <td className="py-3 px-4 text-sm text-brand-gray-700">{`${d.customer?.firstName || ''} ${d.customer?.lastName || ''}`.trim()} vs {`${d.tradesperson?.firstName || ''} ${d.tradesperson?.lastName || ''}`.trim()}</td>
                                        <td className="py-3 px-4 text-sm text-brand-gray-700">{d.reason}</td>
                                        <td className="py-3 px-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.status === 'Open' ? 'bg-red-100 text-red-800' : d.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{d.status}</span></td>
                                        <td className="py-3 px-4 text-sm font-medium"><a href="#" className="text-brand-blue hover:text-indigo-900">Mediate</a></td>
                                    </tr>
                                  ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Support;
