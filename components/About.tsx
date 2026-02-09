import React from 'react';

const Logo = () => (
    <div className="flex flex-col items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" className="w-24 h-auto">
            <defs>
                <linearGradient id="briefcaseGradientAbout" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#3c82f6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <path d="M170,120 H30 C19,120 10,111 10,100 V60 C10,49 19,40 30,40 H170 C181,40 190,49 190,60 V100 C190,111 181,120 170,120 Z" fill="url(#briefcaseGradientAbout)" />
            <path d="M125,40 V30 C125,21.7 118.3,15 110,15 H90 C81.7,15 75,21.7 75,30 V40" fill="none" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" />
            <rect x="90" y="70" width="20" height="15" fill="#f0f9ff" rx="3" />
            <path d="M160,50 Q100,25 40,50" fill="none" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round" />
            <circle cx="155" cy="40" r="10" fill="#fb923c" />
            <circle cx="100" cy="30" r="12" fill="#4ade80" />
            <circle cx="45" cy="40" r="10" fill="#facc15" />
        </svg>
        <h1 className="text-4xl font-bold text-blue-800 dark:text-blue-300 mt-2">
            <span className="text-blue-800 dark:text-blue-300">Gig</span><span className="text-green-500">Connect</span>
        </h1>
    </div>
);


const About: React.FC = () => {
    return (
        <div className="container mx-auto max-w-3xl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                <Logo />
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg italic">
                    We Rise by Sharing Updates and Gigs - Let Everyone Smile
                </p>
                <div className="mt-8 text-left space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                        GigConnect is a community-driven platform dedicated to connecting talented individuals with meaningful opportunities. Our mission is to create a transparent and efficient marketplace where job seekers can find their next gig, project, or career move, and employers can discover the perfect talent to drive their business forward.
                    </p>
                    <p>
                        GigConnect is free to join. We only earn when clients pay talent through our platform, so everyone can start without upfront fees.
                    </p>
                    <p>
                        Unlike traditional job boards, we focus on fostering a supportive ecosystem built on trust and collaboration. This platform is a prototype designed to showcase a user-centric approach to the gig economy, running entirely in your browser without the need for a backend server.
                    </p>
                </div>
                 <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Built and Developed by Afolabi Oluwadamilare Simeon
                    </p>
                 </div>
            </div>
        </div>
    );
};

export default About;

