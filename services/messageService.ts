
import { storageService } from './storageService';
import { Message } from '../types';
import { supabaseTableSyncService } from './supabaseTableSyncService';

export const messageService = {
    getConversations: (userId: string): { withUser: string, messages: Message[] }[] => {
        const messages = storageService.getMessages();
        const userMessages = messages.filter(m => m.fromUserId === userId || m.toUserId === userId);
        
        const conversations = userMessages.reduce((acc, msg) => {
            const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
            if (!acc[otherUserId]) {
                acc[otherUserId] = [];
            }
            acc[otherUserId].push(msg);
            return acc;
        }, {} as Record<string, Message[]>);

        return Object.entries(conversations).map(([withUser, messages]) => ({
            withUser,
            messages: messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        }));
    },

    getMessagesWithUser: (userId1: string, userId2: string): Message[] => {
        const messages = storageService.getMessages();
        return messages
            .filter(m => (m.fromUserId === userId1 && m.toUserId === userId2) || (m.fromUserId === userId2 && m.toUserId === userId1))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },

    sendMessage: (fromUserId: string, toUserId: string, content: string): Message => {
        const messages = storageService.getMessages();
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            fromUserId,
            toUserId,
            content,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        messages.push(newMessage);
        storageService.saveMessages(messages);
        supabaseTableSyncService.syncItem('messages', newMessage);
        return newMessage;
    }
};
