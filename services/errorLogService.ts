
import { storageService } from './storageService';
import { LogEntry } from '../types';

export const errorLogService = {
    logError: (error: Error, componentStack: string | null = null): void => {
        try {
            const logs = storageService.getErrorLogs();
            const newLog: LogEntry = {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                message: error.message,
                stack: `${error.stack || ''}\nComponent Stack: ${componentStack || 'N/A'}`,
            };
            // Keep logs to a reasonable size
            const updatedLogs = [newLog, ...logs].slice(0, 100);
            storageService.saveErrorLogs(updatedLogs);
            console.error("GigConnect Error Logged:", newLog);
        } catch (loggingError) {
            console.error("Failed to write to error log:", loggingError);
        }
    },

    getLogs: (): LogEntry[] => {
        return storageService.getErrorLogs();
    },

    clearLogs: (): void => {
        storageService.saveErrorLogs([]);
    },
};
