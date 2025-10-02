import React, { useState } from 'react';
import { Transaction, TransactionType, PromoCode } from '../types';

const mockTransactions: Transaction[] = [
    { id: 'T001', date: '2023-11-20', type: TransactionType.Payment, amount: 150.00, from: 'Steve Rogers', to: 'Platform', status: 'Completed' },
    { id: 'T002', date: '2023-11-20', type: TransactionType.Payout, amount: 120.00, from: 'Platform', to: 'Tony Stark', status: 'Pending' },
    { id: 'T003', date: '2023-11-19', type: TransactionType.Refund, amount: 75.00, from: 'Platform', to: 'Wanda Maximoff', status: 'Completed' },
    { id: 'T004', date: '2023-11-19', type: TransactionType.Payment, amount: 250.00, from: 'Clint Barton', to: 'Platform', status: 'Failed' },
];

const mockPromoCodes: PromoCode[] = [
    { id: 'P001', code: 'NEWBIE10', discount: '10% Off', status: 'Active', usageCount: 152, limit: 1000 },
    { id: 'P002', code: 'REFERAFRIEND', discount: '$20 Off', status: 'Active', usageCount: 88, limit: 500 },
    { id: 'P003', code: 'HOLIDAY23', discount: '15% Off', status: 'Expired', usageCount: 200, limit: 200 },
];

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
    const TABS = ['transactions', 'payouts', 'subscriptions', 'promo codes'];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'transactions':
                return <TransactionTable transactions={mockTransactions} />;
            case 'payouts':
                return <TransactionTable transactions={mockTransactions.filter(t => t.type === TransactionType.Payout)} />;
            case 'subscriptions':
                return <div className="p-8 text-center text-brand-gray-500">Subscription Management Coming Soon.</div>;
            case 'promo codes':
                return <PromoCodeTable codes={mockPromoCodes} />;
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
