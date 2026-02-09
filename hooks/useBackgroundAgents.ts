import { useEffect } from 'react';
import { automationService } from '../services/automationService';
import { User } from '../types';

export const useBackgroundAgents = (user?: User | null) => {
    useEffect(() => {
        if (!user) return;

        const run = () => {
            try {
                automationService.runBackgroundTick(user);
            } catch (error) {
                console.error('Background agents failed:', error);
            }
        };

        run();
        const interval = setInterval(run, 45000);
        return () => clearInterval(interval);
    }, [user]);
};

