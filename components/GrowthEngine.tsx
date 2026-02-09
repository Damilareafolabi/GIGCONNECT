import React, { useEffect, useState } from 'react';
import { GrowthCampaign, OutreachLead } from '../types';
import { growthService } from '../services/growthService';
import Button from './Button';
import Input from './Input';

const GrowthEngine: React.FC = () => {
    const [campaigns, setCampaigns] = useState<GrowthCampaign[]>([]);
    const [leads, setLeads] = useState<OutreachLead[]>([]);
    const [campaignName, setCampaignName] = useState('Free Access Launch');
    const [channel, setChannel] = useState<GrowthCampaign['channel']>('Email');

    const refresh = () => {
        setCampaigns(growthService.getCampaigns());
        setLeads(growthService.getLeads());
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleCreateCampaign = () => {
        growthService.createCampaign(campaignName, channel);
        refresh();
    };

    const handleGenerateLeads = () => {
        growthService.generateLeads();
        refresh();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Growth Engine</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Self-hunting growth system that builds free-entry campaigns and outreach leads.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-6">
                <Input
                    id="campaignName"
                    label="Campaign Name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                />
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Channel</label>
                    <select
                        value={channel}
                        onChange={(e) => setChannel(e.target.value as GrowthCampaign['channel'])}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                        <option>Email</option>
                        <option>Social</option>
                        <option>Community</option>
                        <option>Partnerships</option>
                        <option>Referral</option>
                    </select>
                </div>
                <Button onClick={handleCreateCampaign} className="w-full md:w-auto">Create Campaign</Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <Button onClick={handleGenerateLeads} variant="secondary" className="w-full sm:w-auto">
                    Generate Outreach Leads
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold mb-3">Campaigns</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {campaigns.length === 0 && <p className="text-sm text-gray-500">No campaigns created yet.</p>}
                        {campaigns.map(campaign => (
                            <div key={campaign.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{campaign.name}</span>
                                    <span className="text-xs text-gray-500">{campaign.channel}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-200">{campaign.offer}</p>
                                <p className="text-xs text-gray-500">Status: {campaign.status}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-bold mb-3">Outreach Leads</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {leads.length === 0 && <p className="text-sm text-gray-500">No leads yet. Generate leads to get started.</p>}
                        {leads.map(lead => (
                            <div key={lead.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{lead.segment}</p>
                                <p className="text-xs text-gray-500">{lead.intentSignal}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">{lead.outreachMessage}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthEngine;

