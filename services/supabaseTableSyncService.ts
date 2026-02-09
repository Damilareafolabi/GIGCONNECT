import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';

type TableConfig<TLocal = any, TRow = any> = {
    table: string;
    idField: string;
    key: string;
    toRow: (item: TLocal) => TRow;
    fromRow: (row: TRow) => TLocal;
    save: (items: TLocal[]) => void;
};

const tableMap: Record<string, TableConfig> = {
    users: {
        table: 'profiles',
        idField: 'id',
        key: 'users',
        toRow: (user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            approved: user.approved,
            profile_bio: user.profileBio,
            skills: user.skills,
            portfolio_links: user.portfolioLinks,
            experience_level: user.experienceLevel,
            availability: user.availability,
            company_name: user.companyName,
            company_description: user.companyDescription,
            website: user.website,
            industry: user.industry,
            bank_details: user.bankDetails,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            approved: row.approved,
            profileBio: row.profile_bio,
            skills: row.skills,
            portfolioLinks: row.portfolio_links,
            experienceLevel: row.experience_level,
            availability: row.availability,
            companyName: row.company_name,
            companyDescription: row.company_description,
            website: row.website,
            industry: row.industry,
            bankDetails: row.bank_details,
        }),
        save: (items: any[]) => storageService.saveUsers(items),
    },
    jobs: {
        table: 'jobs',
        idField: 'id',
        key: 'jobs',
        toRow: (job: any) => ({
            id: job.id,
            employer_id: job.employerId,
            title: job.title,
            description: job.description,
            category: job.category,
            payment: job.payment,
            deadline: job.deadline,
            status: job.status,
            created_at: job.createdAt,
            is_featured: job.isFeatured,
            hired_user_id: job.hiredUserId,
            payment_status: job.paymentStatus,
            paid_amount: job.paidAmount,
            platform_fee: job.platformFee,
            paid_at: job.paidAt,
            work_type: job.workType,
            location: job.location,
            source_name: job.sourceName,
            source_website: job.sourceWebsite,
            source_email: job.sourceEmail,
            source_phone: job.sourcePhone,
            verification_status: job.verificationStatus,
            verification_note: job.verificationNote,
            safety_notes: job.safetyNotes,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            employerId: row.employer_id,
            title: row.title,
            description: row.description,
            category: row.category,
            payment: row.payment,
            deadline: row.deadline,
            status: row.status,
            createdAt: row.created_at,
            isFeatured: row.is_featured,
            hiredUserId: row.hired_user_id,
            paymentStatus: row.payment_status,
            paidAmount: row.paid_amount,
            platformFee: row.platform_fee,
            paidAt: row.paid_at,
            workType: row.work_type,
            location: row.location,
            sourceName: row.source_name,
            sourceWebsite: row.source_website,
            sourceEmail: row.source_email,
            sourcePhone: row.source_phone,
            verificationStatus: row.verification_status,
            verificationNote: row.verification_note,
            safetyNotes: row.safety_notes,
        }),
        save: (items: any[]) => storageService.saveJobs(items),
    },
    applications: {
        table: 'applications',
        idField: 'id',
        key: 'applications',
        toRow: (app: any) => ({
            id: app.id,
            job_id: app.jobId,
            job_seeker_id: app.jobSeekerId,
            cover_letter: app.coverLetter,
            status: app.status,
            applied_at: app.appliedAt,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            jobId: row.job_id,
            jobSeekerId: row.job_seeker_id,
            coverLetter: row.cover_letter,
            status: row.status,
            appliedAt: row.applied_at,
        }),
        save: (items: any[]) => storageService.saveApplications(items),
    },
    messages: {
        table: 'messages',
        idField: 'id',
        key: 'messages',
        toRow: (msg: any) => ({
            id: msg.id,
            from_user_id: msg.fromUserId,
            to_user_id: msg.toUserId,
            content: msg.content,
            timestamp: msg.timestamp,
            is_read: msg.isRead,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            fromUserId: row.from_user_id,
            toUserId: row.to_user_id,
            content: row.content,
            timestamp: row.timestamp,
            isRead: row.is_read,
        }),
        save: (items: any[]) => storageService.saveMessages(items),
    },
    notifications: {
        table: 'notifications',
        idField: 'id',
        key: 'notifications',
        toRow: (note: any) => ({
            id: note.id,
            user_id: note.userId,
            message: note.message,
            link: note.link,
            is_read: note.isRead,
            created_at: note.createdAt,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            userId: row.user_id,
            message: row.message,
            link: row.link,
            isRead: row.is_read,
            createdAt: row.created_at,
        }),
        save: (items: any[]) => storageService.saveNotifications(items),
    },
    reviews: {
        table: 'reviews',
        idField: 'id',
        key: 'reviews',
        toRow: (review: any) => ({
            id: review.id,
            job_id: review.jobId,
            reviewer_id: review.reviewerId,
            reviewee_id: review.revieweeId,
            rating: review.rating,
            comment: review.comment,
            created_at: review.createdAt,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            jobId: row.job_id,
            reviewerId: row.reviewer_id,
            revieweeId: row.reviewee_id,
            rating: row.rating,
            comment: row.comment,
            createdAt: row.created_at,
        }),
        save: (items: any[]) => storageService.saveReviews(items),
    },
    subscribers: {
        table: 'subscribers',
        idField: 'id',
        key: 'subscribers',
        toRow: (sub: any) => ({
            id: sub.id,
            email: sub.email,
            phone: sub.phone,
            subscribed_at: sub.subscribedAt,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            email: row.email,
            phone: row.phone,
            subscribedAt: row.subscribed_at,
        }),
        save: (items: any[]) => storageService.saveSubscribers(items),
    },
    walletTransactions: {
        table: 'wallet_transactions',
        idField: 'id',
        key: 'walletTransactions',
        toRow: (txn: any) => ({
            id: txn.id,
            user_id: txn.userId,
            direction: txn.direction,
            type: txn.type,
            amount: txn.amount,
            description: txn.description,
            job_id: txn.jobId,
            created_at: txn.createdAt,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            userId: row.user_id,
            direction: row.direction,
            type: row.type,
            amount: row.amount,
            description: row.description,
            jobId: row.job_id,
            createdAt: row.created_at,
        }),
        save: (items: any[]) => storageService.saveWalletTransactions(items),
    },
    payoutRequests: {
        table: 'payout_requests',
        idField: 'id',
        key: 'payoutRequests',
        toRow: (payout: any) => ({
            id: payout.id,
            user_id: payout.userId,
            amount: payout.amount,
            method: payout.method,
            bank_details: payout.bankDetails,
            status: payout.status,
            note: payout.note,
            created_at: payout.createdAt,
            processed_at: payout.processedAt,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            userId: row.user_id,
            amount: row.amount,
            method: row.method,
            bankDetails: row.bank_details,
            status: row.status,
            note: row.note,
            createdAt: row.created_at,
            processedAt: row.processed_at,
        }),
        save: (items: any[]) => storageService.savePayoutRequests(items),
    },
    platformTransactions: {
        table: 'platform_transactions',
        idField: 'id',
        key: 'platformTransactions',
        toRow: (txn: any) => ({
            id: txn.id,
            amount: txn.amount,
            job_id: txn.jobId,
            payer_id: txn.payerId,
            payee_id: txn.payeeId,
            created_at: txn.createdAt,
            description: txn.description,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            amount: row.amount,
            jobId: row.job_id,
            payerId: row.payer_id,
            payeeId: row.payee_id,
            createdAt: row.created_at,
            description: row.description,
        }),
        save: (items: any[]) => storageService.savePlatformTransactions(items),
    },
    blogPosts: {
        table: 'blog_posts',
        idField: 'id',
        key: 'blogPosts',
        toRow: (post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            tags: post.tags,
            author_name: post.authorName,
            status: post.status,
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            published_at: post.publishedAt,
            cover_image: post.coverImage,
            is_ai: post.isAi,
            source: post.source,
        }),
        fromRow: (row: any) => ({
            id: row.id,
            title: row.title,
            slug: row.slug,
            excerpt: row.excerpt,
            content: row.content,
            category: row.category,
            tags: row.tags,
            authorName: row.author_name,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            publishedAt: row.published_at,
            coverImage: row.cover_image,
            isAi: row.is_ai,
            source: row.source,
        }),
        save: (items: any[]) => storageService.saveBlogPosts(items),
    },
};

const hydrateKeys = Object.keys(tableMap);
const syncTimers: Record<string, number | undefined> = {};

const setHydrating = (value: boolean) => {
    (window as any).__SUPABASE_HYDRATING__ = value;
};

const upsertTable = async (config: TableConfig, data: any) => {
    if (!supabase || !isSupabaseConfigured) return;
    if (!Array.isArray(data)) return;
    if (data.length === 0) return;
    const rows = data.map((item) => config.toRow(item));
    await supabase.from(config.table).upsert(rows, { onConflict: config.idField });
};

const upsertItem = async (config: TableConfig, item: any) => {
    if (!supabase || !isSupabaseConfigured) return;
    if (!item) return;
    const row = config.toRow(item);
    await supabase.from(config.table).upsert(row, { onConflict: config.idField });
};

const deleteItem = async (config: TableConfig, id: string) => {
    if (!supabase || !isSupabaseConfigured) return;
    if (!id) return;
    await supabase.from(config.table).delete().eq(config.idField, id);
};

export const supabaseTableSyncService = {
    isEnabled: () => isSupabaseConfigured && !!supabase,

    hydrate: async () => {
        if (!supabase || !isSupabaseConfigured) return;
        setHydrating(true);
        try {
            for (const key of hydrateKeys) {
                const config = tableMap[key];
                const { data, error } = await supabase.from(config.table).select('*');
                if (error) {
                    console.warn(`Supabase hydrate failed for ${config.table}:`, error.message);
                    continue;
                }
                if (data) {
                    const items = (data as any[]).map((row) => config.fromRow(row));
                    config.save(items);
                }
            }
        } finally {
            setHydrating(false);
        }
    },

    scheduleSync: (key: string, data: any) => {
        if (!supabase || !isSupabaseConfigured) return;
        const config = tableMap[key];
        if (!config) return;
        if (syncTimers[key]) window.clearTimeout(syncTimers[key]);
        syncTimers[key] = window.setTimeout(() => {
            upsertTable(config, data);
        }, 1200);
    },

    syncItem: async (key: string, item: any) => {
        const config = tableMap[key];
        if (!config) return;
        await upsertItem(config, item);
    },

    deleteItem: async (key: string, id: string) => {
        const config = tableMap[key];
        if (!config) return;
        await deleteItem(config, id);
    },
};
