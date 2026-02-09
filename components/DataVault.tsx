import React, { useRef, useState } from 'react';
import Button from './Button';
import { storageService } from '../services/storageService';

const DataVault: React.FC = () => {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [status, setStatus] = useState('');

    const handleExport = () => {
        const data = storageService.exportDatabase();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `gigconnect-backup-${date}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setStatus('Database exported successfully.');
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            storageService.importDatabase(data);
            setStatus('Database imported successfully. Refresh the page to load the new data.');
        } catch (error) {
            setStatus('Failed to import database. Please upload a valid backup file.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Data Vault</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Export or import the local database used for this preview environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleExport} className="w-full sm:w-auto">Export Database</Button>
                <Button onClick={() => fileRef.current?.click()} variant="secondary" className="w-full sm:w-auto">Import Database</Button>
                <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
            </div>
            {status && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{status}</p>}
        </div>
    );
};

export default DataVault;

