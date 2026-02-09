import React, { useEffect, useState } from 'react';
import { PayoutRequest } from '../types';
import { walletService } from '../services/walletService';
import Button from './Button';

const PayoutManager: React.FC = () => {
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);

    const refresh = () => {
        setPayouts(walletService.getAllPayoutRequests());
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleApprove = (id: string) => {
        walletService.approvePayout(id);
        refresh();
    };

    const handleMarkPaid = (id: string) => {
        walletService.markPayoutPaid(id);
        refresh();
    };

    const handleReject = (id: string) => {
        const note = window.prompt('Reason for rejection (optional):') || undefined;
        walletService.rejectPayout(id, note);
        refresh();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Payout Manager</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {payouts.length === 0 && <p className="text-sm text-gray-500">No payout requests yet.</p>}
                {payouts.map(payout => (
                    <div key={payout.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">${payout.amount.toFixed(2)} - {payout.method}</p>
                                <p className="text-xs text-gray-500">User: {payout.userId}</p>
                                <p className="text-xs text-gray-500">Status: {payout.status}</p>
                            </div>
                            <div className="flex gap-2">
                                {payout.status === 'Pending' && (
                                    <>
                                        <Button onClick={() => handleApprove(payout.id)} className="w-auto">Approve</Button>
                                        <Button onClick={() => handleReject(payout.id)} variant="danger" className="w-auto">Reject</Button>
                                    </>
                                )}
                                {payout.status === 'Approved' && (
                                    <Button onClick={() => handleMarkPaid(payout.id)} className="w-auto">Mark Paid</Button>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            <p>Requested: {new Date(payout.createdAt).toLocaleString()}</p>
                            {payout.processedAt && <p>Processed: {new Date(payout.processedAt).toLocaleString()}</p>}
                            {payout.note && <p className="text-red-500">Note: {payout.note}</p>}
                        </div>
                        <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                            <p>Bank: {payout.bankDetails.bankName}</p>
                            <p>Account: {payout.bankDetails.accountNumber}</p>
                            <p>Account Name: {payout.bankDetails.accountName}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PayoutManager;

