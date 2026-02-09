import React from 'react';

interface EmptyStateProps {
    title: string;
    message: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, action }) => {
    return (
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>{message}</p>
            </div>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
