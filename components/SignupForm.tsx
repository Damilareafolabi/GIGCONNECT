import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from './Input';
import Button from './Button';
import { UserRole } from '../types';

interface SignupFormProps {
    onLoginClick: () => void;
    onBackClick: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onLoginClick, onBackClick }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'JobSeeker' | 'Employer'>(UserRole.JobSeeker);
    const [error, setError] = useState('');
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        try {
            await signup(name, email, password, role);
            // On successful signup, the user is automatically logged in by the auth context,
            // which triggers a re-render in App.tsx and displays the dashboard.
            // No success message is needed here as the component will unmount.
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
            <button onClick={onBackClick} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4">&larr; Back</button>
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">Create Your Account</h2>
                {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}
                
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">I am...</label>
                    <div className="flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setRole(UserRole.JobSeeker)} className={`px-4 py-2 rounded-l-md w-1/2 ${role === UserRole.JobSeeker ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                            Looking for Jobs
                        </button>
                        <button type="button" onClick={() => setRole(UserRole.Employer)} className={`px-4 py-2 rounded-r-md w-1/2 ${role === UserRole.Employer ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                            Hiring / Posting Jobs
                        </button>
                    </div>
                </div>

                <Input
                    id="name"
                    label={role === UserRole.JobSeeker ? "Full Name" : "Company Name"}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button type="submit">
                    Create Account
                </Button>
                 <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Already have an account?{' '}
                    <button type="button" onClick={onLoginClick} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Log In
                    </button>
                </p>
            </form>
        </div>
    );
};

export default SignupForm;