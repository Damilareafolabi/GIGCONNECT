import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BankDetails, PayoutRequest, WalletTransaction } from '../types';
import { walletService } from '../services/walletService';
import Button from './Button';
import Input from './Input';
import { useToast } from '../contexts/ToastContext';

const defaultBankDetails: BankDetails = {
    accountName: '',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
    swiftCode: '',
    country: '',
};

const WalletDashboard: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [bankDetails, setBankDetails] = useState<BankDetails>(user?.bankDetails || defaultBankDetails);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState<PayoutRequest['method']>('Bank Transfer');

    useEffect(() => {
        if (!user) return;
        setTransactions(walletService.getUserTransactions(user.id));
        setPayouts(walletService.getUserPayoutRequests(user.id));
        setBankDetails(user.bankDetails || defaultBankDetails);
    }, [user]);

    if (!user) return null;

    const balance = walletService.getBalance(user.id);
    const totalPaid = useMemo(() => {
        return transactions
            .filter(txn => txn.type === 'payment')
            .reduce((sum, txn) => sum + txn.amount, 0);
    }, [transactions]);

    const handleBankDetailChange = (field: keyof BankDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setBankDetails(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSaveBankDetails = () => {
        updateUser({ ...user, bankDetails });
        showToast('Bank details saved.', 'success');
    };

    const handleRequestPayout = () => {
        const amount = parseFloat(payoutAmount);
        if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
            showToast('Please complete your bank details before requesting a payout.', 'info');
            return;
        }
        try {
            walletService.requestPayout(user.id, amount, payoutMethod, bankDetails);
            setPayoutAmount('');
            setPayouts(walletService.getUserPayoutRequests(user.id));
            setTransactions(walletService.getUserTransactions(user.id));
            showToast('Payout request submitted.', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const shareableDetails = `Account Name: ${bankDetails.accountName}\nBank Name: ${bankDetails.bankName}\nAccount Number: ${bankDetails.accountNumber}\nRouting/Swift: ${bankDetails.routingNumber || bankDetails.swiftCode || 'N/A'}`;

    return (
        <div className="container mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Wallet</h1>

            {user.role === 'Employer' ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-bold mb-2">Payments Made</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Total paid through GigConnect.</p>
                    <div className="text-3xl font-bold text-indigo-600">${totalPaid.toFixed(2)}</div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-bold mb-2">Available Balance</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Earnings available for withdrawal.</p>
                    <div className="text-3xl font-bold text-green-600">${balance.toFixed(2)}</div>
                </div>
            )}

            {user.role === 'JobSeeker' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">Payout Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="accountName" label="Account Name" value={bankDetails.accountName} onChange={handleBankDetailChange('accountName')} />
                        <Input id="bankName" label="Bank Name" value={bankDetails.bankName} onChange={handleBankDetailChange('bankName')} />
                        <Input id="accountNumber" label="Account Number" value={bankDetails.accountNumber} onChange={handleBankDetailChange('accountNumber')} />
                        <Input id="routingNumber" label="Routing Number" value={bankDetails.routingNumber || ''} onChange={handleBankDetailChange('routingNumber')} />
                        <Input id="swiftCode" label="SWIFT Code" value={bankDetails.swiftCode || ''} onChange={handleBankDetailChange('swiftCode')} />
                        <Input id="country" label="Country" value={bankDetails.country || ''} onChange={handleBankDetailChange('country')} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button onClick={handleSaveBankDetails} className="w-full sm:w-auto">Save Bank Details</Button>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Share with Client (Optional)</label>
                        <textarea
                            className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                            rows={4}
                            readOnly
                            value={shareableDetails}
                        />
                        <p className="text-xs text-gray-500 mt-1">Use this only if you prefer direct payment. Platform success fees apply only to payments processed in GigConnect.</p>
                    </div>
                </div>
            )}

            {user.role === 'JobSeeker' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">Request Payout</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Input
                            id="payoutAmount"
                            label="Amount"
                            type="number"
                            min="0"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                        />
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Method</label>
                            <select
                                value={payoutMethod}
                                onChange={(e) => setPayoutMethod(e.target.value as PayoutRequest['method'])}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            >
                                <option>Bank Transfer</option>
                                <option>Manual Transfer</option>
                            </select>
                        </div>
                        <Button onClick={handleRequestPayout} className="w-full md:w-auto">Submit Request</Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Wallet Activity</h2>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                        {transactions.length === 0 && <p className="text-sm text-gray-500">No wallet activity yet.</p>}
                        {transactions.map(txn => (
                            <div key={txn.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{txn.description}</span>
                                    <span className={`text-sm font-bold ${txn.direction === 'in' ? 'text-green-600' : 'text-red-500'}`}>
                                        {txn.direction === 'in' ? '+' : '-'}${txn.amount.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{txn.type} - {new Date(txn.createdAt).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Payout Requests</h2>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                        {payouts.length === 0 && <p className="text-sm text-gray-500">No payout requests yet.</p>}
                        {payouts.map(payout => (
                            <div key={payout.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">${payout.amount.toFixed(2)} - {payout.method}</span>
                                    <span className="text-xs text-gray-500">{payout.status}</span>
                                </div>
                                <p className="text-xs text-gray-500">{new Date(payout.createdAt).toLocaleString()}</p>
                                {payout.note && <p className="text-xs text-red-500">{payout.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletDashboard;

