
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from './Input';
import Button from './Button';

interface LoginFormProps {
    onSignupClick: () => void;
    onBackClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSignupClick, onBackClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        try {
            const user = await login(email, password);
            if (!user) {
                setError('Invalid email or password.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during login.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
            <button onClick={onBackClick} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4">&larr; Back</button>
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">Login</h2>
                {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}
                <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                />
                <Input
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="******************"
                />
                <Button type="submit">
                    Sign In
                </Button>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Don't have an account?{' '}
                    <button type="button" onClick={onSignupClick} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Sign Up
                    </button>
                </p>
            </form>
        </div>
    );
};

export default LoginForm;
