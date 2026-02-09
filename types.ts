
export enum UserRole {
    JobSeeker = 'JobSeeker',
    Employer = 'Employer',
    Admin = 'Admin',
}

export enum JobStatus {
    PendingApproval = 'Pending Approval',
    Open = 'Open',
    InProgress = 'In Progress',
    Completed = 'Completed',
    Rejected = 'Rejected',
}

export enum ApplicationStatus {
    Submitted = 'Submitted',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
}

export interface User {
    id: string;
    email: string;
    password?: string; // Should not be stored in frontend state long-term
    name: string;
    role: UserRole;
    approved: boolean;

    // Job Seeker specific
    profileBio?: string;
    skills?: string[];
    portfolioLinks?: string[];
    experienceLevel?: 'Entry' | 'Intermediate' | 'Expert';
    availability?: 'Full-time' | 'Part-time' | 'Contract';

    // Employer specific
    companyName?: string;
    companyDescription?: string;
    website?: string;
    industry?: string;

    // Payout details
    bankDetails?: BankDetails;
}

export interface Job {
    id: string;
    employerId: string;
    title: string;
    description: string;
    category: string;
    payment: number;
    deadline: string;
    status: JobStatus;
    createdAt: string;
    isFeatured: boolean;
    hiredUserId?: string;
    paymentStatus?: 'Unpaid' | 'Paid';
    paidAmount?: number;
    platformFee?: number;
    paidAt?: string;
    workType?: 'Remote' | 'On-site' | 'Hybrid';
    location?: string;
    sourceName?: string;
    sourceWebsite?: string;
    sourceEmail?: string;
    sourcePhone?: string;
    verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
    verificationNote?: string;
    safetyNotes?: string;
}

export interface Application {
    id: string;
    jobId: string;
    jobSeekerId: string;
    coverLetter: string;
    status: ApplicationStatus;
    appliedAt: string;
}

export interface Message {
    id: string;
    fromUserId: string;
    toUserId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    link?: {
        view: string;
        params: object;
    };
    isRead: boolean;
    createdAt: string;
}

export interface Review {
    id: string;
    jobId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    stack?: string;
}

export interface Subscriber {
    id: string;
    email: string;
    phone?: string;
    subscribedAt: string;
}

export interface BankDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
    swiftCode?: string;
    country?: string;
}

export interface WalletTransaction {
    id: string;
    userId: string;
    direction: 'in' | 'out';
    type: 'earning' | 'payment' | 'payout' | 'refund' | 'hold';
    amount: number;
    description: string;
    jobId?: string;
    createdAt: string;
}

export interface PayoutRequest {
    id: string;
    userId: string;
    amount: number;
    method: 'Bank Transfer' | 'Manual Transfer';
    bankDetails: BankDetails;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
    note?: string;
    createdAt: string;
    processedAt?: string;
}

export interface PlatformTransaction {
    id: string;
    amount: number;
    jobId?: string;
    payerId?: string;
    payeeId?: string;
    createdAt: string;
    description: string;
}

export interface ExternalPaymentDetails {
    method: string;
    reference?: string;
    note?: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags?: string[];
    authorName: string;
    status: 'Draft' | 'Published';
    createdAt: string;
    updatedAt?: string;
    publishedAt?: string;
    coverImage?: string;
    isAi?: boolean;
    source?: string;
}

export interface AutomationSettings {
    autoMatch: boolean;
    autoModeration: boolean;
    innovationRadar: boolean;
    growthHunt: boolean;
    selfHealing: boolean;
    autoPublisher: boolean;
    autoBlog: boolean;
}

export interface AutomationEvent {
    id: string;
    type: 'autoMatch' | 'autoModeration' | 'innovationRadar' | 'growthHunt' | 'selfHealing' | 'autoPublisher' | 'autoBlog';
    message: string;
    status: 'success' | 'warning' | 'error';
    createdAt: string;
}

export interface RadarFinding {
    id: string;
    category: string;
    trend: string;
    impact: 'Low' | 'Medium' | 'High';
    suggestion: string;
    sourceType: 'marketplace' | 'community' | 'product' | 'pricing';
    scannedAt: string;
}

export interface RadarScan {
    id: string;
    startedAt: string;
    finishedAt: string;
    findingsCount: number;
    summary: string;
}

export interface GrowthCampaign {
    id: string;
    name: string;
    channel: 'Email' | 'Social' | 'Community' | 'Partnerships' | 'Referral';
    offer: string;
    status: 'Draft' | 'Queued' | 'Running' | 'Paused' | 'Completed';
    message: string;
    createdAt: string;
}

export interface OutreachLead {
    id: string;
    segment: string;
    intentSignal: string;
    suggestedAction: string;
    outreachMessage: string;
    createdAt: string;
}

export interface HealingAction {
    id: string;
    action: string;
    result: 'Fixed' | 'Skipped' | 'Needs Review';
    details: string;
    createdAt: string;
}

export interface HealthIncident {
    id: string;
    severity: 'Low' | 'Medium' | 'High';
    summary: string;
    createdAt: string;
}


export type View = {
    name: string;
    params?: any;
};

export type NavigateFunction = (viewName: string, params?: object) => void;
