import React, { useState, useEffect } from 'react';
import { automationService } from '../services/automationService';
import { AutomationSettings, AutomationEvent } from '../types';
import Button from './Button';

const AutomationCenter: React.FC = () => {
    const [settings, setSettings] = useState<AutomationSettings | null>(null);
    const [events, setEvents] = useState<AutomationEvent[]>([]);

    useEffect(() => {
        setSettings(automationService.getSettings());
        setEvents(automationService.getEvents());
        const interval = setInterval(() => {
            setEvents(automationService.getEvents());
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const updateSetting = (key: keyof AutomationSettings) => {
        if (!settings) return;
        const next = { ...settings, [key]: !settings[key] };
        setSettings(next);
        automationService.updateSettings(next);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Automation Center</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Control background AI tasks without disrupting the live platform experience.
            </p>

            {settings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {([
                        { key: 'autoMatch', label: 'Auto-Match Talent' },
                        { key: 'autoModeration', label: 'AI Moderation' },
                        { key: 'autoPublisher', label: 'Auto Job Publisher' },
                        { key: 'innovationRadar', label: 'Innovation Radar' },
                        { key: 'growthHunt', label: 'Growth Hunts' },
                        { key: 'autoBlog', label: 'Auto Blog Publisher' },
                        { key: 'selfHealing', label: 'Self-Healing Bot' },
                    ] as { key: keyof AutomationSettings; label: string }[]).map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                                <p className="text-xs text-gray-500">{settings[item.key] ? 'Enabled' : 'Disabled'}</p>
                            </div>
                            <Button
                                onClick={() => updateSetting(item.key)}
                                variant={settings[item.key] ? 'secondary' : 'primary'}
                                className="w-auto"
                            >
                                {settings[item.key] ? 'Disable' : 'Enable'}
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <div>
                <h4 className="font-bold mb-3">Latest Automation Events</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {events.length === 0 && <p className="text-sm text-gray-500">No automation events yet.</p>}
                    {events.map(event => (
                        <div key={event.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800 dark:text-gray-100">{event.type}</span>
                                <span className={`text-xs ${event.status === 'success' ? 'text-green-600' : event.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>{event.status}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{event.message}</p>
                            <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AutomationCenter;
