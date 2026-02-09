import React from 'react';

// FIX: Replaced the props interface with a discriminated union type to correctly handle props for both 'input' and 'select' elements. This resolves the TypeScript error related to incompatible 'onChange' handlers.
type CommonProps = {
    label: string;
    id: string;
};

type InputElementProps = CommonProps & {
    as?: 'input';
} & React.InputHTMLAttributes<HTMLInputElement>;

type SelectElementProps = CommonProps & {
    as: 'select';
    children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

type InputProps = InputElementProps | SelectElementProps;

const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
    const commonClasses = `shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500 ${className}`;

    return (
        <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={id}>
                {label}
            </label>
            {props.as === 'select' ? (
                <select
                    id={id}
                    className={commonClasses}
                    {...props}
                >
                    {props.children}
                </select>
            ) : (
                <input
                    id={id}
                    className={commonClasses}
                    {...props}
                />
            )}
        </div>
    );
};

export default Input;
