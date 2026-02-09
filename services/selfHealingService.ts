import { storageService } from './storageService';
import { HealingAction, HealthIncident, UserRole } from '../types';

const actionLog = (action: HealingAction) => {
    const actions = storageService.getHealingActions();
    storageService.saveHealingActions([action, ...actions].slice(0, 50));
};

const incidentLog = (incident: HealthIncident) => {
    const incidents = storageService.getHealthIncidents();
    storageService.saveHealthIncidents([incident, ...incidents].slice(0, 20));
};

const nowIso = () => new Date().toISOString();

const ensureCoreData = () => {
    const users = storageService.getUsers();
    const jobs = storageService.getJobs();

    if (users.length === 0) {
        const recoveredAdmin = { id: 'admin-recovery', email: 'admin@gig.co', name: 'Recovery Admin', role: UserRole.Admin, approved: true };
        storageService.saveUsers([recoveredAdmin]);
        actionLog({
            id: `heal-${Date.now()}`,
            action: 'Recreated core admin user',
            result: 'Fixed',
            details: 'Users store was empty. Restored minimal admin user.',
            createdAt: nowIso(),
        });
    }

    if (jobs.length === 0) {
        actionLog({
            id: `heal-${Date.now() + 1}`,
            action: 'Job catalog check',
            result: 'Needs Review',
            details: 'No jobs found. Consider seeding sample jobs.',
            createdAt: nowIso(),
        });
    }
};

const pruneOldErrors = () => {
    const logs = storageService.getErrorLogs();
    if (logs.length > 50) {
        storageService.saveErrorLogs(logs.slice(0, 50));
        actionLog({
            id: `heal-${Date.now()}`,
            action: 'Error log prune',
            result: 'Fixed',
            details: 'Trimmed error logs to latest 50 entries.',
            createdAt: nowIso(),
        });
    }
};

const checkIncidents = () => {
    const logs = storageService.getErrorLogs();
    const lastHour = logs.filter(log => Date.now() - new Date(log.timestamp).getTime() < 60 * 60 * 1000);
    if (lastHour.length >= 10) {
        incidentLog({
            id: `incident-${Date.now()}`,
            severity: 'High',
            summary: `Spike detected: ${lastHour.length} errors in the last hour.`,
            createdAt: nowIso(),
        });
        actionLog({
            id: `heal-${Date.now() + 2}`,
            action: 'Escalate error spike',
            result: 'Needs Review',
            details: 'High error rate detected. Recommend manual investigation.',
            createdAt: nowIso(),
        });
    }
};

export const selfHealingService = {
    runSelfHeal: () => {
        ensureCoreData();
        pruneOldErrors();
        checkIncidents();
    },
    getActions: () => storageService.getHealingActions(),
    getIncidents: () => storageService.getHealthIncidents(),
};

