import React, { useEffect, useState } from 'react';
import { Transaction, TransactionType, PromoCode } from '../types';
import { api } from '../api';

const TransactionTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-brand-gray-50">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Txn ID</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">From/To</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-200">
                {transactions.map(t => (
                    <tr key={t.id}>
                        <td className="py-3 px-4 text-sm font-medium text-brand-gray-900">{t.id}</td>
                        <td className="py-3 px-4 text-sm text-brand-gray-700">{t.date}</td>
                        <td className="py-3 px-4 text-sm text-brand-gray-700">{t.type}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-brand-gray-800">${t.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-brand-gray-700">{t.from} &rarr; {t.to}</td>
                        <td className="py-3 px-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'Completed' ? 'bg-green-100 text-green-800' : t.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{t.status}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PromoCodeTable: React.FC<{ codes: PromoCode[] }> = ({ codes }) => (
     <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-brand-gray-50">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Code</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Discount</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Usage</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-brand-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-200">
                {codes.map(c => (
                    <tr key={c.id}>
                        <td className="py-3 px-4 text-sm font-medium text-indigo-600">{c.code}</td>
                        <td className="py-3 px-4 text-sm text-brand-gray-700">{c.discount}</td>
                        <td className="py-3 px-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{c.status}</span></td>
                        <td className="py-3 px-4 text-sm text-brand-gray-700">{c.usageCount} / {c.limit}</td>
                        <td className="py-3 px-4 text-sm font-medium"><a href="#" className="text-brand-blue hover:text-indigo-900">Edit</a></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const FinancialManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('transactions');
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [codes, setCodes] = useState<PromoCode[]>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [txnRes, codeRes] = await Promise.all([
                    api.transactions(),
                    api.promoCodes()
                ]);
                if (!mounted) return;
                const mappedTx: Transaction[] = (txnRes.transactions || []).map((t: any) => ({
                    id: t._id,
                    date: (t.date ? String(t.date).slice(0,10) : ''),
                    type: (t.type as TransactionType),
                    amount: Number(t.amount) || 0,
                    from: t.from,
                    to: t.to,
                    status: t.status,
                }));
                const mappedCodes: PromoCode[] = (codeRes.codes || []).map((c: any) => ({
                    id: c._id,
                    code: c.code,
                    discount: c.discount,
                    status: c.status,
                    usageCount: c.usageCount || 0,
                    limit: c.limit || 0,
                }));
                setTransactions(mappedTx);
                setCodes(mappedCodes);
            } catch (e) {
                setTransactions([]);
                setCodes([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);
    const TABS = ['transactions', 'payouts', 'subscriptions', 'promo codes'];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'transactions':
                return loading ? (
                    <div className="p-8 text-center text-brand-gray-500">Loading transactions…</div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-brand-gray-500">No transactions yet.</div>
                ) : (
                    <TransactionTable transactions={transactions} />
                );
            case 'payouts':
                return loading ? (
                    <div className="p-8 text-center text-brand-gray-500">Loading payouts…</div>
                ) : (
                    <TransactionTable transactions={transactions.filter(t => t.type === TransactionType.Payout)} />
                );
            case 'subscriptions':
                return <div className="p-8 text-center text-brand-gray-500">Subscription Management Coming Soon.</div>;
            case 'promo codes':
                return loading ? (
                    <div className="p-8 text-center text-brand-gray-500">Loading promo codes…</div>
                ) : codes.length === 0 ? (
                    <div className="p-8 text-center text-brand-gray-500">No promo codes configured.</div>
                ) : (
                    <PromoCodeTable codes={codes} />
                );
            default: return null;
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-gray-900">Financial Management</h1>
            <p className="text-brand-gray-600 mt-1">Manage all payments, payouts, subscriptions, and promo codes.</p>
            
            <div className="mt-6 border-b border-brand-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap capitalize py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-gray-500 hover:text-brand-gray-700 hover:border-brand-gray-300'}`}
                        >{tab}</button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};

export default FinancialManagement;
