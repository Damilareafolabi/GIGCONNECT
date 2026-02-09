type InitializePayload = {
    amount: number;
    email: string;
    metadata?: Record<string, any>;
};

type InitializeResponse = {
    authorization_url: string;
    reference: string;
};

type VerifyResponse = {
    status: 'success' | 'failed' | 'abandoned' | string;
    reference: string;
    amount: number;
    paidAt?: string;
};

type ConfirmResponse = {
    status: 'success' | 'already_paid' | string;
    jobId: string;
    amount: number;
    fee?: number;
    net?: number;
    paidAt?: string;
};

const apiBase = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:4242';

export const paystackService = {
    initializePayment: async (payload: InitializePayload): Promise<InitializeResponse> => {
        const response = await fetch(`${apiBase}/paystack/initialize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to initialize payment.');
        }
        return response.json();
    },

    verifyPayment: async (reference: string): Promise<VerifyResponse> => {
        const response = await fetch(`${apiBase}/paystack/verify/${reference}`);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to verify payment.');
        }
        return response.json();
    },

    confirmPayment: async (reference: string, jobId: string): Promise<ConfirmResponse> => {
        const response = await fetch(`${apiBase}/paystack/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference, jobId }),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to confirm payment.');
        }
        return response.json();
    },
};
