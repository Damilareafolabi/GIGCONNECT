import { blogService } from './blogService';

const setMeta = (key: string, value: string, attr: 'name' | 'property' = 'name') => {
    let tag = document.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', value);
};

const setCanonical = (url: string) => {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }
    link.setAttribute('href', url);
};

const setTitle = (title: string) => {
    document.title = title;
};

const baseDescription = 'GigConnect is a modern freelance marketplace to hire talent, post gigs, and get paid securely.';

export const seoService = {
    applyDefault: () => {
        const origin = window.location.origin;
        setTitle('GigConnect - Freelance Marketplace');
        setMeta('description', baseDescription);
        setMeta('keywords', 'freelance, gigs, jobs, remote work, hire talent, marketplace');
        setMeta('theme-color', '#1d4ed8');
        setMeta('og:title', 'GigConnect - Freelance Marketplace', 'property');
        setMeta('og:description', baseDescription, 'property');
        setMeta('og:type', 'website', 'property');
        setMeta('og:url', origin, 'property');
        setMeta('og:image', `${origin}/icons/icon-512.png`, 'property');
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', 'GigConnect - Freelance Marketplace');
        setMeta('twitter:description', baseDescription);
        setMeta('twitter:image', `${origin}/icons/icon-512.png`);
        setCanonical(origin);
    },

    applyForView: (view: string, params?: any) => {
        const origin = window.location.origin;
        if (view === 'blog') {
            setTitle('GigConnect Blog - News & Work Updates');
            setMeta('description', 'Latest work news, hiring trends, and freelancer growth tips from GigConnect.');
            setMeta('og:title', 'GigConnect Blog', 'property');
            setMeta('og:description', 'Latest work news, hiring trends, and freelancer growth tips from GigConnect.', 'property');
            setMeta('og:url', `${origin}/blog`, 'property');
            setCanonical(`${origin}/blog`);
            return;
        }

        if (view === 'blogPost' && params?.slug) {
            const post = blogService.getPostBySlug(params.slug);
            if (post) {
                setTitle(`${post.title} | GigConnect Blog`);
                setMeta('description', post.excerpt || baseDescription);
                setMeta('og:title', post.title, 'property');
                setMeta('og:description', post.excerpt || baseDescription, 'property');
                setMeta('og:url', `${origin}/blog/${post.slug}`, 'property');
                setCanonical(`${origin}/blog/${post.slug}`);
                return;
            }
        }

        if (view === 'dashboard') {
            setTitle('GigConnect Dashboard');
            setMeta('description', 'Manage gigs, applications, messages, and payments on GigConnect.');
            setCanonical(origin);
            return;
        }

        if (view === 'postJob') {
            setTitle('Post a Job | GigConnect');
            setMeta('description', 'Post a job and hire freelancers faster on GigConnect.');
            setCanonical(`${origin}/post`);
            return;
        }

        if (view === 'messages') {
            setTitle('Messages | GigConnect');
            setMeta('description', 'Chat with clients and freelancers on GigConnect.');
            setCanonical(`${origin}/messages`);
            return;
        }

        if (view === 'wallet') {
            setTitle('Wallet | GigConnect');
            setMeta('description', 'Track earnings, payouts, and platform fees.');
            setCanonical(`${origin}/wallet`);
            return;
        }

        if (view === 'profile') {
            setTitle('Profile | GigConnect');
            setMeta('description', 'Manage your GigConnect profile and public portfolio.');
            setCanonical(`${origin}/profile`);
            return;
        }

        if (view === 'safety') {
            setTitle('Safety Policy | GigConnect');
            setMeta('description', 'Safety guidelines and verification policies for GigConnect.');
            setCanonical(`${origin}/safety`);
            return;
        }

        seoService.applyDefault();
    },
};
