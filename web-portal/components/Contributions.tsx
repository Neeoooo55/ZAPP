
import React from 'react';
import { CheckCircleIcon } from './IconComponents';

interface Contribution {
    id: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Due' | 'Failed';
}

const mockHistory: Contribution[] = [
    { id: 'c-005', date: '2024-07-01', amount: 50.00, status: 'Paid' },
    { id: 'c-004', date: '2024-06-01', amount: 50.00, status: 'Paid' },
    { id: 'c-003', date: '2024-05-01', amount: 50.00, status: 'Paid' },
    { id: 'c-002', date: '2024-04-01', amount: 50.00, status: 'Paid' },
];

const Contributions: React.FC = () => {
    
    const StatusBadge: React.FC<{ status: Contribution['status'] }> = ({ status }) => {
        const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full inline-block';
        let specificClasses = '';
        switch(status) {
            case 'Paid':
                specificClasses = 'bg-green-100 text-green-800';
                break;
            case 'Due':
                specificClasses = 'bg-yellow-100 text-yellow-800';
                break;
            case 'Failed':
                specificClasses = 'bg-red-100 text-red-800';
                break;
        }
        return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Status Card */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex items-center">
                    <div className="bg-green-100 p-4 rounded-full mr-6">
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-coop-gray-darker">Contributions are Up-to-Date</h2>
                        <p className="text-coop-gray-dark mt-1">Your next contribution of $50.00 is scheduled for August 1, 2024.</p>
                    </div>
                </div>
                
                {/* Payment Method Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-lg font-semibold text-coop-gray-darker mb-3">Payment Method</h3>
                     <div className="flex items-center">
                         <img src="https://placehold.co/40x26/e5e7eb/6b7280?text=VISA" alt="Visa card" className="w-10 h-auto mr-4 rounded" />
                         <div>
                             <p className="font-semibold text-coop-gray-darker">Visa ending in 4242</p>
                             <p className="text-sm text-coop-gray-dark">Expires 12/2026</p>
                         </div>
                     </div>
                     <button className="mt-4 w-full bg-coop-blue text-white text-sm py-2 rounded-lg hover:bg-coop-blue-dark transition-colors duration-200">
                        Update Payment Method
                    </button>
                </div>
            </div>

            {/* Contribution Details */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-coop-gray-darker">About Your Contributions</h3>
                <p className="text-coop-gray-dark mt-2">
                    Your monthly contribution of <strong>$50.00</strong> helps fund the cooperative's essential services, including group liability insurance, marketing to find new customers, platform development, and member support services. Thank you for being a vital part of our community!
                </p>
            </div>

            {/* Contribution History Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-coop-gray">
                    <h3 className="text-lg font-semibold text-coop-gray-darker">Contribution History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-coop-gray-light">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coop-gray-dark uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coop-gray-dark uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coop-gray-dark uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Invoice</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-coop-gray">
                            {mockHistory.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-coop-gray-darker">{item.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-coop-gray-dark">${item.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-coop-gray-dark">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" className="text-coop-blue hover:text-coop-blue-dark">View Invoice</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Contributions;
