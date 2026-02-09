
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, UserRole, NavigateFunction, Review, Job } from '../types';
import { reviewService } from '../services/reviewService';
import { storageService } from '../services/storageService';
import Input from './Input';
import Button from './Button';
import Modal from './Modal';
import StarRating from './StarRating';
import { useToast } from '../contexts/ToastContext';
import { geminiService } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import Spinner from './Spinner';
import { referralService } from '../services/referralService';
import { REFERRAL_BONUS } from '../constants';

interface ProfileProps {
    navigate: NavigateFunction;
    reviewJobId?: string;
}

const Profile: React.FC<ProfileProps> = ({ navigate, reviewJobId }) => {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState<Partial<User>>({ ...user });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [skillsInput, setSkillsInput] = useState('');
    const [portfolioLinkInput, setPortfolioLinkInput] = useState('');
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [jobToReview, setJobToReview] = useState<Job | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
    const [videoSummary, setVideoSummary] = useState('');
    const [referralCopied, setReferralCopied] = useState(false);

    useEffect(() => {
        if (user) setReviews(reviewService.getReviewsForUser(user.id));
        if (reviewJobId) {
            const job = storageService.getJobs().find(j => j.id === reviewJobId);
            if (job && !reviewService.hasUserReviewedJob(user!.id, job.id)) {
                setJobToReview(job);
                setReviewModalOpen(true);
            }
        }
    }, [user, reviewJobId]);
    
    if (!user) return <p>Loading profile...</p>;

    const referralLink = `${window.location.origin}/?ref=${user.id}`;
    const referralEvents = referralService.getEventsByReferrer(user.id);
    const referralApplications = referralEvents.filter(ev => ev.type === 'application').length;
    const referralEarnings = referralEvents.reduce((sum, ev) => sum + (ev.amount || 0), 0);

    const handleCopyReferral = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setReferralCopied(true);
            setTimeout(() => setReferralCopied(false), 2000);
        } catch {
            setReferralCopied(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleListChange = (field: 'skills' | 'portfolioLinks', value: string, action: 'add' | 'remove') => {
        const currentList = formData[field] || [];
        if (action === 'add' && value && !currentList.includes(value)) {
            setFormData({ ...formData, [field]: [...currentList, value] });
        } else if (action === 'remove') {
            setFormData({ ...formData, [field]: currentList.filter(item => item !== value) });
        }
    };
    
    const handleImproveBio = async () => {
        setIsGenerating(true);
        try {
            const improvedBio = await geminiService.improveProfileBio(formData.profileBio || '', formData.skills || []);
            setFormData(prev => ({ ...prev, profileBio: improvedBio }));
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzingVideo(true);
        setVideoSummary('');
        try {
            const base64Video = await fileToBase64(file);
            const summary = await geminiService.analyzeVideo(base64Video, file.type);
            setVideoSummary(summary);
            showToast("Video analysis complete!", "success");
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsAnalyzingVideo(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({ ...user, ...formData });
        showToast('Profile updated successfully!', 'success');
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobToReview || !user) return;
        const revieweeId = user.role === UserRole.Employer ? jobToReview.hiredUserId : jobToReview.employerId;
        if (!revieweeId) return;

        try {
            reviewService.createReview({ jobId: jobToReview.id, reviewerId: user.id, revieweeId, rating: reviewRating, comment: reviewComment });
            showToast('Review submitted successfully!', 'success');
            setReviewModalOpen(false);
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };
    
    const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                {/* ... existing header code ... */}

                <div className="mt-8 border-t pt-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Referral Center</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Earn ${REFERRAL_BONUS} when someone you referred applies for a job.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                            value={referralLink}
                            readOnly
                            className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-100"
                        />
                        <Button onClick={handleCopyReferral} className="w-auto">{referralCopied ? 'Copied' : 'Copy Link'}</Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="text-xs text-gray-500">Total Referrals</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{referralEvents.length}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="text-xs text-gray-500">Applications</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{referralApplications}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="text-xs text-gray-500">Referral Earnings</p>
                            <p className="text-xl font-bold text-green-600">${referralEarnings.toFixed(2)}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Referral bonuses are added to your wallet balance automatically.</p>
                </div>
                
                <div className="mt-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Input id="country" name="country" label="Country" type="text" value={formData.country || ''} onChange={handleChange} />
                        </div>
                         {user.role === UserRole.JobSeeker && <>
                             <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                     <label htmlFor="profileBio" className="block text-gray-700 dark:text-gray-300 text-sm font-bold">Profile Bio</label>
                                     <button type="button" onClick={handleImproveBio} disabled={isGenerating} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                                         {isGenerating ? <><Spinner /> Improving...</> : "Improve with AI ✨"}
                                     </button>
                                </div>
                                <textarea id="profileBio" name="profileBio" rows={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" value={formData.profileBio} onChange={handleChange}></textarea>
                             </div>
                             {/* ... other seeker fields ... */}
                         </>}
                         {/* ... other form fields ... */}
                         <Button type="submit">Update Profile</Button>
                    </form>
                </div>
                
                 {user.role === UserRole.JobSeeker && (
                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Video Introduction</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Upload a short video (max 1 min) to introduce yourself. Gemini will create a summary for your profile.</p>
                        <Input id="video-upload" label="Upload Video" type="file" accept="video/*" onChange={handleVideoUpload} />
                        {isAnalyzingVideo && <div className="flex items-center text-gray-600 dark:text-gray-300"><Spinner/> <p>Analyzing video, this may take a moment...</p></div>}
                        {videoSummary && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="font-bold mb-2">AI Video Summary:</h4>
                                <p className="italic text-gray-800 dark:text-gray-200">"{videoSummary}"</p>
                                <Button className="w-auto mt-3" onClick={() => setFormData(p => ({...p, profileBio: `${p.profileBio || ''}\n\nVideo Intro Summary:\n${videoSummary}`}))}>Add Summary to Bio</Button>
                            </div>
                        )}
                    </div>
                 )}

                {/* ... reviews section ... */}
            </div>
            {/* ... review modal ... */}
        </div>
    );
};

export default Profile;
