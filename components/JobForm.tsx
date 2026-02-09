
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NavigateFunction, Job } from '../types';
import { jobService } from '../services/jobService';
import { storageService } from '../services/storageService';
import Input from './Input';
import Button from './Button';
import { JOB_CATEGORIES } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { geminiService } from '../services/geminiService';
import Spinner from './Spinner';

interface JobFormProps {
    navigate: NavigateFunction;
    jobToEdit?: Job;
}

const BACKUP_KEY = 'jobFormBackup';

const JobForm: React.FC<JobFormProps> = ({ navigate, jobToEdit }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: JOB_CATEGORIES[0],
        payment: '0',
        deadline: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (jobToEdit) {
            setFormData({
                title: jobToEdit.title,
                description: jobToEdit.description,
                category: jobToEdit.category,
                payment: String(jobToEdit.payment),
                deadline: new Date(jobToEdit.deadline).toISOString().split('T')[0],
            });
        } else {
            // Self-healing: check for backed up data
            const backup = storageService.getBackup(BACKUP_KEY);
            if (backup && window.confirm("We found some unsaved data. Do you want to restore it?")) {
                setFormData(backup);
            }
        }
    }, [jobToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const updatedFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(updatedFormData);
        // Save to backup on every change
        storageService.saveBackup(BACKUP_KEY, updatedFormData);
    };

    const handleGenerateDescription = async () => {
        if (!formData.title) {
            showToast("Please enter a job title first.", "info");
            return;
        }
        setIsGenerating(true);
        try {
            const description = await geminiService.generateJobDescription(formData.title);
            setFormData(prev => ({ ...prev, description }));
            storageService.saveBackup(BACKUP_KEY, { ...formData, description });
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            showToast('You must be logged in to post a job.', 'error');
            return;
        }
        setIsSubmitting(true);

        try {
            const jobData = {
                employerId: user.id,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                payment: parseFloat(formData.payment),
                deadline: new Date(formData.deadline).toISOString(),
                isFeatured: false // Used for curated visibility
            };

            if (jobToEdit) {
                jobService.updateJob({ ...jobToEdit, ...jobData});
            } else {
                jobService.createJob(jobData);
            }
            
            // Clear backup and navigate on success
            storageService.clearBackup(BACKUP_KEY);
            showToast(jobToEdit ? "Job updated successfully!" : "Job submitted for approval!", 'success');
            navigate('dashboard');

        } catch (err: any) {
            showToast(err.message || 'An error occurred. Your data is saved locally.', 'error');
            showToast("Submission failed, but your data is safe! Please try again.", 'info');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">{jobToEdit ? 'Edit Job' : 'Post a New Job'}</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit}>
                    <Input id="title" name="title" label="Job Title" type="text" value={formData.title} onChange={handleChange} required />
                    
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 text-sm font-bold">Description</label>
                            <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                                {isGenerating ? <><Spinner /> Generating...</> : "Generate with AI ✨"}
                            </button>
                        </div>
                        <textarea id="description" name="description" rows={6} value={formData.description} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline">
                            {JOB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <Input id="payment" name="payment" label="Payment ($)" type="number" value={formData.payment} onChange={handleChange} required min="0" />
                    <Input id="deadline" name="deadline" label="Application Deadline" type="date" value={formData.deadline} onChange={handleChange} required />
                    
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : (jobToEdit ? 'Update Job' : 'Submit for Approval')}</Button>
                </form>
            </div>
        </div>
    );
};

export default JobForm;
