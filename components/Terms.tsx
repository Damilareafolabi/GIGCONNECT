import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Terms of Service</h1>
                <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                    <p>GigConnect is free to join. We earn only when clients pay talent through the platform.</p>
                    <p>Users are responsible for the accuracy of their profile, job postings, and payout details.</p>
                    <p>Payments processed through GigConnect may include a success fee that funds platform operations.</p>
                    <p>Do not post illegal, harmful, or misleading content. Violations may result in account suspension.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;

