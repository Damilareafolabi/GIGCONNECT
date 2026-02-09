import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import Button from './Button';
import { geminiService } from '../services/geminiService';
import Spinner from './Spinner';
import { useToast } from '../contexts/ToastContext';

interface AICopilotPanelProps {
    title: string;
    subtitle: string;
    jobs: Job[];
}

const AICopilotPanel: React.FC<AICopilotPanelProps> = ({ title, subtitle, jobs }) => {
    const { showToast } = useToast();
    const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
    const [output, setOutput] = useState('');
    const [isWorking, setIsWorking] = useState(false);

    const selectedJob = jobs.find(job => job.id === selectedJobId);

    useEffect(() => {
        if (!selectedJobId && jobs[0]) {
            setSelectedJobId(jobs[0].id);
        }
    }, [jobs, selectedJobId]);

    const runTask = async (task: 'plan' | 'pricing' | 'risk') => {
        if (!selectedJob) {
            showToast('Select a job to run the AI copilot.', 'info');
            return;
        }
        setIsWorking(true);
        setOutput('');
        try {
            if (task === 'plan') {
                setOutput(await geminiService.generateProjectPlan(selectedJob.title, selectedJob.description));
            } else if (task === 'pricing') {
                setOutput(await geminiService.suggestPricing(selectedJob.title, selectedJob.category));
            } else {
                setOutput(await geminiService.detectRiskFlags(selectedJob.description));
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setIsWorking(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-3">
                <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                    {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => runTask('plan')} disabled={isWorking} className="w-full sm:w-auto">
                        {isWorking ? <><Spinner /> Working...</> : 'Generate Project Plan'}
                    </Button>
                    <Button onClick={() => runTask('pricing')} disabled={isWorking} variant="secondary" className="w-full sm:w-auto">
                        Suggest Pricing
                    </Button>
                    <Button onClick={() => runTask('risk')} disabled={isWorking} variant="danger" className="w-full sm:w-auto">
                        Risk Flags
                    </Button>
                </div>
            </div>

            {output && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-bold mb-2">AI Output</h3>
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{output}</p>
                </div>
            )}
        </div>
    );
};

export default AICopilotPanel;
