import React from 'react';
import { useAuth } from '../hooks/useAuth';

const GodModeBanner: React.FC = () => {
    const { user, exitGodMode } = useAuth();

    if (!user) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-yellow-900 p-2 text-center z-[100] flex justify-center items-center gap-4 shadow-lg">
            <p className="font-bold text-sm sm:text-base">
                GODMODE ACTIVE: Viewing as {user.name} ({user.role})
            </p>
            <button
                onClick={exitGodMode}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
                Exit GodMode
            </button>
        </div>
    );
};

export default GodModeBanner;