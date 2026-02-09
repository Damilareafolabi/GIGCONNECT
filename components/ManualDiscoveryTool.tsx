
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';

const ManualDiscoveryTool: React.FC = () => {
    const [keyword, setKeyword] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState('');

    const generateMessage = () => {
        const message = `Hello,\n\nWhile exploring the web for growing businesses in the ${keyword || 'area'}, we came across you. GigConnect helps connect employers with skilled talent easily, and we'd be thrilled to help you find your next great hire.\n\nBest regards,\nThe GigConnect Team`;
        setGeneratedMessage(message);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Manual Discovery & Marketing Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter a keyword (e.g., business name, industry) to generate a suggested outreach message. All outreach must be sent manually.</p>
            <div className="flex gap-2 items-end">
                <Input
                    id="keyword"
                    label="Business Name or Keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <Button onClick={generateMessage} className="w-auto mb-4">Generate</Button>
            </div>
            {generatedMessage && (
                <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Generated Message (Copy Manually)</label>
                    <textarea
                        readOnly
                        value={generatedMessage}
                        rows={6}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                </div>
            )}
        </div>
    );
};

export default ManualDiscoveryTool;
