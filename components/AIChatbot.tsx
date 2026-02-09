import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { geminiService } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import Spinner from './Spinner';

type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

const AIChatbot: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [showResume, setShowResume] = useState(false);
    const [resumeData, setResumeData] = useState({
        name: '',
        role: '',
        summary: '',
        skills: '',
        experience: '',
        education: '',
        achievements: '',
    });

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Hi! I am GigConnect AI. I can help with resume building, profile improvements, proposals, and general platform guidance.',
                },
            ]);
        }
    }, [messages.length]);

    useEffect(() => {
        if (user) {
            setResumeData(prev => ({
                ...prev,
                name: user.name || prev.name,
                role: user.role === 'Employer' ? 'Employer' : 'Freelancer',
                skills: user.skills?.join(', ') || prev.skills,
                summary: user.profileBio || prev.summary,
            }));
        }
    }, [user]);

    const contextSummary = useMemo(() => {
        if (!user) return 'Guest user';
        return `User: ${user.name}, role: ${user.role}, skills: ${user.skills?.join(', ') || 'N/A'}`;
    }, [user]);

    const pushMessage = (role: ChatMessage['role'], content: string) => {
        setMessages(prev => [...prev, { id: `${role}-${Date.now()}`, role, content }]);
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;
        setInput('');
        pushMessage('user', text);
        setIsThinking(true);
        try {
            const reply = await geminiService.generateAssistantReply(text, contextSummary);
            pushMessage('assistant', reply);
        } catch (error: any) {
            showToast(error.message || 'AI assistant failed.', 'error');
        } finally {
            setIsThinking(false);
        }
    };

    const handleImproveBio = async () => {
        if (!user) {
            showToast('Please log in to improve your bio.', 'info');
            return;
        }
        setIsThinking(true);
        try {
            const improved = await geminiService.improveProfileBio(user.profileBio || '', user.skills || []);
            updateUser({ ...user, profileBio: improved });
            pushMessage('assistant', `Updated your profile bio:\n\n${improved}`);
        } catch (error: any) {
            showToast(error.message || 'Failed to improve bio.', 'error');
        } finally {
            setIsThinking(false);
        }
    };

    const handleGenerateResume = async () => {
        if (!resumeData.name || !resumeData.role) {
            showToast('Please provide at least name and role.', 'info');
            return;
        }
        setIsThinking(true);
        try {
            const resume = await geminiService.generateResume({
                name: resumeData.name,
                role: resumeData.role,
                summary: resumeData.summary,
                skills: resumeData.skills,
                experience: resumeData.experience,
                education: resumeData.education,
                achievements: resumeData.achievements,
            });
            pushMessage('assistant', `Here is your resume draft:\n\n${resume}`);
        } catch (error: any) {
            showToast(error.message || 'Failed to build resume.', 'error');
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1200]">
            {open && (
                <div className="mb-3 w-80 sm:w-96 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
                        <div>
                            <p className="font-semibold">GigConnect AI Assistant</p>
                            <p className="text-xs opacity-80">Resume, proposals, platform help</p>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white text-lg leading-none">×</button>
                    </div>

                    <div className="p-3 max-h-64 overflow-y-auto space-y-3">
                        {messages.map(msg => (
                            <div key={msg.id} className={`text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <span className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                                    {msg.content}
                                </span>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Spinner /> Thinking...
                            </div>
                        )}
                    </div>

                    <div className="px-3 pb-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setShowResume(prev => !prev)} className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">Build Resume</button>
                            <button onClick={handleImproveBio} className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">Improve Bio</button>
                            <button onClick={() => pushMessage('assistant', 'Tip: Keep proposals concise, include milestones, and confirm timelines.')} className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">Proposal Tips</button>
                        </div>

                        {showResume && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                                <input className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800" placeholder="Full Name" value={resumeData.name} onChange={(e) => setResumeData(prev => ({ ...prev, name: e.target.value }))} />
                                <input className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800" placeholder="Role (e.g. UI/UX Designer)" value={resumeData.role} onChange={(e) => setResumeData(prev => ({ ...prev, role: e.target.value }))} />
                                <input className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800" placeholder="Skills (comma separated)" value={resumeData.skills} onChange={(e) => setResumeData(prev => ({ ...prev, skills: e.target.value }))} />
                                <textarea className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800" rows={2} placeholder="Professional summary" value={resumeData.summary} onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))} />
                                <textarea className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800" rows={2} placeholder="Experience (bullet points)" value={resumeData.experience} onChange={(e) => setResumeData(prev => ({ ...prev, experience: e.target.value }))} />
                                <textarea className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800" rows={2} placeholder="Education" value={resumeData.education} onChange={(e) => setResumeData(prev => ({ ...prev, education: e.target.value }))} />
                                <textarea className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800" rows={2} placeholder="Achievements / Certifications" value={resumeData.achievements} onChange={(e) => setResumeData(prev => ({ ...prev, achievements: e.target.value }))} />
                                <button onClick={handleGenerateResume} className="w-full bg-indigo-600 text-white text-sm py-2 rounded">
                                    Generate Resume
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <button onClick={handleSend} className="bg-indigo-600 text-white px-3 py-2 text-sm rounded">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen(prev => !prev)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-xl"
                aria-label="Open AI assistant"
            >
                AI
            </button>
        </div>
    );
};

export default AIChatbot;

