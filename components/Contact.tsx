import React from 'react';

const Contact: React.FC = () => {
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Contact</h1>
                <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                    <p>Email: support@gigconnect.com</p>
                    <p>Business Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
                    <p>For payout issues, include your payout request ID.</p>
                </div>
            </div>
        </div>
    );
};

export default Contact;

