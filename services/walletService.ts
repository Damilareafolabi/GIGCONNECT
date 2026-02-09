import { storageService } from './storageService';
import { WalletTransaction, PayoutRequest, BankDetails, PlatformTransaction, Job, ExternalPaymentDetails } from '../types';
import { COMMISSION_RATE } from '../constants';
import { supabaseTableSyncService } from './supabaseTableSyncService';

const nowIso = () => new Date().toISOString();

const toCents = (amount: number) => Math.round(amount * 100);
const fromCents = (cents: number) => Math.round(cents) / 100;

const addTransaction = (transaction: WalletTransaction) => {
    const transactions = storageService.getWalletTransactions();
    storageService.saveWalletTransactions([transaction, ...transactions].slice(0, 500));
    supabaseTableSyncService.syncItem('walletTransactions', transaction);
};

const addPlatformTransaction = (transaction: PlatformTransaction) => {
    const transactions = storageService.getPlatformTransactions();
    storageService.savePlatformTransactions([transaction, ...transactions].slice(0, 500));
    const currentRevenue = storageService.getPlatformRevenue();
    storageService.savePlatformRevenue(fromCents(toCents(currentRevenue) + toCents(transaction.amount)));
    supabaseTableSyncService.syncItem('platformTransactions', transaction);
};

const getUserTransactions = (userId: string) => {
    return storageService.getWalletTransactions().filter(txn => txn.userId === userId);
};

const getBalance = (userId: string) => {
    return fromCents(
        getUserTransactions(userId).reduce((total, txn) => {
            const delta = txn.direction === 'in' ? txn.amount : -txn.amount;
            return total + toCents(delta);
        }, 0)
    );
};

const recordJobPayment = (job: Job, employerId: string, payeeId: string, amount: number) => {
    const feeCents = Math.round(toCents(amount) * COMMISSION_RATE);
    const fee = fromCents(feeCents);
    const net = fromCents(toCents(amount) - feeCents);

    addTransaction({
        id: `txn-${Date.now()}-earn`,
        userId: payeeId,
        direction: 'in',
        type: 'earning',
        amount: net,
        description: `Payment for "${job.title}"`,
        jobId: job.id,
        createdAt: nowIso(),
    });

    addTransaction({
        id: `txn-${Date.now()}-pay`,
        userId: employerId,
        direction: 'out',
        type: 'payment',
        amount,
        description: `Payment sent for "${job.title}"`,
        jobId: job.id,
        createdAt: nowIso(),
    });

    addPlatformTransaction({
        id: `plt-${Date.now()}`,
        amount: fee,
        jobId: job.id,
        payerId: employerId,
        payeeId,
        createdAt: nowIso(),
        description: `Success fee for "${job.title}"`,
    });

    return { fee, net };
};

const recordReferralBonus = (referrerId: string, referredUserId: string, jobId: string, amount: number) => {
    addTransaction({
        id: `txn-${Date.now()}-ref`,
        userId: referrerId,
        direction: 'in',
        type: 'bonus',
        amount,
        description: `Referral bonus: user ${referredUserId} applied to job ${jobId}`,
        jobId,
        createdAt: nowIso(),
    });
};
const recordExternalPayment = (
    job: Job,
    employerId: string,
    payeeId: string,
    amount: number,
    details: ExternalPaymentDetails
) => {
    const feeCents = Math.round(toCents(amount) * COMMISSION_RATE);
    const fee = fromCents(feeCents);

    const detailSummary = [
        `Method: ${details.method}`,
        details.reference ? `Ref: ${details.reference}` : null,
        details.note ? `Note: ${details.note}` : null,
    ].filter(Boolean).join(' | ');

    addTransaction({
        id: `txn-${Date.now()}-earn-external`,
        userId: payeeId,
        direction: 'in',
        type: 'earning',
        amount,
        description: `External payment for "${job.title}". ${detailSummary}`,
        jobId: job.id,
        createdAt: nowIso(),
    });

    addTransaction({
        id: `txn-${Date.now()}-pay-external`,
        userId: employerId,
        direction: 'out',
        type: 'payment',
        amount,
        description: `External payment sent for "${job.title}". ${detailSummary}`,
        jobId: job.id,
        createdAt: nowIso(),
    });

    addPlatformTransaction({
        id: `plt-${Date.now()}`,
        amount: 0,
        jobId: job.id,
        payerId: employerId,
        payeeId,
        createdAt: nowIso(),
        description: `External payment logged. Estimated fee due: $${fee.toFixed(2)}. ${detailSummary}`,
    });

    return { fee };
};

const requestPayout = (userId: string, amount: number, method: PayoutRequest['method'], bankDetails: BankDetails): PayoutRequest => {
    const balance = getBalance(userId);
    if (amount <= 0) {
        throw new Error('Payout amount must be greater than zero.');
    }
    if (amount > balance) {
        throw new Error('Insufficient wallet balance for this payout request.');
    }

    const payout: PayoutRequest = {
        id: `payout-${Date.now()}`,
        userId,
        amount,
        method,
        bankDetails,
        status: 'Pending',
        createdAt: nowIso(),
    };

    addTransaction({
        id: `txn-${Date.now()}-hold`,
        userId,
        direction: 'out',
        type: 'hold',
        amount,
        description: 'Payout request hold',
        createdAt: nowIso(),
    });

    const payouts = storageService.getPayoutRequests();
    storageService.savePayoutRequests([payout, ...payouts].slice(0, 200));
    supabaseTableSyncService.syncItem('payoutRequests', payout);
    return payout;
};

const updatePayoutStatus = (payoutId: string, status: PayoutRequest['status'], note?: string) => {
    const payouts = storageService.getPayoutRequests();
    const index = payouts.findIndex(payout => payout.id === payoutId);
    if (index === -1) throw new Error('Payout request not found.');

    payouts[index] = {
        ...payouts[index],
        status,
        note,
        processedAt: nowIso(),
    };
    storageService.savePayoutRequests(payouts);
    supabaseTableSyncService.syncItem('payoutRequests', payouts[index]);

    if (status === 'Rejected') {
        addTransaction({
            id: `txn-${Date.now()}-refund`,
            userId: payouts[index].userId,
            direction: 'in',
            type: 'refund',
            amount: payouts[index].amount,
            description: 'Payout request rejected - funds returned',
            createdAt: nowIso(),
        });
    }
};

export const walletService = {
    getBalance,
    getUserTransactions,
    recordJobPayment,
    recordExternalPayment,
    recordReferralBonus,
    requestPayout,
    getAllPayoutRequests: () => storageService.getPayoutRequests(),
    getUserPayoutRequests: (userId: string) => storageService.getPayoutRequests().filter(p => p.userId === userId),
    approvePayout: (payoutId: string) => updatePayoutStatus(payoutId, 'Approved'),
    markPayoutPaid: (payoutId: string) => updatePayoutStatus(payoutId, 'Paid'),
    rejectPayout: (payoutId: string, note?: string) => updatePayoutStatus(payoutId, 'Rejected', note),
    getPlatformRevenue: () => storageService.getPlatformRevenue(),
    getPlatformTransactions: () => storageService.getPlatformTransactions(),
};
