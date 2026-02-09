import React from 'react';
import Button from './Button';

interface WelcomeProps {
    onLoginClick: () => void;
    onSignupClick: () => void;
}

const Logo = () => (
    <div className="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" className="w-32 h-auto">
            <defs>
                <linearGradient id="briefcaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#3c82f6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <path d="M170,120 H30 C19,120 10,111 10,100 V60 C10,49 19,40 30,40 H170 C181,40 190,49 190,60 V100 C190,111 181,120 170,120 Z" fill="url(#briefcaseGradient)" className="animate-bob" />
            <path d="M125,40 V30 C125,21.7 118.3,15 110,15 H90 C81.7,15 75,21.7 75,30 V40" fill="none" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" className="animate-swing" style={{ transformOrigin: '100px 40px' }} />
            <rect x="90" y="70" width="20" height="15" fill="#f0f9ff" rx="3" />
            <path d="M160,50 Q100,25 40,50" fill="none" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round" />
            <circle cx="155" cy="40" r="10" fill="#fb923c" className="animate-float-in" style={{ animationDelay: '0.2s' }} />
            <circle cx="100" cy="30" r="12" fill="#4ade80" className="animate-float-in" style={{ animationDelay: '0s' }} />
            <circle cx="45" cy="40" r="10" fill="#facc15" className="animate-float-in" style={{ animationDelay: '0.4s' }} />
        </svg>
        <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-300 mt-2 animate-fade-in-text" style={{ animationDelay: '0.6s' }}>
            <span className="text-blue-800 dark:text-blue-300">Gig</span><span className="text-green-500">Connect</span>
        </h1>
    </div>
);

const Welcome: React.FC<WelcomeProps> = ({ onLoginClick, onSignupClick }) => {
    
    const CategoryButton: React.FC<{children: React.ReactNode}> = ({ children }) => (
        <button 
            onClick={onSignupClick}
            className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition"
        >
            {children}
        </button>
    );

    return (
        <div className="w-full">
            <div className="text-center">
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 max-w-lg mx-auto">
                    <Logo />
                    <p className="text-gray-600 dark:text-gray-300 mt-6 text-lg">
                        We Rise by Sharing Updates and Gigs - Let Everyone Smile
                    </p>
                     <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                        Free to join. We only earn when clients pay you through GigConnect.
                    </p>
                    <div className="mt-8 space-y-4">
                        <Button onClick={onSignupClick}>Find Jobs & Gigs</Button>
                        <Button onClick={onLoginClick} variant="secondary">Post an Opportunity</Button>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Explore by Category</h2>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6">
                    <CategoryButton>Latest Jobs</CategoryButton>
                    <CategoryButton>Remote Jobs</CategoryButton>
                    <CategoryButton>Quick Gigs</CategoryButton>
                    <CategoryButton>Internships</CategoryButton>
                    <CategoryButton>International</CategoryButton>
                </div>
            </div>

        </div>
    );
};

export default Welcome;
