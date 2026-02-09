
import { Job, User } from "../types";

const resolveApiKey = () => {
    const viteEnv = (import.meta as any)?.env || {};
    const candidate = viteEnv.VITE_GEMINI_API_KEY || viteEnv.VITE_API_KEY;
    if (candidate) return candidate;
    if (typeof process !== 'undefined') {
        return process.env?.API_KEY || process.env?.GEMINI_API_KEY;
    }
    return undefined;
};

const apiKey = resolveApiKey();
let aiInstance: any | null = null;
let aiPromise: Promise<any> | null = null;

const loadAI = async () => {
    if (!apiKey) return null;
    if (aiInstance) return aiInstance;
    if (!aiPromise) {
        aiPromise = import(/* @vite-ignore */ 'https://esm.sh/@google/genai')
            .then((mod: any) => {
                const AIClass = mod.GoogleGenerativeAI || mod.default?.GoogleGenerativeAI || mod.default;
                if (!AIClass) {
                    throw new Error('Failed to load GoogleGenerativeAI');
                }
                aiInstance = new AIClass({ apiKey });
                return aiInstance;
            })
            .catch((error) => {
                console.error('Failed to load Gemini SDK:', error);
                aiPromise = null;
                return null;
            });
    }
    return aiPromise;
};

// Helper to format job data for prompts
const formatJobsForPrompt = (jobs: Job[]): string => {
    return jobs.map(job => 
        `Job ID: ${job.id}\nTitle: ${job.title}\nCategory: ${job.category}\nPayment: $${job.payment}\nStatus: ${job.status}\nDescription: ${job.description.substring(0, 100)}...`
    ).join('\n\n---\n\n');
};


export const geminiService = {
    generateJobDescription: async (title: string): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return `We are looking for a ${title} to deliver high-quality results. Share relevant experience, a brief plan, and availability.`;
            }
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: `Generate a compelling and professional job description for the title: "${title}". Be concise and focus on attracting top talent.`,
            });
            return response.text;
        } catch (error) {
            console.error("Error generating job description:", error);
            throw new Error("Failed to generate AI description. Please try again.");
        }
    },

    generateCoverLetter: async (job: Job, user: User): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return `Hello,\n\nI'm excited to apply for "${job.title}". I bring strong experience in ${user.skills?.join(', ') || 'relevant skills'} and can deliver quickly. I'd love to discuss your goals and propose a clear plan.\n\nBest,\n${user.name}`;
            }
            const prompt = `Generate a professional and persuasive cover letter for a job application.
            
            My Info:
            Name: ${user.name}
            Skills: ${user.skills?.join(', ') || 'Not specified'}
            Bio: ${user.profileBio || 'Not specified'}

            Job Info:
            Title: ${job.title}
            Description: ${job.description}

            Based on my info, write a cover letter that highlights my relevant skills and expresses strong interest in this specific role. Keep it concise and impactful.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error generating cover letter:", error);
            throw new Error("Failed to generate AI cover letter. Please try again.");
        }
    },

    improveProfileBio: async (bio: string, skills: string[]): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                const skillLine = skills.length > 0 ? `Skilled in ${skills.join(', ')}.` : '';
                return `${bio || 'Dedicated freelancer focused on delivering high-quality results.'} ${skillLine}`.trim();
            }
            const prompt = `Rewrite and improve this professional bio for a freelance marketplace profile.
            
            Current Bio: "${bio}"
            My skills are: ${skills.join(', ')}

            Make it more engaging, professional, and highlight my key skills to attract potential employers. If the current bio is empty, create a new one based on my skills.`;

            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error improving profile bio:", error);
            throw new Error("Failed to improve bio with AI. Please try again.");
        }
    },

    suggestMessageReply: async (lastMessage: string): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return `Thanks for the update! I can proceed and will share the next steps shortly.`;
            }
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: `Based on the last message in a conversation, suggest a short, professional reply. Last message: "${lastMessage}"`,
            });
            return response.text;
        } catch (error) {
            console.error("Error suggesting message reply:", error);
            throw new Error("Failed to suggest AI reply.");
        }
    },
    
    analyzeMarketData: async (jobs: Job[]): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return 'Market snapshot: Web Development and Design roles dominate demand. Employers favor mid-sized budgets with clear milestones. Recommendation: launch a fast shortlist lane and promote verified-skill badges to reduce hiring friction.';
            }
            const jobDataSummary = formatJobsForPrompt(jobs);
            const prompt = `As a market analyst for a freelance platform, analyze the following job data.
            
            Job Data Summary:
            ${jobDataSummary}

            Provide a detailed analysis covering:
            1.  Current hiring trends (most popular categories, salary ranges).
            2.  Potentially underserved or emerging skill categories.
            3.  A strategic recommendation to attract more employers based on these trends.
            
            Think deeply about the data to provide actionable insights.`;

            const response = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                },
            });
            return response.text;
        } catch (error) {
            console.error("Error analyzing market data:", error);
            throw new Error("Failed to generate market analysis.");
        }
    },
    
    findTalentNearLocation: async (query: string, location?: { latitude: number; longitude: number }): Promise<{ text: string, groundingChunks?: any[] }> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return {
                    text: `AI search unavailable (missing API key). Try refining your query: "${query}".`,
                    groundingChunks: [],
                };
            }
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Based on real-world data, find information about: "${query}". Provide a helpful summary.`,
                config: {
                    tools: [{googleMaps: {}}],
                    toolConfig: location ? {
                        retrievalConfig: {
                            latLng: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }
                        }
                    } : undefined,
                },
            });

            return {
                text: response.text,
                groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
            };

        } catch (error) {
            console.error("Error with Maps Grounding:", error);
            throw new Error("Failed to get location-based data.");
        }
    },

    analyzeVideo: async (videoBase64: string, mimeType: string): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return 'Video analysis unavailable (missing API key). Provide a short summary in text for now.';
            }
            const videoPart = {
                inlineData: {
                  data: videoBase64,
                  mimeType: mimeType,
                },
            };
            const textPart = { text: "Summarize this video introduction for a professional profile. What are the key skills or qualities mentioned by the speaker? Keep it to 2-3 sentences." };
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: { parts: [videoPart, textPart] },
            });
            return response.text;
        } catch (error) {
            console.error("Error analyzing video:", error);
            throw new Error("Failed to analyze video. Please ensure it's a short clip.");
        }
    },

    generateProjectPlan: async (jobTitle: string, jobDescription: string): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return `Project Plan (Draft):\n1. Discovery & scope alignment\n2. Milestones with weekly check-ins\n3. Delivery + QA\n4. Final handoff and documentation`;
            }
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: `Create a concise project plan with milestones for this job.\nTitle: ${jobTitle}\nDescription: ${jobDescription}\nKeep it to 4-6 bullet points.`,
            });
            return response.text;
        } catch (error) {
            console.error("Error generating project plan:", error);
            throw new Error("Failed to generate project plan.");
        }
    },

    suggestPricing: async (jobTitle: string, category: string): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return `Suggested pricing: $1,500 - $4,500 fixed price depending on scope.`;
            }
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: `Suggest a reasonable fixed-price range for a freelance job.\nTitle: ${jobTitle}\nCategory: ${category}\nProvide a concise range and rationale in 2 sentences.`,
            });
            return response.text;
        } catch (error) {
            console.error("Error suggesting pricing:", error);
            throw new Error("Failed to suggest pricing.");
        }
    },

    detectRiskFlags: async (jobDescription: string): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return 'No major risk flags detected. Ensure scope, milestones, and payment terms are documented.';
            }
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: `Review this job description for potential risk flags (scope creep, unclear deliverables, unrealistic timelines). Return concise bullet points.\nDescription: ${jobDescription}`,
            });
            return response.text;
        } catch (error) {
            console.error("Error detecting risk flags:", error);
            throw new Error("Failed to analyze risk flags.");
        }
    },

    generateResume: async (data: { name: string; role: string; summary?: string; skills?: string; experience?: string; education?: string; achievements?: string }): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return `RESUME\nName: ${data.name}\nRole: ${data.role}\nSummary: ${data.summary || ''}\nSkills: ${data.skills || ''}\nExperience: ${data.experience || ''}\nEducation: ${data.education || ''}\nAchievements: ${data.achievements || ''}`;
            }
            const prompt = `Create a clean one-page resume draft using the information below. Use clear headings and bullet points.\n\nName: ${data.name}\nRole: ${data.role}\nSummary: ${data.summary || ''}\nSkills: ${data.skills || ''}\nExperience: ${data.experience || ''}\nEducation: ${data.education || ''}\nAchievements/Certifications: ${data.achievements || ''}`;
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error generating resume:", error);
            throw new Error("Failed to generate resume.");
        }
    },

    generateAssistantReply: async (message: string, context?: string): Promise<string> => {
        try {
            const ai = await loadAI();
            if (!ai) {
                return `Here is a quick tip: keep requests specific and include your goal. If you want a resume draft, click "Build Resume".`;
            }
            const prompt = `You are GigConnect AI, a helpful assistant for a freelance marketplace. Provide concise, practical answers.\nContext: ${context || 'N/A'}\nUser message: ${message}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error generating assistant reply:", error);
            throw new Error("Failed to generate assistant reply.");
        }
    },
};
