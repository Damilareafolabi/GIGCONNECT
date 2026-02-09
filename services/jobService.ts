
import { storageService } from './storageService';
import { Job, Application, JobStatus, ApplicationStatus, UserRole, ExternalPaymentDetails } from '../types';
import { notificationService } from './notificationService';
import { walletService } from './walletService';
import { supabaseTableSyncService } from './supabaseTableSyncService';

export const jobService = {
    getAllJobs: (): Job[] => {
        return storageService.getJobs();
    },

    getOpenJobs: (): Job[] => {
        return storageService.getJobs().filter(job => job.status === JobStatus.Open);
    },

    getJobsByEmployer: (employerId: string): Job[] => {
        return storageService.getJobs().filter(job => job.employerId === employerId);
    },

    createJob: (jobData: Omit<Job, 'id' | 'status' | 'createdAt' | 'hiredUserId'>): Job => {
        const jobs = storageService.getJobs();
        const newJob: Job = {
            ...jobData,
            id: `job-${Date.now()}`,
            status: JobStatus.Open,
            createdAt: new Date().toISOString(),
            paymentStatus: 'Unpaid',
            verificationStatus: jobData.verificationStatus || 'Pending',
        };
        jobs.push(newJob);
        storageService.saveJobs(jobs);
        supabaseTableSyncService.syncItem('jobs', newJob);

        // Notify admin for verification
        const admins = storageService.getUsers().filter(u => u.role === UserRole.Admin);
        admins.forEach(admin => {
            notificationService.createNotification(admin.id, `New job "${newJob.title}" requires source verification.`);
        });

        return newJob;
    },

    updateJob: (updatedJob: Job): Job => {
        let jobs = storageService.getJobs();
        const jobIndex = jobs.findIndex(job => job.id === updatedJob.id);
        if (jobIndex === -1) throw new Error("Job not found");
        
        jobs[jobIndex] = updatedJob;
        storageService.saveJobs(jobs);
        supabaseTableSyncService.syncItem('jobs', updatedJob);
        return updatedJob;
    },

    applyForJob: (jobId: string, jobSeekerId: string, coverLetter: string): Application => {
        const applications = storageService.getApplications();
        const job = storageService.getJobs().find(j => j.id === jobId);

        if (!job) throw new Error("Job not found");

        const newApplication: Application = {
            id: `app-${Date.now()}`,
            jobId,
            jobSeekerId,
            coverLetter,
            status: ApplicationStatus.Submitted,
            appliedAt: new Date().toISOString(),
        };
        applications.push(newApplication);
        storageService.saveApplications(applications);
        supabaseTableSyncService.syncItem('applications', newApplication);
        
        notificationService.createNotification(job.employerId, `You have a new application for "${job.title}".`, { view: 'dashboard', params: {} });

        return newApplication;
    },

    getApplicationsForJob: (jobId: string): Application[] => {
        return storageService.getApplications().filter(app => app.jobId === jobId);
    },

    getApplicationsBySeeker: (seekerId: string): Application[] => {
        return storageService.getApplications().filter(app => app.jobSeekerId === seekerId);
    },

    updateApplicationStatus: (applicationId: string, status: ApplicationStatus, jobToUpdate?: Job): Application => {
        let applications = storageService.getApplications();
        const appIndex = applications.findIndex(app => app.id === applicationId);
        if (appIndex === -1) throw new Error("Application not found");
        
        applications[appIndex].status = status;

        if (status === ApplicationStatus.Accepted && jobToUpdate) {
            jobToUpdate.status = JobStatus.InProgress;
            jobToUpdate.hiredUserId = applications[appIndex].jobSeekerId;
            jobService.updateJob(jobToUpdate);

            // Reject other applications for this job
            applications = applications.map(app => {
                if (app.jobId === jobToUpdate.id && app.id !== applicationId && app.status === ApplicationStatus.Submitted) {
                    app.status = ApplicationStatus.Rejected;
                    notificationService.createNotification(app.jobSeekerId, `Your application for "${jobToUpdate.title}" was not selected.`, { view: 'dashboard', params: {} });
                    supabaseTableSyncService.syncItem('applications', app);
                }
                return app;
            });
        }
        
        storageService.saveApplications(applications);
        supabaseTableSyncService.syncItem('applications', applications[appIndex]);
        
        const app = applications[appIndex];
        const job = storageService.getJobs().find(j => j.id === app.jobId);
        notificationService.createNotification(app.jobSeekerId, `Your application for "${job?.title}" was ${status}.`, { view: 'dashboard', params: {} });

        return applications[appIndex];
    },

    completeJob: (jobId: string): Job => {
        const jobs = storageService.getJobs();
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) throw new Error("Job not found.");

        const job = jobs[jobIndex];
        job.status = JobStatus.Completed;
        storageService.saveJobs(jobs);
        supabaseTableSyncService.syncItem('jobs', job);

        // Notify both parties to leave a review
        if (job.hiredUserId) {
            notificationService.createNotification(job.employerId, `Job "${job.title}" is complete! Please leave a review for the job seeker.`, { view: 'profile', params: { reviewJobId: job.id } });
            notificationService.createNotification(job.hiredUserId, `Job "${job.title}" is complete! Please leave a review for the employer.`, { view: 'profile', params: { reviewJobId: job.id } });
        }
        return job;
    },

    payForJob: (jobId: string, amount: number): Job => {
        const jobs = storageService.getJobs();
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) throw new Error("Job not found.");

        const job = jobs[jobIndex];
        if (job.status !== JobStatus.InProgress) throw new Error("Job must be in progress to process payment.");
        if (!job.hiredUserId) throw new Error("No hired user assigned to this job.");
        if (!amount || amount <= 0) throw new Error("Payment amount must be greater than zero.");

        const payment = walletService.recordJobPayment(job, job.employerId, job.hiredUserId, amount);
        job.status = JobStatus.Completed;
        job.paymentStatus = 'Paid';
        job.paidAmount = amount;
        job.platformFee = payment.fee;
        job.paidAt = new Date().toISOString();
        storageService.saveJobs(jobs);
        supabaseTableSyncService.syncItem('jobs', job);

        notificationService.createNotification(job.employerId, `Payment processed for "${job.title}". Success fee applied.`, { view: 'dashboard', params: {} });
        notificationService.createNotification(job.hiredUserId, `You've been paid for "${job.title}". Check your wallet.`, { view: 'wallet', params: {} });
        notificationService.createNotification(job.employerId, `Job "${job.title}" is complete! Please leave a review for the job seeker.`, { view: 'profile', params: { reviewJobId: job.id } });
        notificationService.createNotification(job.hiredUserId, `Job "${job.title}" is complete! Please leave a review for the employer.`, { view: 'profile', params: { reviewJobId: job.id } });

        return job;
    },

    markPaidExternally: (jobId: string, amount: number, details: ExternalPaymentDetails): Job => {
        const jobs = storageService.getJobs();
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) throw new Error("Job not found.");

        const job = jobs[jobIndex];
        if (job.status !== JobStatus.InProgress) throw new Error("Job must be in progress to mark paid.");
        if (!job.hiredUserId) throw new Error("No hired user assigned to this job.");
        if (!amount || amount <= 0) throw new Error("Payment amount must be greater than zero.");

        const feeInfo = walletService.recordExternalPayment(job, job.employerId, job.hiredUserId, amount, details);

        job.status = JobStatus.Completed;
        job.paymentStatus = 'Paid';
        job.paidAmount = amount;
        job.platformFee = feeInfo.fee;
        job.paidAt = new Date().toISOString();
        storageService.saveJobs(jobs);
        supabaseTableSyncService.syncItem('jobs', job);

        notificationService.createNotification(job.employerId, `Job "${job.title}" marked as paid externally. Platform fee due: $${feeInfo.fee.toFixed(2)}.`, { view: 'dashboard', params: {} });
        notificationService.createNotification(job.hiredUserId, `Employer marked "${job.title}" as paid externally.`, { view: 'dashboard', params: {} });
        notificationService.createNotification(job.employerId, `Job "${job.title}" is complete! Please leave a review for the job seeker.`, { view: 'profile', params: { reviewJobId: job.id } });
        notificationService.createNotification(job.hiredUserId, `Job "${job.title}" is complete! Please leave a review for the employer.`, { view: 'profile', params: { reviewJobId: job.id } });

        return job;
    }
};
