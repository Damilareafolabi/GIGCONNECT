
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClasses = 'w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out';
    
    const variantClasses = {
        primary: 'bg-indigo-600 hover:bg-indigo-700',
        secondary: 'bg-gray-500 hover:bg-gray-600',
        danger: 'bg-red-600 hover:bg-red-700',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
