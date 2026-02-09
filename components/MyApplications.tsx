
import React, { useState, useEffect } from 'react';
import { Application, Job } from '../types';
import { jobService } from '../services/jobService';
import { storageService } from '../services/storageService';

interface MyApplicationsProps {
    applications: Application[];
}

const MyApplications: React.FC<MyApplicationsProps> = ({ applications }) => {
    const [jobs, setJobs] = useState<Map<string, Job>>(new Map());

    useEffect(() => {
        const allJobs = storageService.getJobs();
        const jobsMap = new Map<string, Job>();
        allJobs.forEach(job => jobsMap.set(job.id, job));
        setJobs(jobsMap);
    }, []);
    
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Accepted': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-800';
            case 'Rejected': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-800';
            case 'Submitted':
            default: return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-800';
        }
    };

    if (applications.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400">You haven't applied to any jobs yet.</p>;
    }

    return (
        <div className="space-y-4">
            {applications.map(app => {
                const job = jobs.get(app.jobId);
                if (!job) return null;
                return (
                    <div key={app.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{job.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                            {app.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default MyApplications;
