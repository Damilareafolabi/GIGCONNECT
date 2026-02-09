import React from 'react';

const Safety: React.FC = () => {
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Safety Policy</h1>
                <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                    <p>GigConnect is committed to a safe marketplace. We require job source details (company name plus website, email, or phone) and label posts as Verified or Verification Pending.</p>
                    <p><strong>Important:</strong> GigConnect does not conduct background checks by default and cannot guarantee the safety of in-person meetings or job offers.</p>
                    <p>For any in-person work, we recommend:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        <li>Meet in safe public places for the first meeting.</li>
                        <li>Share meeting details with a trusted contact.</li>
                        <li>Do not share sensitive personal information early.</li>
                        <li>Use written agreements and confirm scope and payment terms.</li>
                    </ul>
                    <p>If you suspect fraud, unsafe behavior, or a scam, do not proceed and report the listing to support.</p>
                </div>
            </div>
        </div>
    );
};

export default Safety;
