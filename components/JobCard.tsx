import React, { useState, useEffect } from 'react';
import { Job, NavigateFunction, UserRole, JobStatus } from '../types';
import { storageService } from '../services/storageService';

interface JobCardProps {
    job: Job;
    userRole?: UserRole;
    navigate: NavigateFunction;
    onApply?: (job: Job) => void;
    onViewApplicants?: (job: Job) => void;
    onEdit?: (job: Job) => void;
    onPay?: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, userRole, navigate, onApply, onViewApplicants, onEdit, onPay }) => {
    const [employerName, setEmployerName] = useState('');

    useEffect(() => {
        const employer = storageService.getUsers().find(u => u.id === job.employerId);
        setEmployerName(employer?.name || 'Unknown Employer');
    }, [job.employerId]);

    const deadlineDate = new Date(job.deadline);
    const timeDiff = deadlineDate.getTime() - new Date().getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const getStatusColor = () => {
        switch(job.status) {
            case 'Open': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-800';
            case 'In Progress': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-800';
            case 'Completed': return 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-800';
            case 'Pending Approval': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-800';
            case 'Rejected': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-800';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-600';
        }
    };

    const getVerificationBadge = () => {
        switch (job.verificationStatus) {
            case 'Verified':
                return 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900';
            case 'Rejected':
                return 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900';
            case 'Pending':
            default:
                return 'text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden flex flex-col justify-between transition-transform transform hover:scale-105">
            <div className="p-6">
                {job.isFeatured && (
                    <div className="absolute top-0 right-0 mt-2 mr-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                        Highlighted
                    </div>
                )}
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                    <div className="flex flex-col items-end gap-1">
                        {userRole && <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor()}`}>{job.status}</span>}
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${getVerificationBadge()}`}>
                            {job.verificationStatus || 'Pending Verification'}
                        </span>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">by {employerName}</p>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{job.category}</p>

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {job.workType && <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">{job.workType}</span>}
                    {job.location && <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">{job.location}</span>}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 h-16 overflow-hidden">
                    {job.description.substring(0, 100)}{job.description.length > 100 && '...'}
                </p>

                <div className="flex justify-between items-center text-sm">
                    <p className="font-bold text-green-500 text-lg">${job.payment}</p>
                    <p className={`font-semibold ${daysLeft < 3 && job.status === JobStatus.Open ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {job.status === JobStatus.Open && daysLeft > 0 ? `${daysLeft} days left` : ''}
                        {job.status === JobStatus.Open && daysLeft <= 0 ? 'Expired' : ''}
                    </p>
                </div>
            </div>
            <div className="px-6 pb-4">
                {(userRole === UserRole.JobSeeker || !userRole) && onApply && job.status === JobStatus.Open && (
                    <button onClick={() => onApply(job)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
                        Apply Now
                    </button>
                )}
                {userRole === UserRole.Employer && job.status !== JobStatus.Completed && job.status !== JobStatus.Rejected && (
                     <button onClick={() => onViewApplicants && onViewApplicants(job)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
                        View Applicants
                    </button>
                )}
                 {userRole === UserRole.Employer && job.status === JobStatus.InProgress && onPay && (
                     <button onClick={() => onPay(job.id)} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
                        Pay & Complete
                    </button>
                )}
                {userRole === UserRole.Employer && (job.status === JobStatus.Open || job.status === JobStatus.PendingApproval) && onEdit && (
                     <button onClick={() => onEdit(job)} className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
};

export default JobCard;
