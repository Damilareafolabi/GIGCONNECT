import { ReferralEvent } from '../types';
import { storageService } from './storageService';
import { supabaseTableSyncService } from './supabaseTableSyncService';
import { walletService } from './walletService';
import { REFERRAL_BONUS } from '../constants';

const nowIso = () => new Date().toISOString();

const addEvent = (event: ReferralEvent) => {
    const events = storageService.getReferralEvents();
    storageService.saveReferralEvents([event, ...events].slice(0, 1000));
    supabaseTableSyncService.syncItem('referralEvents', event);
};

export const referralService = {
    getEventsByReferrer: (referrerId: string) => {
        return storageService.getReferralEvents().filter(ev => ev.referrerId === referrerId);
    },
    recordSignup: (referrerId: string, referredUserId: string) => {
        if (!referrerId || referrerId === referredUserId) return;
        const exists = storageService
            .getReferralEvents()
            .some(ev => ev.referrerId === referrerId && ev.referredUserId === referredUserId && ev.type === 'signup');
        if (exists) return;
        addEvent({
            id: `ref-${Date.now()}`,
            referrerId,
            referredUserId,
            type: 'signup',
            createdAt: nowIso(),
        });
    },
    recordApplication: (referrerId: string, referredUserId: string, jobId: string) => {
        if (!referrerId || referrerId === referredUserId) return;
        const exists = storageService
            .getReferralEvents()
            .some(ev => ev.referrerId === referrerId && ev.referredUserId === referredUserId && ev.jobId === jobId && ev.type === 'application');
        if (exists) return;

        const amount = REFERRAL_BONUS;
        addEvent({
            id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            referrerId,
            referredUserId,
            type: 'application',
            jobId,
            amount,
            createdAt: nowIso(),
        });

        walletService.recordReferralBonus(referrerId, referredUserId, jobId, amount);
    },
};
