import { RadarFinding, RadarScan } from '../types';
import { storageService } from './storageService';

const categories = [
    { category: 'AI-Assisted Proposals', sourceType: 'product' as const },
    { category: 'Escrow & Milestone Payments', sourceType: 'pricing' as const },
    { category: 'Verified Talent Badges', sourceType: 'marketplace' as const },
    { category: 'Async Interviews', sourceType: 'community' as const },
    { category: 'AI Match Scoring', sourceType: 'product' as const },
    { category: 'Success-Fee Transparency', sourceType: 'pricing' as const },
];

const trendTemplates = [
    'Rising demand for outcome-based pricing.',
    'Clients requesting faster shortlists and pre-vetted talent.',
    'Higher conversion when proposals include a 30-second pitch.',
    'Employers prefer clear success-fee transparency.',
    'Talent wants clear timelines and milestone clarity.',
    'Growth spikes from community-driven referral loops.',
];

const suggestionTemplates = [
    'Launch a 48-hour fast shortlist lane for time-sensitive employers.',
    'Add proposal templates with AI-driven project plans.',
    'Bundle escrow into the job post flow to reduce churn.',
    'Introduce verified-skill badges with lightweight assessments.',
    'Create a referral flywheel with double-sided credits.',
    'Build a “project kickoff pack” that auto-generates milestones.',
];

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const generateFindings = (): RadarFinding[] => {
    const count = 5 + Math.floor(Math.random() * 4);
    return Array.from({ length: count }).map((_, index) => {
        const base = categories[index % categories.length];
        return {
            id: `radar-${Date.now()}-${index}`,
            category: base.category,
            trend: pick(trendTemplates),
            impact: pick(['Low', 'Medium', 'High']),
            suggestion: pick(suggestionTemplates),
            sourceType: base.sourceType,
            scannedAt: new Date().toISOString(),
        } as RadarFinding;
    });
};

export const radarService = {
    runScan: (): RadarScan => {
        const findings = generateFindings();
        const scans = storageService.getRadarScans();
        const scan: RadarScan = {
            id: `scan-${Date.now()}`,
            startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            finishedAt: new Date().toISOString(),
            findingsCount: findings.length,
            summary: `Generated ${findings.length} strategic signals from marketplace, pricing, and product trends.`,
        };

        storageService.saveRadarFindings([...findings, ...storageService.getRadarFindings()].slice(0, 50));
        storageService.saveRadarScans([scan, ...scans].slice(0, 20));
        return scan;
    },

    getFindings: () => storageService.getRadarFindings(),
    getScans: () => storageService.getRadarScans(),
};
