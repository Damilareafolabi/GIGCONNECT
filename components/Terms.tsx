import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Terms of Service</h1>
                <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                    <p>GigConnect is free to join. We earn only when clients pay talent through the platform.</p>
                    <p>Anyone can post jobs, but job sources must include verification details (company name plus website, email, or phone).</p>
                    <p>Job listings may appear as “Verification Pending” until reviewed by GigConnect administrators.</p>
                    <p>Users are responsible for the accuracy of their profile, job postings, and payout details.</p>
                    <p>Payments processed through GigConnect may include a success fee that funds platform operations.</p>
                    <p>Do not post illegal, harmful, or misleading content. Violations may result in account suspension.</p>
                    <p>Safety: GigConnect does not perform background checks by default and does not guarantee the safety of in-person meetings. Users must follow safety guidelines and meet in safe public locations.</p>
                    <p>By using the platform, you agree to our Safety Policy and confirm that any in-person work will follow local laws and safety best practices.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
