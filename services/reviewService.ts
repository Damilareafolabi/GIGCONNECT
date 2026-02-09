
import { storageService } from './storageService';
import { Review } from '../types';
import { notificationService } from './notificationService';
import { supabaseTableSyncService } from './supabaseTableSyncService';

export const reviewService = {
    getReviewsForUser: (userId: string): Review[] => {
        const reviews = storageService.getReviews();
        return reviews.filter(r => r.revieweeId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    hasUserReviewedJob: (reviewerId: string, jobId: string): boolean => {
        const reviews = storageService.getReviews();
        return reviews.some(r => r.reviewerId === reviewerId && r.jobId === jobId);
    },

    createReview: (reviewData: Omit<Review, 'id' | 'createdAt'>): Review => {
        if (reviewService.hasUserReviewedJob(reviewData.reviewerId, reviewData.jobId)) {
            throw new Error("You have already submitted a review for this job.");
        }
        
        const reviews = storageService.getReviews();
        const newReview: Review = {
            ...reviewData,
            id: `review-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        reviews.push(newReview);
        storageService.saveReviews(reviews);
        supabaseTableSyncService.syncItem('reviews', newReview);

        // Notify the user who was reviewed
        notificationService.createNotification(
            newReview.revieweeId,
            `You have received a new ${newReview.rating}-star review!`,
            { view: 'profile', params: {} }
        );

        return newReview;
    },
};
