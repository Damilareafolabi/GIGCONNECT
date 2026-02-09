
import React, { useState, useEffect } from 'react';
import { User, Job, NavigateFunction, UserRole, Subscriber } from '../types';
import { adminService } from '../services/adminService';
import { storageService } from '../services/storageService';
import { COMMISSION_RATE } from '../constants';
import ManualDiscoveryTool from './ManualDiscoveryTool';
import ErrorLogViewer from './ErrorLogViewer';
import Button from './Button';
import { geminiService } from '../services/geminiService';
import Spinner from './Spinner';
import { useToast } from '../contexts/ToastContext';
import AutomationCenter from './AutomationCenter';
import InnovationRadar from './InnovationRadar';
import GrowthEngine from './GrowthEngine';
import SelfHealingCenter from './SelfHealingCenter';
import PayoutManager from './PayoutManager';
import { walletService } from '../services/walletService';
import DataVault from './DataVault';
import BlogManager from './BlogManager';

interface AdminDashboardProps {
    navigate: NavigateFunction;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
    const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [activeTab, setActiveTab] = useState('users');
    const { showToast } = useToast();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');

    useEffect(() => {
        reloadData();
    }, []);

    const reloadData = () => {
        setPendingUsers(adminService.getPendingUsers());
        setPendingJobs(adminService.getPendingJobs());
        setCompletedJobs(adminService.getCompletedJobs());
        setAllUsers(storageService.getUsers().filter(u => u.role !== UserRole.Admin));
        setSubscribers(storageService.getSubscribers());
    };

    const handleApproveUser = (userId: string) => {
        adminService.approveUser(userId);
        reloadData();
    };

    const handleRejectUser = (userId: string) => {
        if(window.confirm('Are you sure you want to reject and delete this user?')) {
            adminService.rejectUser(userId);
            reloadData();
        }
    };
    
    const handleApproveJob = (jobId: string) => {
        adminService.approveJob(jobId);
        reloadData();
    };

    const handleRejectJob = (jobId: string) => {
        if(window.confirm('Are you sure you want to reject this job posting?')) {
            adminService.rejectJob(jobId);
            reloadData();
        }
    };
    
    const handleGenerateAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const allJobs = storageService.getJobs();
            const result = await geminiService.analyzeMarketData(allJobs);
            setAnalysisResult(result);
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const platformTransactions = walletService.getPlatformTransactions();
    const totalCommission = platformTransactions.length > 0
        ? platformTransactions.reduce((sum, txn) => sum + txn.amount, 0)
        : completedJobs.reduce((sum, job) => sum + (job.payment * COMMISSION_RATE), 0);
    
    const renderMarketAnalysis = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Market Analysis (GODMODE)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate deep strategic insights from all job data on the platform using Gemini Pro with an expanded "thinking budget".
            </p>
            <Button onClick={handleGenerateAnalysis} disabled={isAnalyzing} className="w-auto flex justify-center items-center">
                {isAnalyzing && <Spinner />}
                {isAnalyzing ? 'Analyzing...' : 'Generate Market Analysis'}
            </Button>
            {analysisResult && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-bold mb-2">AI Analysis Complete:</h4>
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{analysisResult}</p>
                </div>
            )}
        </div>
    );

    const renderPendingUsers = () => (
        <div className="space-y-4">
            {pendingUsers.length === 0 && <p className="text-gray-500">No pending users.</p>}
            {pendingUsers.map(user => (
                <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email} - {user.role}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleApproveUser(user.id)} className="w-auto">Approve</Button>
                        <Button onClick={() => handleRejectUser(user.id)} variant="danger" className="w-auto">Reject</Button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderPendingJobs = () => (
        <div className="space-y-4">
            {pendingJobs.length === 0 && <p className="text-gray-500">No pending jobs.</p>}
            {pendingJobs.map(job => (
                <div key={job.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start gap-3">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{job.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{job.category} - ${job.payment}</p>
                            <p className="text-xs text-gray-500">Source: {job.sourceName || 'N/A'}</p>
                            {job.sourceWebsite && <p className="text-xs text-gray-500">Website: {job.sourceWebsite}</p>}
                            {job.sourceEmail && <p className="text-xs text-gray-500">Email: {job.sourceEmail}</p>}
                            {job.sourcePhone && <p className="text-xs text-gray-500">Phone: {job.sourcePhone}</p>}
                            {job.workType && <p className="text-xs text-gray-500">Work Type: {job.workType}</p>}
                            {job.location && <p className="text-xs text-gray-500">Location: {job.location}</p>}
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{job.description}</p>
                            {job.safetyNotes && (
                                <p className="text-xs text-gray-500 mt-2">Safety Notes: {job.safetyNotes}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button onClick={() => handleApproveJob(job.id)} className="w-auto">Verify</Button>
                            <Button onClick={() => handleRejectJob(job.id)} variant="danger" className="w-auto">Reject</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCommission = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Success Fee Summary</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Fees are earned only when clients pay talent through the platform.</p>
            <div className="text-3xl font-bold text-indigo-600">${totalCommission.toFixed(2)}</div>
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {platformTransactions.length === 0 && completedJobs.length === 0 && <p className="text-gray-500">No completed jobs yet.</p>}
                {platformTransactions.length > 0 ? (
                    platformTransactions.map(txn => (
                        <div key={txn.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                            <span>{txn.description}</span>
                            <span>${txn.amount.toFixed(2)}</span>
                        </div>
                    ))
                ) : (
                    completedJobs.map(job => (
                        <div key={job.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                            <span>{job.title}</span>
                            <span>${(job.payment * COMMISSION_RATE).toFixed(2)}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderUserManagement = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">User Management</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {allUsers.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email} - {user.role}</p>
                        </div>
                        <span className={`text-xs font-semibold ${user.approved ? 'text-green-600' : 'text-yellow-500'}`}>{user.approved ? 'Active' : 'Pending'}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSubscribers = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Subscribers</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
                {subscribers.length === 0 && <p className="text-gray-500">No subscribers yet.</p>}
                {subscribers.map(sub => (
                    <div key={sub.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold">{sub.email}</p>
                        <p className="text-xs text-gray-500">{new Date(sub.subscribedAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
            
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Pending Users ({pendingUsers.length})</button>
                    <button onClick={() => setActiveTab('jobs')} className={`${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Job Verification ({pendingJobs.length})</button>
                    <button onClick={() => setActiveTab('commission')} className={`${activeTab === 'commission' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Success Fees</button>
                    <button onClick={() => setActiveTab('userMgmt')} className={`${activeTab === 'userMgmt' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>User Management</button>
                    <button onClick={() => setActiveTab('subscribers')} className={`${activeTab === 'subscribers' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Subscribers</button>
                    <button onClick={() => setActiveTab('analysis')} className={`${activeTab === 'analysis' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Market Analysis</button>
                    <button onClick={() => setActiveTab('automation')} className={`${activeTab === 'automation' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Automation</button>
                    <button onClick={() => setActiveTab('radar')} className={`${activeTab === 'radar' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Innovation Radar</button>
                    <button onClick={() => setActiveTab('growth')} className={`${activeTab === 'growth' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Growth Engine</button>
                    <button onClick={() => setActiveTab('blog')} className={`${activeTab === 'blog' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Blog</button>
                    <button onClick={() => setActiveTab('payouts')} className={`${activeTab === 'payouts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Payouts</button>
                    <button onClick={() => setActiveTab('data')} className={`${activeTab === 'data' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Data Vault</button>
                    <button onClick={() => setActiveTab('discovery')} className={`${activeTab === 'discovery' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Discovery Tool</button>
                    <button onClick={() => setActiveTab('logs')} className={`${activeTab === 'logs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>System Health</button>
                </nav>
            </div>
            
            {activeTab === 'users' && renderPendingUsers()}
            {activeTab === 'jobs' && renderPendingJobs()}
            {activeTab === 'commission' && renderCommission()}
            {activeTab === 'userMgmt' && renderUserManagement()}
            {activeTab === 'subscribers' && renderSubscribers()}
            {activeTab === 'analysis' && renderMarketAnalysis()}
            {activeTab === 'automation' && <AutomationCenter />}
            {activeTab === 'radar' && <InnovationRadar />}
            {activeTab === 'growth' && <GrowthEngine />}
            {activeTab === 'blog' && <BlogManager />}
            {activeTab === 'payouts' && <PayoutManager />}
            {activeTab === 'data' && <DataVault />}
            {activeTab === 'discovery' && <ManualDiscoveryTool />}
            {activeTab === 'logs' && (
                <div className="space-y-6">
                    <SelfHealingCenter />
                    <ErrorLogViewer />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
