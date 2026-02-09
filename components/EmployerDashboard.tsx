
import React, { useState, useEffect } from 'react';
import { Job, Application, User, NavigateFunction, ApplicationStatus, JobStatus, UserRole } from '../types';
import { jobService } from '../services/jobService';
import { useAuth } from '../hooks/useAuth';
import JobCard from './JobCard';
import Modal from './Modal';
import Button from './Button';
import { storageService } from '../services/storageService';
import { useToast } from '../contexts/ToastContext';
import { geminiService } from '../services/geminiService';
import Spinner from './Spinner';
import AICopilotPanel from './AICopilotPanel';
import { paystackService } from '../services/paystackService';
import { supabaseTableSyncService } from '../services/supabaseTableSyncService';

interface EmployerDashboardProps {
    navigate: NavigateFunction;
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ navigate }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [viewingApplicantsFor, setViewingApplicantsFor] = useState<Job | null>(null);
    const [payingJob, setPayingJob] = useState<Job | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [paystackReference, setPaystackReference] = useState<string | null>(null);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [paystackUrl, setPaystackUrl] = useState<string | null>(null);
    const [markingExternal, setMarkingExternal] = useState(false);
    const [externalDetails, setExternalDetails] = useState({ method: 'Bank Transfer', reference: '', note: '' });
    const [applicants, setApplicants] = useState<{ application: Application, user: User }[]>([]);
    const [activeTab, setActiveTab] = useState('jobs');
    const [allSeekers, setAllSeekers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchingAI, setIsSearchingAI] = useState(false);
    const [aiSearchResult, setAiSearchResult] = useState<{ text: string, groundingChunks?: any[] } | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | undefined>(undefined);

    const refreshJobs = () => {
        if (user) {
            setJobs(jobService.getJobsByEmployer(user.id));
        }
    };

    useEffect(() => {
        refreshJobs();
        setAllSeekers(storageService.getUsers().filter(u => u.role === UserRole.JobSeeker && u.approved));
    }, [user]);

    const handleViewApplicants = (job: Job) => {
        const applications = jobService.getApplicationsForJob(job.id);
        const users = storageService.getUsers();
        const applicantsWithInfo = applications.map(app => ({
            application: app,
            user: users.find(u => u.id === app.jobSeekerId)!
        })).filter(item => item.user);

        setApplicants(applicantsWithInfo);
        setViewingApplicantsFor(job);
    };

    const handleApplicationStatusChange = (app: Application, status: ApplicationStatus) => {
        if (!viewingApplicantsFor) return;
        jobService.updateApplicationStatus(app.id, status, viewingApplicantsFor);
        handleViewApplicants(viewingApplicantsFor);
        refreshJobs();
    };
    
    const handlePayClick = (jobId: string) => {
        const job = jobs.find(j => j.id === jobId);
        if (!job) return;
        setPayingJob(job);
        setPaymentAmount(String(job.payment));
        setPaystackReference(null);
        setPaystackUrl(null);
        setExternalDetails({ method: 'Bank Transfer', reference: '', note: '' });
    };

    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payingJob) return;
        setIsPaying(true);
        try {
            if (!user?.email) throw new Error('Employer email is required to initialize Paystack.');
            const init = await paystackService.initializePayment({
                amount: parseFloat(paymentAmount),
                email: user.email,
                metadata: { jobId: payingJob.id },
            });
            setPaystackReference(init.reference);
            setPaystackUrl(init.authorization_url);
            window.open(init.authorization_url, '_blank');
            showToast('Payment initialized. Complete it in the new tab, then verify here.', 'info');
        } catch (error: any) {
            showToast(error.message || 'Payment failed.', 'error');
        } finally {
            setIsPaying(false);
        }
    };

    const handleVerifyPayment = async () => {
        if (!paystackReference || !payingJob) return;
        setIsVerifyingPayment(true);
        try {
            const result = await paystackService.confirmPayment(paystackReference, payingJob.id);
            if (result.status === 'success' || result.status === 'already_paid') {
                await supabaseTableSyncService.hydrate();
                showToast('Payment verified and recorded!', 'success');
                setPayingJob(null);
                refreshJobs();
            } else {
                showToast(`Payment not successful yet: ${result.status}`, 'info');
            }
        } catch (error: any) {
            showToast(error.message || 'Verification failed.', 'error');
        } finally {
            setIsVerifyingPayment(false);
        }
    };

    const handleMarkPaidExternally = () => {
        if (!payingJob) return;
        if (!externalDetails.method) {
            showToast('Please select a payment method.', 'info');
            return;
        }
        if (!window.confirm('Mark this job as paid externally? Platform fee will be recorded as due.')) return;
        setMarkingExternal(true);
        try {
            jobService.markPaidExternally(payingJob.id, parseFloat(paymentAmount), {
                method: externalDetails.method,
                reference: externalDetails.reference.trim() || undefined,
                note: externalDetails.note.trim() || undefined,
            });
            void supabaseTableSyncService.hydrate();
            showToast('Job marked as paid externally.', 'success');
            setPayingJob(null);
            refreshJobs();
        } catch (error: any) {
            showToast(error.message || 'Failed to mark as paid.', 'error');
        } finally {
            setMarkingExternal(false);
        }
    };

    const handleEditJob = (job: Job) => navigate('postJob', { job });

    const handleGetUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    showToast("Location captured successfully!", "success");
                },
                () => {
                    showToast("Could not get location. Please enable location services.", "error");
                }
            );
        } else {
            showToast("Geolocation is not supported by this browser.", "error");
        }
    };

    const handleAiSearch = async () => {
        if (!searchTerm) {
            showToast("Please enter a search query.", "info");
            return;
        }
        setIsSearchingAI(true);
        setAiSearchResult(null);
        try {
            const result = await geminiService.findTalentNearLocation(searchTerm, userLocation);
            setAiSearchResult(result);
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsSearchingAI(false);
        }
    };
    
    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Employer Dashboard</h1></div>
                <Button onClick={() => navigate('postJob')} className="w-auto">Post New Job</Button>
            </div>
            
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('jobs')} className={`${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Job Postings</button>
                    <button onClick={() => setActiveTab('talent')} className={`${activeTab === 'talent' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Find Talent</button>
                </nav>
            </div>

            {activeTab === 'jobs' && (
                <>
                    {jobs.length > 0 && (
                        <div className="mb-6">
                            <AICopilotPanel
                                title="AI Hiring Copilot"
                                subtitle="Generate milestone plans, pricing guidance, and risk checks for your roles."
                                jobs={jobs}
                            />
                        </div>
                    )}
                    <div className="mb-8 p-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg text-center">
                        <p className="font-semibold text-blue-800 dark:text-blue-100">Post for free. Pay only when you pay talent.</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">GigConnect earns a success fee only on payments processed through the platform.</p>
                    </div>
                    {jobs.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{jobs.map(job => (<JobCard key={job.id} job={job} userRole={user!.role} navigate={navigate} onViewApplicants={handleViewApplicants} onEdit={handleEditJob} onPay={handlePayClick}/>))}</div>) : (<div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md"><p className="text-gray-500 dark:text-gray-400">You haven't posted any jobs yet.</p><Button onClick={() => navigate('postJob')} className="w-auto mx-auto mt-4">Post Your First Job</Button></div>)}
                </>
            )}

            {activeTab === 'talent' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">AI Talent Discovery</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Use Gemini with Google Maps to find talent with real-world context. Try queries like "Graphic designers in San Francisco" or "plumbers near me".</p>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <input type="text" placeholder="Search with AI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <Button onClick={handleGetUserLocation} variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {userLocation ? 'Location Set' : 'Use My Location'}
                        </Button>
                        <Button onClick={handleAiSearch} disabled={isSearchingAI} className="w-full sm:w-auto flex justify-center items-center">
                            {isSearchingAI && <Spinner />}
                            {isSearchingAI ? 'Searching...' : 'Search'}
                        </Button>
                    </div>
                    {aiSearchResult && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-bold mb-2">AI Search Results:</h3>
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{aiSearchResult.text}</p>
                            {aiSearchResult.groundingChunks && aiSearchResult.groundingChunks.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-sm">Sources from Google Maps:</h4>
                                    <ul className="list-disc list-inside text-sm mt-1">
                                        {aiSearchResult.groundingChunks.map((chunk, index) => (
                                            chunk.maps && <li key={index}><a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{chunk.maps.title}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={!!viewingApplicantsFor} onClose={() => setViewingApplicantsFor(null)} title={`Applicants for ${viewingApplicantsFor?.title}`}>
                {applicants.length > 0 ? (
                    <ul className="space-y-4">
                        {applicants.map(({ application, user: applicantUser }) => (
                            <li key={application.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{applicantUser.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Skills: {applicantUser.skills?.join(', ') || 'N/A'}</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 p-3 rounded">{application.coverLetter}</p>
                                {applicantUser.bankDetails && (
                                    <div className="mt-3 p-3 rounded-lg bg-white/70 dark:bg-gray-800">
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Payout Details (Optional)</p>
                                        <p className="text-xs text-gray-500">Bank: {applicantUser.bankDetails.bankName}</p>
                                        <p className="text-xs text-gray-500">Account: {applicantUser.bankDetails.accountNumber}</p>
                                        <p className="text-xs text-gray-500">Name: {applicantUser.bankDetails.accountName}</p>
                                    </div>
                                )}
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-sm font-semibold">Status: {application.status}</span>
                                    {application.status === ApplicationStatus.Submitted && viewingApplicantsFor?.status === JobStatus.Open && (
                                        <>
                                            <button onClick={() => handleApplicationStatusChange(application, ApplicationStatus.Accepted)} className="text-xs bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded">Accept</button>
                                            <button onClick={() => handleApplicationStatusChange(application, ApplicationStatus.Rejected)} className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded">Reject</button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">No applicants for this job yet.</p>
                )}
            </Modal>

            <Modal isOpen={!!payingJob} onClose={() => setPayingJob(null)} title={`Pay for ${payingJob?.title}`}>
                <form onSubmit={handlePaySubmit}>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Pay securely through GigConnect. A success fee is applied, and the talent receives the net amount in their wallet.
                    </p>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Payment Amount</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isPaying}>{isPaying ? 'Processing...' : 'Pay & Complete'}</Button>
                </form>
                {paystackReference && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Reference: {paystackReference}</p>
                        {paystackUrl && (
                            <a href={paystackUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                                Open Paystack Checkout
                            </a>
                        )}
                        <div className="mt-3">
                            <Button onClick={handleVerifyPayment} disabled={isVerifyingPayment} className="w-auto">
                                {isVerifyingPayment ? 'Verifying...' : 'Verify Payment'}
                            </Button>
                        </div>
                    </div>
                )}
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Paid outside GigConnect? Record it here for your records and to close the job.
                    </p>
                    <div className="space-y-3 mb-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Payment Method</label>
                            <select
                                value={externalDetails.method}
                                onChange={(e) => setExternalDetails(prev => ({ ...prev, method: e.target.value }))}
                                className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option>Bank Transfer</option>
                                <option>Cash</option>
                                <option>Mobile Money</option>
                                <option>Crypto</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Reference (optional)</label>
                            <input
                                type="text"
                                value={externalDetails.reference}
                                onChange={(e) => setExternalDetails(prev => ({ ...prev, reference: e.target.value }))}
                                className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Receipt ID, transfer ref, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Notes (optional)</label>
                            <textarea
                                value={externalDetails.note}
                                onChange={(e) => setExternalDetails(prev => ({ ...prev, note: e.target.value }))}
                                className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                                rows={2}
                                placeholder="Any extra details for records"
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            We’ll record the payment and mark the job completed. Platform fee will be noted as due.
                        </p>
                    </div>
                    <Button onClick={handleMarkPaidExternally} disabled={markingExternal} variant="secondary" className="w-auto">
                        {markingExternal ? 'Updating...' : 'Mark Paid Externally'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default EmployerDashboard;
