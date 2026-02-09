import { BlogPost } from '../types';
import { storageService } from './storageService';
import { supabaseTableSyncService } from './supabaseTableSyncService';

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const nowIso = () => new Date().toISOString();

const templates: Array<Pick<BlogPost, 'title' | 'excerpt' | 'content' | 'category' | 'tags'>> = [
    {
        title: 'Weekly Work Trends: What Clients Are Hiring For',
        excerpt: 'A quick snapshot of the most requested services and how freelancers can position themselves.',
        content: 'Hiring momentum remains strong for web development, brand design, and AI automation. Clients want clear timelines and fixed milestones. Freelancers who show short case studies and specify deliverables are winning faster decisions.',
        category: 'Work News',
        tags: ['trends', 'hiring', 'skills'],
    },
    {
        title: 'How to Craft Proposals That Get Replies',
        excerpt: 'Stand out in a crowded market with a proposal structure that clients actually read.',
        content: 'Start with a 2-line summary, then show your plan in 3 bullets. Confirm the timeline, ask one smart question, and end with a clear call-to-action. Short beats long.',
        category: 'Freelancer Success',
        tags: ['proposals', 'clients', 'growth'],
    },
    {
        title: 'Employer Playbook: How to Hire Faster and Better',
        excerpt: 'Reduce hiring time with a clear scope, budget range, and milestone plan.',
        content: 'The fastest hires happen when clients share the exact outcome they want, attach examples, and provide a budget range. Posting a short scope and offering a paid test task improves quality and speed.',
        category: 'Employer Insights',
        tags: ['employers', 'hiring', 'best-practices'],
    },
    {
        title: 'Remote Work Readiness: A 5-Point Checklist',
        excerpt: 'Quick steps to make your freelance profile irresistible for remote teams.',
        content: 'Show time zone availability, response time, portfolio links, clear pricing, and a 2–3 sentence summary. Keep your profile consistent and updated every week.',
        category: 'Remote Work',
        tags: ['remote', 'profile', 'checklist'],
    },
    {
        title: 'AI + Freelancing: How to Work 2x Faster',
        excerpt: 'Practical ways freelancers use AI for drafts, research, and faster delivery.',
        content: 'Use AI to outline first drafts, summarize client notes, and generate alternative ideas. Always review outputs and tailor them to client goals. Speed helps only when quality stays high.',
        category: 'Productivity',
        tags: ['ai', 'productivity', 'workflow'],
    },
];

const uniqueSlug = (base: string, existing: BlogPost[]) => {
    let slug = slugify(base);
    let counter = 2;
    while (existing.some(post => post.slug === slug)) {
        slug = `${slugify(base)}-${counter}`;
        counter += 1;
    }
    return slug;
};

const addPost = (post: BlogPost) => {
    const posts = storageService.getBlogPosts();
    const next = [post, ...posts];
    storageService.saveBlogPosts(next.slice(0, 200));
    supabaseTableSyncService.syncItem('blogPosts', post);
    return post;
};

export const blogService = {
    getAllPosts: (): BlogPost[] => storageService.getBlogPosts(),
    getPublishedPosts: (): BlogPost[] => storageService.getBlogPosts().filter(post => post.status === 'Published'),
    getPostBySlug: (slug: string): BlogPost | undefined => storageService.getBlogPosts().find(post => post.slug === slug),
    createPost: (data: Omit<BlogPost, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): BlogPost => {
        const posts = storageService.getBlogPosts();
        const slug = uniqueSlug(data.title, posts);
        const now = nowIso();
        const post: BlogPost = {
            ...data,
            id: `blog-${Date.now()}`,
            slug,
            createdAt: now,
            updatedAt: now,
        };
        return addPost(post);
    },
    publishPost: (id: string) => {
        const posts = storageService.getBlogPosts();
        const index = posts.findIndex(post => post.id === id);
        if (index === -1) throw new Error('Post not found');
        posts[index] = {
            ...posts[index],
            status: 'Published',
            publishedAt: nowIso(),
            updatedAt: nowIso(),
        };
        storageService.saveBlogPosts(posts);
        supabaseTableSyncService.syncItem('blogPosts', posts[index]);
        return posts[index];
    },
    generateAutoPosts: (count = 1): BlogPost[] => {
        const posts = storageService.getBlogPosts();
        const created: BlogPost[] = [];
        for (let i = 0; i < count; i += 1) {
            const template = templates[(Date.now() + i) % templates.length];
            const slug = uniqueSlug(template.title, [...posts, ...created]);
            const now = nowIso();
            const post: BlogPost = {
                id: `blog-auto-${Date.now()}-${i}`,
                title: template.title,
                slug,
                excerpt: template.excerpt,
                content: template.content,
                category: template.category,
                tags: template.tags,
                authorName: 'GigConnect Newsroom',
                status: 'Published',
                createdAt: now,
                publishedAt: now,
                updatedAt: now,
                isAi: true,
                source: 'Auto Mode',
            };
            created.push(addPost(post));
        }
        return created;
    },
};
