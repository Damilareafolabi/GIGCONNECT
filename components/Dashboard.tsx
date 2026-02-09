
import React, { useState, useEffect, useMemo } from 'react';
import { Job, NavigateFunction, Application } from '../types';
import { jobService } from '../services/jobService';
import { useAuth } from '../hooks/useAuth';
import JobCard from './JobCard';
import Modal from './Modal';
import Button from './Button';
import { JOB_CATEGORIES } from '../constants';
import MyApplications from './MyApplications';
import { useToast } from '../contexts/ToastContext';
import EmptyState from './EmptyState';
import { geminiService } from '../services/geminiService';
import Spinner from './Spinner';
import AICopilotPanel from './AICopilotPanel';

interface DashboardProps {
    navigate: NavigateFunction;
}

const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [myApplications, setMyApplications] = useState<Application[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedWorkType, setSelectedWorkType] = useState('All');
    const [countryFilter, setCountryFilter] = useState('');
    const [applyingJob, setApplyingJob] = useState<Job | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [safetyAcknowledge, setSafetyAcknowledge] = useState(false);
    const [activeTab, setActiveTab] = useState('find'); // 'find' or 'applied'
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setJobs(jobService.getOpenJobs());
        if (user) {
            setMyApplications(jobService.getApplicationsBySeeker(user.id));
        }
    }, [user]);

    const suggestedJobs = useMemo(() => {
        if (!user?.skills || user.skills.length === 0) return [];
        const userSkills = new Set(user.skills.map(s => s.toLowerCase()));

        return jobs
            .map(job => {
                const jobText = `${job.title} ${job.description} ${job.category}`.toLowerCase();
                let score = 0;
                userSkills.forEach(skill => {
                    if (jobText.includes(skill)) {
                        score++;
                    }
                });
                return { job, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.job);
    }, [jobs, user]);

    const filteredJobs = useMemo(() => {
        const userCountry = user?.country?.trim().toLowerCase();
        return jobs
            .filter(job => {
                const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
                const jobCountry = job.country?.toLowerCase() || '';
                const matchesCountry = !countryFilter || jobCountry.includes(countryFilter.toLowerCase());

                let matchesWorkType = true;
                if (selectedWorkType === 'Remote') matchesWorkType = job.workType === 'Remote';
                if (selectedWorkType === 'On-site') matchesWorkType = job.workType === 'On-site';
                if (selectedWorkType === 'Hybrid') matchesWorkType = job.workType === 'Hybrid';
                if (selectedWorkType === 'International') {
                    if (userCountry) {
                        matchesWorkType = jobCountry && jobCountry !== userCountry;
                    } else {
                        matchesWorkType = job.workType === 'Remote' || !!jobCountry;
                    }
                }

                return matchesSearch && matchesCategory && matchesCountry && matchesWorkType;
            })
            .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }, [jobs, searchTerm, selectedCategory, selectedWorkType, countryFilter, user?.country]);

    const handleApplyClick = (job: Job) => {
        if (myApplications.some(app => app.jobId === job.id)) {
            showToast("You have already applied for this job.", "info");
            return;
        }
        setApplyingJob(job);
        setSafetyAcknowledge(false);
    };

    const handleGenerateCoverLetter = async () => {
        if (!applyingJob || !user) return;
        setIsGenerating(true);
        try {
            const generatedLetter = await geminiService.generateCoverLetter(applyingJob, user);
            setCoverLetter(generatedLetter);
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applyingJob || !user) return;
        const needsSafetyAck = applyingJob.verificationStatus !== 'Verified' || applyingJob.workType !== 'Remote';
        if (needsSafetyAck && !safetyAcknowledge) {
            showToast('Please acknowledge the safety notice before applying.', 'info');
            return;
        }

        try {
            jobService.applyForJob(applyingJob.id, user.id, coverLetter);
            showToast(`Successfully applied for "${applyingJob.title}"!`, 'success');
            setApplyingJob(null);
            setCoverLetter('');
            // Refresh applications
            setMyApplications(jobService.getApplicationsBySeeker(user.id));
        } catch (err: any) {
            showToast(err.message || 'Failed to submit application.', 'error');
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">Welcome, {user?.name}!</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">Here are the latest opportunities.</p>

            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col lg:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search for jobs..."
                    className="flex-grow shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="shadow appearance-none border rounded w-full sm:w-1/3 py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Filter by category"
                >
                    <option value="All">All Categories</option>
                    {JOB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select
                    className="shadow appearance-none border rounded w-full sm:w-1/3 py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedWorkType}
                    onChange={(e) => setSelectedWorkType(e.target.value)}
                    aria-label="Filter by work type"
                >
                    <option value="All">All Work Types</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="International">International</option>
                </select>
                <input
                    type="text"
                    placeholder="Filter by country..."
                    className="shadow appearance-none border rounded w-full sm:w-1/3 py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                />
            </div>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('find')} className={`${activeTab === 'find' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Find Work</button>
                    <button onClick={() => setActiveTab('applied')} className={`${activeTab === 'applied' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Applications</button>
                </nav>
            </div>
            
            {activeTab === 'find' ? (
                <>
                    {jobs.length > 0 && (
                        <div className="mb-8">
                            <AICopilotPanel
                                title="AI Career Copilot"
                                subtitle="Generate plans, pricing guidance, and risk checks before you apply."
                                jobs={jobs}
                            />
                        </div>
                    )}
                    {suggestedJobs.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Recommended for you</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {suggestedJobs.map(job => (
                                    <JobCard key={job.id} job={job} onApply={handleApplyClick} userRole={user!.role} navigate={navigate}/>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mb-8 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg text-center">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">Free to join, success fee only.</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">GigConnect only earns when clients pay you through the platform.</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">All Jobs</h2>
                        {filteredJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredJobs.map(job => (
                                    <JobCard key={job.id} job={job} onApply={handleApplyClick} userRole={user!.role} navigate={navigate} />
                                ))}
                            </div>
                        ) : (
                             <EmptyState 
                                title="No Jobs Found"
                                message="Try adjusting your search or category filters to find what you're looking for."
                            />
                        )}
                    </div>
                </>
            ) : <MyApplications applications={myApplications} />}

            <Modal isOpen={!!applyingJob} onClose={() => setApplyingJob(null)} title={`Apply to ${applyingJob?.title}`}>
                <form onSubmit={handleApplySubmit}>
                    {applyingJob && (applyingJob.verificationStatus !== 'Verified' || applyingJob.workType !== 'Remote') && (
                        <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                            This job is {applyingJob.verificationStatus === 'Verified' ? 'verified' : 'not yet verified'} and may involve in-person work.
                            Please verify details, meet in safe public locations, and avoid sharing sensitive information.
                        </div>
                    )}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="coverLetter" className="block text-gray-700 dark:text-gray-300 text-sm font-bold">Cover Letter</label>
                             <button type="button" onClick={handleGenerateCoverLetter} disabled={isGenerating} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                                {isGenerating ? <><Spinner /> Generating...</> : "Generate with AI ✨"}
                            </button>
                        </div>
                        <textarea
                            id="coverLetter"
                            rows={8}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Tell the employer why you're the best fit for this job."
                            required
                        ></textarea>
                    </div>
                    {applyingJob && (applyingJob.verificationStatus !== 'Verified' || applyingJob.workType !== 'Remote') && (
                        <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <input
                                type="checkbox"
                                checked={safetyAcknowledge}
                                onChange={(e) => setSafetyAcknowledge(e.target.checked)}
                                className="mt-1"
                            />
                            I understand this job is not fully verified or may involve physical work, and I will follow safety guidelines.
                        </label>
                    )}
                    <Button type="submit">Submit Application</Button>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
