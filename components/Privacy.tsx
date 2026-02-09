import React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Privacy Policy</h1>
                <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                    <p>We respect your privacy. This platform stores profile and activity data locally in your browser for this demo environment.</p>
                    <p>When the production platform is live, we will only collect the information needed to provide marketplace services, payouts, and security.</p>
                    <p>We do not sell personal data. We only share information required to complete payments and comply with regulations.</p>
                    <p>If you have questions, contact us via the Contact page.</p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;

