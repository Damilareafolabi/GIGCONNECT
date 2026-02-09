import { storageService } from './storageService';
import { AutomationEvent, AutomationSettings, User, UserRole } from '../types';
import { jobService } from './jobService';
import { notificationService } from './notificationService';
import { radarService } from './radarService';
import { growthService } from './growthService';
import { selfHealingService } from './selfHealingService';

type AutomationStatus = {
    lastAutoMatchAt?: string;
    lastAutoModerationAt?: string;
    lastRadarAt?: string;
    lastGrowthAt?: string;
    lastSelfHealAt?: string;
};

const STATUS_KEY = 'automationStatus';

const getStatus = (): AutomationStatus => {
    return storageService.getBackup(STATUS_KEY) || {};
};

const saveStatus = (status: AutomationStatus) => {
    storageService.saveBackup(STATUS_KEY, status);
};

const logEvent = (event: AutomationEvent) => {
    const events = storageService.getAutomationEvents();
    storageService.saveAutomationEvents([event, ...events].slice(0, 100));
};

const nowIso = () => new Date().toISOString();

const minutesSince = (iso?: string) => {
    if (!iso) return Number.POSITIVE_INFINITY;
    return (Date.now() - new Date(iso).getTime()) / (60 * 1000);
};

const runAutoMatch = () => {
    const users = storageService.getUsers().filter(u => u.role === UserRole.JobSeeker && u.approved);
    const jobs = jobService.getOpenJobs();

    if (users.length === 0 || jobs.length === 0) {
        logEvent({
            id: `auto-${Date.now()}`,
            type: 'autoMatch',
            message: 'Auto-match scan skipped. Not enough users or jobs.',
            status: 'warning',
            createdAt: nowIso(),
        });
        return;
    }

    users.forEach(user => {
        const skills = new Set((user.skills || []).map(skill => skill.toLowerCase()));
        if (skills.size === 0) return;
        const matches = jobs.filter(job => {
            const haystack = `${job.title} ${job.description} ${job.category}`.toLowerCase();
            return Array.from(skills).some(skill => haystack.includes(skill));
        });
        matches.slice(0, 3).forEach(match => {
            notificationService.createNotification(
                user.id,
                `New match: "${match.title}" looks aligned with your skills.`,
                { view: 'dashboard', params: {} }
            );
        });
    });

    logEvent({
        id: `auto-${Date.now()}`,
        type: 'autoMatch',
        message: 'Auto-match scan complete. Candidates notified.',
        status: 'success',
        createdAt: nowIso(),
    });
};

const runAutoModeration = () => {
    const jobs = storageService.getJobs();
    const flagged = jobs.filter(job => /scam|bitcoin|crypto|adult/i.test(job.description));
    if (flagged.length === 0) {
        logEvent({
            id: `auto-${Date.now()}`,
            type: 'autoModeration',
            message: 'Auto-moderation scan complete. No flags.',
            status: 'success',
            createdAt: nowIso(),
        });
        return;
    }
    flagged.forEach(job => {
        notificationService.createNotification(
            job.employerId,
            `Your job "${job.title}" may need edits before approval.`,
            { view: 'dashboard', params: {} }
        );
    });
    logEvent({
        id: `auto-${Date.now()}`,
        type: 'autoModeration',
        message: `Auto-moderation flagged ${flagged.length} job(s) for review.`,
        status: 'warning',
        createdAt: nowIso(),
    });
};

export const automationService = {
    getSettings: (): AutomationSettings => {
        const stored = storageService.getAutomationSettings();
        if (stored) return stored;
        const defaults: AutomationSettings = {
            autoMatch: true,
            autoModeration: true,
            innovationRadar: true,
            growthHunt: true,
            selfHealing: true,
        };
        storageService.saveAutomationSettings(defaults);
        return defaults;
    },

    updateSettings: (settings: AutomationSettings) => {
        storageService.saveAutomationSettings(settings);
    },

    getEvents: () => storageService.getAutomationEvents(),

    runBackgroundTick: (currentUser?: User | null) => {
        const settings = automationService.getSettings();
        const status = getStatus();

        if (settings.autoMatch && minutesSince(status.lastAutoMatchAt) > 20) {
            runAutoMatch();
            status.lastAutoMatchAt = nowIso();
        }

        if (settings.autoModeration && minutesSince(status.lastAutoModerationAt) > 45) {
            runAutoModeration();
            status.lastAutoModerationAt = nowIso();
        }

        if (settings.innovationRadar && minutesSince(status.lastRadarAt) > 120) {
            radarService.runScan();
            logEvent({
                id: `auto-${Date.now()}`,
                type: 'innovationRadar',
                message: 'Innovation radar scan queued in background.',
                status: 'success',
                createdAt: nowIso(),
            });
            status.lastRadarAt = nowIso();
        }

        if (settings.growthHunt && minutesSince(status.lastGrowthAt) > 60) {
            const leads = growthService.generateLeads();
            if (leads.length > 0 && currentUser?.role === UserRole.Admin) {
                notificationService.createNotification(
                    currentUser.id,
                    `Growth engine found ${leads.length} new outreach leads.`,
                    { view: 'dashboard', params: {} }
                );
            }
            logEvent({
                id: `auto-${Date.now()}`,
                type: 'growthHunt',
                message: `Growth hunt completed with ${leads.length} new lead(s).`,
                status: leads.length > 0 ? 'success' : 'warning',
                createdAt: nowIso(),
            });
            status.lastGrowthAt = nowIso();
        }

        if (settings.selfHealing && minutesSince(status.lastSelfHealAt) > 30) {
            selfHealingService.runSelfHeal();
            logEvent({
                id: `auto-${Date.now()}`,
                type: 'selfHealing',
                message: 'Self-healing cycle completed.',
                status: 'success',
                createdAt: nowIso(),
            });
            status.lastSelfHealAt = nowIso();
        }

        saveStatus(status);
    },
};
