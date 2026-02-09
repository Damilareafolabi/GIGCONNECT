
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Message, User, NavigateFunction } from '../types';
import { messageService } from '../services/messageService';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import Spinner from './Spinner';

interface MessagesProps {
    navigate: NavigateFunction;
    conversationUserId?: string;
}

const Messages: React.FC<MessagesProps> = ({ navigate, conversationUserId }) => {
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const [conversations, setConversations] = useState<Map<string, User>>(new Map());
    const [selectedConversation, setSelectedConversation] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        if (!currentUser) return;
        const convos = messageService.getConversations(currentUser.id);
        const users = storageService.getUsers();
        const userMap = new Map<string, User>();
        convos.forEach(c => {
            const otherUser = users.find(u => u.id === c.withUser);
            if (otherUser) userMap.set(otherUser.id, otherUser);
        });
        setConversations(userMap);
        
        if (conversationUserId) {
            const userToSelect = users.find(u => u.id === conversationUserId);
            if (userToSelect) setSelectedConversation(userToSelect);
        } else if (userMap.size > 0) {
            setSelectedConversation(Array.from(userMap.values())[0]);
        }
    }, [currentUser, conversationUserId]);

    useEffect(() => {
        if (selectedConversation && currentUser) {
            setMessages(messageService.getMessagesWithUser(currentUser.id, selectedConversation.id));
        } else {
            setMessages([]);
        }
    }, [selectedConversation, currentUser]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !selectedConversation) return;
        messageService.sendMessage(currentUser.id, selectedConversation.id, newMessage);
        setNewMessage('');
        setMessages(messageService.getMessagesWithUser(currentUser.id, selectedConversation.id));
    };

    const handleSuggestReply = async () => {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.fromUserId === currentUser?.id) {
            showToast("Can't suggest a reply to your own message.", "info");
            return;
        }
        setIsSuggesting(true);
        try {
            const suggestion = await geminiService.suggestMessageReply(lastMessage.content);
            setNewMessage(suggestion);
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsSuggesting(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="container mx-auto h-[calc(100vh-8rem)] flex">
            {/* Conversation List */}
            {/* ... same as before ... */}

            {/* Message View */}
            <div className={`w-full md:w-2/3 flex-col bg-gray-50 dark:bg-gray-900 ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* ... message header ... */}
                        <div className="flex-grow p-4 overflow-y-auto">
                            {/* ... messages mapping ... */}
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                             <form onSubmit={handleSendMessage} className="flex">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-grow shadow-sm appearance-none border rounded-l-md w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:ring" />
                                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-r-md hover:bg-indigo-700">Send</button>
                            </form>
                            <div className="flex justify-end mt-2">
                                <button onClick={handleSuggestReply} disabled={isSuggesting || messages.length === 0} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center disabled:opacity-50">
                                     {isSuggesting ? <><Spinner /> Suggesting...</> : "Suggest Reply ✨"}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
