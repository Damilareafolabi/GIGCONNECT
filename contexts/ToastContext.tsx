import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import ReactDOM from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
    return ReactDOM.createPortal(
        <div className="fixed top-5 right-5 z-[1000] w-full max-w-sm space-y-3">
            {toasts.map(toast => {
                const baseClasses = 'text-white rounded-lg shadow-xl p-4 flex items-start';
                const variantClasses = {
                    success: 'bg-green-600',
                    error: 'bg-red-600',
                    info: 'bg-blue-600',
                };
    
                const Icon = () => {
                    if (toast.type === 'success') return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                    if (toast.type === 'error') return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                };
    
                return (
                    <div 
                        key={toast.id} 
                        className={`${baseClasses} ${variantClasses[toast.type]} animate-float-in`}
                        role="alert"
                    >
                        <Icon />
                        <p className="flex-grow text-sm font-medium">{toast.message}</p>
                        <button onClick={() => removeToast(toast.id)} className="ml-4 -mt-1 -mr-1 p-1 rounded-full hover:bg-black/20 flex-shrink-0" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )
            })}
        </div>,
        document.body
    );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(currentToasts => [...currentToasts, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
