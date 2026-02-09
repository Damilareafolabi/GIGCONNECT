
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
        workType: 'Remote',
        location: '',
        sourceName: '',
        sourceWebsite: '',
        sourceEmail: '',
        sourcePhone: '',
        safetyNotes: '',
        safetyAgree: false,
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
                workType: jobToEdit.workType || 'Remote',
                location: jobToEdit.location || '',
                sourceName: jobToEdit.sourceName || '',
                sourceWebsite: jobToEdit.sourceWebsite || '',
                sourceEmail: jobToEdit.sourceEmail || '',
                sourcePhone: jobToEdit.sourcePhone || '',
                safetyNotes: jobToEdit.safetyNotes || '',
                safetyAgree: true,
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

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedFormData = { ...formData, [e.target.name]: e.target.checked };
        setFormData(updatedFormData);
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

        if (!formData.sourceName.trim()) {
            showToast('Please provide the job source or company name.', 'info');
            return;
        }
        if (!formData.sourceWebsite.trim() && !formData.sourceEmail.trim() && !formData.sourcePhone.trim()) {
            showToast('Please provide at least one verification detail (website, email, or phone).', 'info');
            return;
        }
        if (formData.workType !== 'Remote' && !formData.location.trim()) {
            showToast('Please provide a location for on-site or hybrid work.', 'info');
            return;
        }
        if (formData.workType !== 'Remote' && !formData.safetyNotes.trim()) {
            showToast('Please include safety notes for on-site or hybrid work.', 'info');
            return;
        }
        if (!formData.safetyAgree) {
            showToast('You must agree to the safety policy and terms.', 'info');
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
                isFeatured: false, // Used for curated visibility
                workType: formData.workType as Job['workType'],
                location: formData.location,
                sourceName: formData.sourceName,
                sourceWebsite: formData.sourceWebsite,
                sourceEmail: formData.sourceEmail,
                sourcePhone: formData.sourcePhone,
                verificationStatus: 'Pending' as Job['verificationStatus'],
                safetyNotes: formData.safetyNotes,
            };

            if (jobToEdit) {
                jobService.updateJob({ ...jobToEdit, ...jobData});
            } else {
                jobService.createJob(jobData);
            }
            
            // Clear backup and navigate on success
            storageService.clearBackup(BACKUP_KEY);
            showToast(jobToEdit ? "Job updated successfully!" : "Job posted. Verification is pending.", 'success');
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
                    
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Job Source Verification</h3>
                        <Input id="sourceName" name="sourceName" label="Company or Job Source Name" type="text" value={formData.sourceName} onChange={handleChange} required />
                        <Input id="sourceWebsite" name="sourceWebsite" label="Company Website (optional)" type="url" value={formData.sourceWebsite} onChange={handleChange} />
                        <Input id="sourceEmail" name="sourceEmail" label="Official Email (optional)" type="email" value={formData.sourceEmail} onChange={handleChange} />
                        <Input id="sourcePhone" name="sourcePhone" label="Phone Number (optional)" type="tel" value={formData.sourcePhone} onChange={handleChange} />
                        <p className="text-xs text-gray-500">Provide at least one verification detail (website, email, or phone). Jobs are labeled “Verification Pending” until reviewed.</p>
                    </div>

                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Work Type & Safety</h3>
                        <div>
                            <label htmlFor="workType" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Work Type</label>
                            <select id="workType" name="workType" value={formData.workType} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline">
                                <option>Remote</option>
                                <option>On-site</option>
                                <option>Hybrid</option>
                            </select>
                        </div>
                        {formData.workType !== 'Remote' && (
                            <Input id="location" name="location" label="Work Location / City" type="text" value={formData.location} onChange={handleChange} required />
                        )}
                        <div>
                            <label htmlFor="safetyNotes" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Safety Notes (required for physical jobs)</label>
                            <textarea
                                id="safetyNotes"
                                name="safetyNotes"
                                rows={3}
                                value={formData.safetyNotes}
                                onChange={handleChange}
                                placeholder="Describe safe meeting location, onboarding process, and any verification steps."
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <input type="checkbox" name="safetyAgree" checked={formData.safetyAgree} onChange={handleCheckbox} className="mt-1" />
                            I confirm this job is legitimate and I agree to the Safety Policy and Terms of Service.
                        </label>
                    </div>

                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : (jobToEdit ? 'Update Job' : 'Post Job')}</Button>
                </form>
            </div>
        </div>
    );
};

export default JobForm;
