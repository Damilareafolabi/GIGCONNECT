import React, { useEffect, useState } from 'react';
import { HealingAction, HealthIncident } from '../types';
import { selfHealingService } from '../services/selfHealingService';
import Button from './Button';

const SelfHealingCenter: React.FC = () => {
    const [actions, setActions] = useState<HealingAction[]>([]);
    const [incidents, setIncidents] = useState<HealthIncident[]>([]);

    const refresh = () => {
        setActions(selfHealingService.getActions());
        setIncidents(selfHealingService.getIncidents());
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleRun = () => {
        selfHealingService.runSelfHeal();
        refresh();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold">Self-Healing Robot</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automated recovery routines running in the background.</p>
                </div>
                <Button onClick={handleRun} className="w-auto">Run Heal Now</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold mb-3">Recent Healing Actions</h4>
                    <div className="space-y-3 max-h-56 overflow-y-auto">
                        {actions.length === 0 && <p className="text-sm text-gray-500">No healing actions yet.</p>}
                        {actions.map(action => (
                            <div key={action.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{action.action}</span>
                                    <span className="text-xs text-gray-500">{action.result}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-200">{action.details}</p>
                                <p className="text-xs text-gray-500">{new Date(action.createdAt).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold mb-3">Health Incidents</h4>
                    <div className="space-y-3 max-h-56 overflow-y-auto">
                        {incidents.length === 0 && <p className="text-sm text-gray-500">No incidents detected.</p>}
                        {incidents.map(incident => (
                            <div key={incident.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{incident.summary}</span>
                                    <span className="text-xs text-gray-500">{incident.severity}</span>
                                </div>
                                <p className="text-xs text-gray-500">{new Date(incident.createdAt).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelfHealingCenter;

