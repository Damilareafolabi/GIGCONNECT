
import { User, Job, Application, Message, Notification, UserRole, JobStatus, Review, LogEntry, Subscriber, AutomationSettings, AutomationEvent, RadarFinding, RadarScan, GrowthCampaign, OutreachLead, HealingAction, HealthIncident, WalletTransaction, PayoutRequest, PlatformTransaction, BlogPost, ReferralEvent } from '../types';

const get = <T,>(key: string): T | null => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error getting item ${key} from localStorage`, error);
        return null;
    }
};

const set = <T,>(key: string, value: T): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting item ${key} in localStorage`, error);
    }
};

const DATABASE_KEYS = [
    'users',
    'jobs',
    'applications',
    'messages',
    'notifications',
    'reviews',
    'errorLogs',
    'subscribers',
    'automationSettings',
    'automationEvents',
    'radarFindings',
    'radarScans',
    'growthCampaigns',
    'outreachLeads',
    'healingActions',
    'healthIncidents',
    'walletTransactions',
    'payoutRequests',
    'platformTransactions',
    'platformRevenue',
    'blogPosts',
    'referralEvents',
] as const;

const seedData = () => {
    const hasSupabase = Boolean((import.meta as any)?.env?.VITE_SUPABASE_URL && (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY);
    const shouldSeed = !hasSupabase || String((import.meta as any)?.env?.VITE_SEED_LOCAL || '').toLowerCase() === 'true';
    if (!shouldSeed) return;
    if (!get('users')) {
        const admin: User = { id: 'admin-1', email: 'admin@gig.co', password: 'admin', name: 'Admin User', role: UserRole.Admin, approved: true, referralCode: 'ref-admin' };
        const employer: User = { id: 'employer-1', email: 'employer@gig.co', password: 'password', name: 'Tech Solutions Inc.', role: UserRole.Employer, approved: true, companyName: 'Tech Solutions Inc.', companyDescription: 'We build amazing software.', industry: 'Technology', website: 'https://example.com', referralCode: 'ref-employer' };
        const seeker: User = { id: 'seeker-1', email: 'seeker@gig.co', password: 'password', name: 'Jane Doe', role: UserRole.JobSeeker, approved: true, skills: ['React', 'TypeScript', 'Node.js'], profileBio: 'Experienced full-stack developer seeking new challenges.', experienceLevel: 'Expert', availability: 'Full-time', portfolioLinks: ['https://github.com/janedoe'], referralCode: 'ref-seeker' };
        set<User[]>('users', [admin, employer, seeker]);

        const jobs: Job[] = [
            {
                id: 'job-1',
                employerId: 'employer-1',
                title: 'Senior React Developer',
                description: 'Build our next-gen platform using React and TypeScript.',
                category: 'Web Development',
                payment: 5000,
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                status: JobStatus.Open,
                createdAt: new Date().toISOString(),
                isFeatured: true,
                paymentStatus: 'Unpaid',
                workType: 'Remote',
                verificationStatus: 'Verified',
                sourceName: 'Tech Solutions Inc.',
                sourceWebsite: 'https://example.com',
            },
            {
                id: 'job-2',
                employerId: 'employer-1',
                title: 'UI/UX Designer',
                description: 'Design beautiful and intuitive user interfaces.',
                category: 'Graphic Design',
                payment: 3500,
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                status: JobStatus.Open,
                createdAt: new Date().toISOString(),
                isFeatured: false,
                paymentStatus: 'Unpaid',
                workType: 'Hybrid',
                location: 'Lagos, Nigeria',
                verificationStatus: 'Pending',
                sourceName: 'Tech Solutions Inc.',
                sourceWebsite: 'https://example.com',
            },
            {
                id: 'job-3',
                employerId: 'employer-1',
                title: 'Backend Node.js Engineer',
                description: 'Develop and maintain our server-side logic.',
                category: 'Web Development',
                payment: 4500,
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                status: JobStatus.Open,
                createdAt: new Date().toISOString(),
                isFeatured: false,
                paymentStatus: 'Unpaid',
                workType: 'Remote',
                verificationStatus: 'Pending',
                sourceName: 'Tech Solutions Inc.',
                sourceWebsite: 'https://example.com',
            },
        ];
        set<Job[]>('jobs', jobs);

        const applications: Application[] = [];
        set<Application[]>('applications', applications);

        const messages: Message[] = [];
        set<Message[]>('messages', messages);

        const notifications: Notification[] = [];
        set<Notification[]>('notifications', notifications);
        
        const reviews: Review[] = [];
        set<Review[]>('reviews', reviews);

        const errorLogs: LogEntry[] = [];
        set<LogEntry[]>('errorLogs', errorLogs);

        if (!get('subscribers')) {
            set<Subscriber[]>('subscribers', []);
        }

        if (!get('automationSettings')) {
            const defaultSettings: AutomationSettings = {
                autoMatch: true,
                autoModeration: true,
                innovationRadar: true,
                growthHunt: true,
                selfHealing: true,
                autoPublisher: true,
                autoBlog: true,
            };
            set<AutomationSettings>('automationSettings', defaultSettings);
        }

        if (!get('automationEvents')) set<AutomationEvent[]>('automationEvents', []);
        if (!get('radarFindings')) set<RadarFinding[]>('radarFindings', []);
        if (!get('radarScans')) set<RadarScan[]>('radarScans', []);
        if (!get('growthCampaigns')) set<GrowthCampaign[]>('growthCampaigns', []);
        if (!get('outreachLeads')) set<OutreachLead[]>('outreachLeads', []);
        if (!get('healingActions')) set<HealingAction[]>('healingActions', []);
        if (!get('healthIncidents')) set<HealthIncident[]>('healthIncidents', []);
        if (!get('walletTransactions')) set<WalletTransaction[]>('walletTransactions', []);
        if (!get('payoutRequests')) set<PayoutRequest[]>('payoutRequests', []);
        if (!get('platformTransactions')) set<PlatformTransaction[]>('platformTransactions', []);
        if (!get('platformRevenue')) set<number>('platformRevenue', 0);
        if (!get('blogPosts')) {
            const now = new Date().toISOString();
            const seedPosts: BlogPost[] = [
                {
                    id: `blog-${Date.now()}-1`,
                    title: 'How to Win Your First Client on GigConnect',
                    slug: 'win-your-first-client-on-gigconnect',
                    excerpt: 'A simple, proven path to landing your first paid gig with strong proposals and fast delivery.',
                    content: 'Landing your first client is about clarity and speed. Start with a focused profile, apply to small gigs, and write proposals that show you read the brief. Deliver fast and request a review. Consistency beats perfection.',
                    category: 'Freelancer Success',
                    tags: ['freelance', 'clients', 'proposals'],
                    authorName: 'GigConnect Team',
                    status: 'Published',
                    createdAt: now,
                    publishedAt: now,
                    isAi: false,
                },
                {
                    id: `blog-${Date.now()}-2`,
                    title: 'Hiring in 2026: The Skills Clients Want Most',
                    slug: 'hiring-2026-skills-clients-want',
                    excerpt: 'The fastest-growing freelance categories and how to position your services.',
                    content: 'Clients are prioritizing speed, clarity, and measurable impact. The hottest areas remain web development, design systems, marketing automation, data dashboards, and AI-assisted workflows. Focus on outcomes and offer clear milestones.',
                    category: 'Work News',
                    tags: ['trends', 'skills', 'hiring'],
                    authorName: 'GigConnect Team',
                    status: 'Published',
                    createdAt: now,
                    publishedAt: now,
                    isAi: false,
                },
            ];
            set<BlogPost[]>('blogPosts', seedPosts);
        }
        if (!get('referralEvents')) set<ReferralEvent[]>('referralEvents', []);
    }
};

seedData();

export const storageService = {
    getUsers: () => get<User[]>('users') || [],
    saveUsers: (users: User[]) => set('users', users),
    getJobs: () => get<Job[]>('jobs') || [],
    saveJobs: (jobs: Job[]) => set('jobs', jobs),
    getApplications: () => get<Application[]>('applications') || [],
    saveApplications: (applications: Application[]) => set('applications', applications),
    getMessages: () => get<Message[]>('messages') || [],
    saveMessages: (messages: Message[]) => set('messages', messages),
    getNotifications: () => get<Notification[]>('notifications') || [],
    saveNotifications: (notifications: Notification[]) => set('notifications', notifications),
    getReviews: () => get<Review[]>('reviews') || [],
    saveReviews: (reviews: Review[]) => set('reviews', reviews),
    getErrorLogs: () => get<LogEntry[]>('errorLogs') || [],
    saveErrorLogs: (logs: LogEntry[]) => set('errorLogs', logs),
    getSubscribers: () => get<Subscriber[]>('subscribers') || [],
    saveSubscribers: (subscribers: Subscriber[]) => set('subscribers', subscribers),
    getWalletTransactions: () => get<WalletTransaction[]>('walletTransactions') || [],
    saveWalletTransactions: (transactions: WalletTransaction[]) => set('walletTransactions', transactions),
    getPayoutRequests: () => get<PayoutRequest[]>('payoutRequests') || [],
    savePayoutRequests: (requests: PayoutRequest[]) => set('payoutRequests', requests),
    getPlatformTransactions: () => get<PlatformTransaction[]>('platformTransactions') || [],
    savePlatformTransactions: (transactions: PlatformTransaction[]) => set('platformTransactions', transactions),
    getPlatformRevenue: () => get<number>('platformRevenue') || 0,
    savePlatformRevenue: (amount: number) => set('platformRevenue', amount),
    getBlogPosts: () => get<BlogPost[]>('blogPosts') || [],
    saveBlogPosts: (posts: BlogPost[]) => set('blogPosts', posts),
    getReferralEvents: () => get<ReferralEvent[]>('referralEvents') || [],
    saveReferralEvents: (events: ReferralEvent[]) => set('referralEvents', events),
    getAutomationSettings: () => get<AutomationSettings>('automationSettings'),
    saveAutomationSettings: (settings: AutomationSettings) => set('automationSettings', settings),
    getAutomationEvents: () => get<AutomationEvent[]>('automationEvents') || [],
    saveAutomationEvents: (events: AutomationEvent[]) => set('automationEvents', events),
    getRadarFindings: () => get<RadarFinding[]>('radarFindings') || [],
    saveRadarFindings: (findings: RadarFinding[]) => set('radarFindings', findings),
    getRadarScans: () => get<RadarScan[]>('radarScans') || [],
    saveRadarScans: (scans: RadarScan[]) => set('radarScans', scans),
    getGrowthCampaigns: () => get<GrowthCampaign[]>('growthCampaigns') || [],
    saveGrowthCampaigns: (campaigns: GrowthCampaign[]) => set('growthCampaigns', campaigns),
    getOutreachLeads: () => get<OutreachLead[]>('outreachLeads') || [],
    saveOutreachLeads: (leads: OutreachLead[]) => set('outreachLeads', leads),
    getHealingActions: () => get<HealingAction[]>('healingActions') || [],
    saveHealingActions: (actions: HealingAction[]) => set('healingActions', actions),
    getHealthIncidents: () => get<HealthIncident[]>('healthIncidents') || [],
    saveHealthIncidents: (incidents: HealthIncident[]) => set('healthIncidents', incidents),
    getBackup: (key: string) => get<any>(key),
    saveBackup: (key: string, data: any) => set(key, data),
    clearBackup: (key: string) => window.localStorage.removeItem(key),
    exportDatabase: () => {
        return DATABASE_KEYS.reduce((acc, key) => {
            acc[key] = get<any>(key);
            return acc;
        }, {} as Record<string, any>);
    },
    importDatabase: (data: Record<string, any>) => {
        DATABASE_KEYS.forEach(key => {
            if (key in data) {
                set(key, data[key]);
            }
        });
    },
};
