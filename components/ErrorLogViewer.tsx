
import React, { useState, useEffect } from 'react';
import { LogEntry } from '../types';
import { errorLogService } from '../services/errorLogService';
import Button from './Button';

const ErrorLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        setLogs(errorLogService.getLogs());
    }, []);

    const handleClearLogs = () => {
        if (window.confirm("Are you sure you want to clear all error logs?")) {
            errorLogService.clearLogs();
            setLogs([]);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">System Health & Error Logs</h3>
                <Button onClick={handleClearLogs} variant="danger" className="w-auto">Clear Logs</Button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="font-semibold text-red-500">{log.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                        <pre className="text-xs text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">{log.stack}</pre>
                    </div>
                )) : <p className="text-center text-gray-500">No errors logged. System is healthy!</p>}
            </div>
        </div>
    );
};

export default ErrorLogViewer;
