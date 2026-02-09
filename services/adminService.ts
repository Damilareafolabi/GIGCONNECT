
import { storageService } from './storageService';
import { User, Job, JobStatus } from '../types';
import { notificationService } from './notificationService';
import { supabaseTableSyncService } from './supabaseTableSyncService';

export const adminService = {
    getPendingUsers: (): User[] => {
        return storageService.getUsers().filter(user => !user.approved);
    },

    getPendingJobs: (): Job[] => {
        return storageService.getJobs().filter(job => job.verificationStatus === 'Pending');
    },

    approveUser: (userId: string): User | undefined => {
        const users = storageService.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].approved = true;
            storageService.saveUsers(users);
            supabaseTableSyncService.syncItem('users', users[userIndex]);
            notificationService.createNotification(userId, 'Your account has been approved! You can now log in.');
            return users[userIndex];
        }
        return undefined;
    },

    rejectUser: (userId: string): void => {
        const users = storageService.getUsers().filter(u => u.id !== userId);
        storageService.saveUsers(users);
        supabaseTableSyncService.deleteItem('users', userId);
        // In a real app, you might notify them, but here we just remove them.
    },
    
    approveJob: (jobId: string): Job | undefined => {
        const jobs = storageService.getJobs();
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        if (jobIndex !== -1) {
            jobs[jobIndex].status = JobStatus.Open;
            jobs[jobIndex].verificationStatus = 'Verified';
            jobs[jobIndex].verificationNote = 'Verified by admin.';
            storageService.saveJobs(jobs);
            supabaseTableSyncService.syncItem('jobs', jobs[jobIndex]);
            notificationService.createNotification(jobs[jobIndex].employerId, `Your job post "${jobs[jobIndex].title}" has been verified.`);
            return jobs[jobIndex];
        }
        return undefined;
    },

    rejectJob: (jobId: string): Job | undefined => {
        const jobs = storageService.getJobs();
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        if (jobIndex !== -1) {
            jobs[jobIndex].status = JobStatus.Rejected;
            jobs[jobIndex].verificationStatus = 'Rejected';
            jobs[jobIndex].verificationNote = 'Source verification failed.';
            storageService.saveJobs(jobs);
            supabaseTableSyncService.syncItem('jobs', jobs[jobIndex]);
            notificationService.createNotification(jobs[jobIndex].employerId, `Your job post "${jobs[jobIndex].title}" was rejected after verification review.`);
            return jobs[jobIndex];
        }
        return undefined;
    },

    getCompletedJobs: (): Job[] => {
        return storageService.getJobs().filter(job => job.status === JobStatus.Completed);
    }
};
