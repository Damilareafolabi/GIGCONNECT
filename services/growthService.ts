import { GrowthCampaign, OutreachLead } from '../types';
import { storageService } from './storageService';

const segments = [
    'Early-stage SaaS founders',
    'Local agencies scaling delivery',
    'Ecommerce shops needing ops help',
    'Design studios with overflow',
    'B2B teams hiring fractional talent',
];

const intentSignals = [
    'Hiring post detected in community forums',
    'Recent funding announcement',
    'Rapid hiring on social channels',
    'Looking for freelancers in niche groups',
    'Project launch window in the next 30 days',
];

const offers = [
    'Zero upfront fees - pay only when you pay talent through GigConnect',
    'No posting fees, no subscriptions - success fee only on completed payments',
    'Priority matching included with success-fee-only pricing',
    'Free onboarding concierge with pay-only-when-paid terms',
    'Fast shortlist with no fees until you pay through the platform',
];

const channels: GrowthCampaign['channel'][] = ['Email', 'Social', 'Community', 'Partnerships', 'Referral'];

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const buildMessage = (segment: string, offer: string) => {
    return `Hi there,\n\nWe are helping ${segment.toLowerCase()} hire faster. GigConnect is free to join and uses a success-fee-only model, so we only earn when you pay talent through the platform. We can also offer ${offer.toLowerCase()} to help you move quickly. If you want a curated shortlist in 48 hours, reply and we will set it up.\n\nBest,\nGigConnect Growth Team`;
};

export const growthService = {
    getCampaigns: () => storageService.getGrowthCampaigns(),
    getLeads: () => storageService.getOutreachLeads(),

    createCampaign: (name: string, channel: GrowthCampaign['channel'], offer?: string): GrowthCampaign => {
        const finalOffer = offer || pick(offers);
        const campaign: GrowthCampaign = {
            id: `campaign-${Date.now()}`,
            name,
            channel,
            offer: finalOffer,
            status: 'Draft',
            message: buildMessage('growth-focused teams', finalOffer),
            createdAt: new Date().toISOString(),
        };
        const campaigns = storageService.getGrowthCampaigns();
        storageService.saveGrowthCampaigns([campaign, ...campaigns].slice(0, 50));
        return campaign;
    },

    generateLeads: (): OutreachLead[] => {
        const leadCount = 3 + Math.floor(Math.random() * 4);
        const leads: OutreachLead[] = Array.from({ length: leadCount }).map((_, index) => {
            const segment = pick(segments);
            const offer = pick(offers);
            return {
                id: `lead-${Date.now()}-${index}`,
                segment,
                intentSignal: pick(intentSignals),
                suggestedAction: 'Send a free-access invite with curated shortlist',
                outreachMessage: buildMessage(segment, offer),
                createdAt: new Date().toISOString(),
            };
        });
        storageService.saveOutreachLeads([...leads, ...storageService.getOutreachLeads()].slice(0, 50));
        return leads;
    },

    buildOutreachMessage: buildMessage,
};
