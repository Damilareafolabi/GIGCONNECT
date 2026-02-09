import React, { useState, useEffect } from 'react';
import { RadarFinding, RadarScan } from '../types';
import { radarService } from '../services/radarService';
import Button from './Button';

const InnovationRadar: React.FC = () => {
    const [findings, setFindings] = useState<RadarFinding[]>([]);
    const [scans, setScans] = useState<RadarScan[]>([]);

    const refresh = () => {
        setFindings(radarService.getFindings());
        setScans(radarService.getScans());
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleScan = () => {
        radarService.runScan();
        refresh();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h3 className="text-xl font-bold">Innovation Radar</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Background scan of marketplace trends and product ideas.</p>
                </div>
                <Button onClick={handleScan} className="w-auto">Run Scan</Button>
            </div>

            {scans.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500">Last scan: {new Date(scans[0].finishedAt).toLocaleString()}</p>
                    <p className="text-gray-800 dark:text-gray-100">{scans[0].summary}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {findings.map(finding => (
                    <div key={finding.id} className="border rounded-lg p-4 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{finding.category}</h4>
                            <span className="text-xs text-gray-500">{finding.impact} Impact</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{finding.trend}</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">Suggested Feature</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{finding.suggestion}</p>
                        <p className="text-xs text-gray-500 mt-2">Source: {finding.sourceType} - {new Date(finding.scannedAt).toLocaleString()}</p>
                    </div>
                ))}
                {findings.length === 0 && <p className="text-sm text-gray-500">No findings yet. Run a scan to generate ideas.</p>}
            </div>
        </div>
    );
};

export default InnovationRadar;
