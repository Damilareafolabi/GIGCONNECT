
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Subscriber } from '../types';
import { NavigateFunction } from '../types';
import { supabaseTableSyncService } from '../services/supabaseTableSyncService';

interface FooterProps {
    navigate?: NavigateFunction;
    onNavigatePublic?: (view: 'terms' | 'privacy' | 'contact' | 'blog') => void;
}

const Footer: React.FC<FooterProps> = ({ navigate, onNavigatePublic }) => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [wantsSms, setWantsSms] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const isValidEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        const subscribers = storageService.getSubscribers();
        if (subscribers.some(sub => sub.email === email)) {
            setError('This email is already subscribed.');
            return;
        }

        const newSubscriber: Subscriber = {
            id: `sub-${Date.now()}`,
            email,
            phone: wantsSms ? phone : undefined,
            subscribedAt: new Date().toISOString(),
        };

        subscribers.push(newSubscriber);
        storageService.saveSubscribers(subscribers);
        supabaseTableSyncService.syncItem('subscribers', newSubscriber);

        setMessage('Thank you for subscribing!');
        setEmail('');
        setPhone('');
        setWantsSms(false);

        setTimeout(() => setMessage(''), 5000);
    };

    return (
        <footer className="bg-gray-200 dark:bg-gray-800 text-center p-6 mt-8">
            <div className="container mx-auto max-w-lg">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Stay Connected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get the latest jobs, news, and updates delivered to your inbox.</p>
                
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full max-w-sm p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        required
                    />
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="sms-check"
                            checked={wantsSms}
                            onChange={(e) => setWantsSms(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="sms-check" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Receive SMS updates
                        </label>
                    </div>

                    {wantsSms && (
                         <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            className="w-full max-w-sm p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                    )}

                    <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded hover:bg-indigo-700 transition">
                        Subscribe
                    </button>
                </form>

                {message && <p className="text-green-600 dark:text-green-400 mt-3">{message}</p>}
                {error && <p className="text-red-600 dark:text-red-400 mt-3">{error}</p>}
                
                <div className="mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <button onClick={() => (navigate ? navigate('blog') : onNavigatePublic?.('blog'))} className="hover:underline">Blog</button>
                        <button onClick={() => (navigate ? navigate('terms') : onNavigatePublic?.('terms'))} className="hover:underline">Terms</button>
                        <button onClick={() => (navigate ? navigate('privacy') : onNavigatePublic?.('privacy'))} className="hover:underline">Privacy</button>
                        <button onClick={() => (navigate ? navigate('contact') : onNavigatePublic?.('contact'))} className="hover:underline">Contact</button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Built and Developed by Afolabi Oluwadamilare Simeon
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
