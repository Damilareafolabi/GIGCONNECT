import React, { useEffect, useMemo, useState } from 'react';
import { BlogPost, UserRole } from '../types';
import { blogService } from '../services/blogService';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

interface BlogProps {
    onOpenPost?: (post: BlogPost) => void;
    isPublic?: boolean;
}

const Blog: React.FC<BlogProps> = ({ onOpenPost, isPublic }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [showDrafts, setShowDrafts] = useState(false);

    const isAdmin = user?.role === UserRole.Admin;

    const refresh = () => {
        const all = blogService.getAllPosts();
        const visible = isAdmin && showDrafts ? all : blogService.getPublishedPosts();
        setPosts(visible);
    };

    useEffect(() => {
        refresh();
    }, [showDrafts]);

    const categories = useMemo(() => {
        const unique = new Set(posts.map(post => post.category));
        return ['All', ...Array.from(unique)];
    }, [posts]);

    const filtered = posts.filter(post => {
        const matchesCategory = category === 'All' || post.category === category;
        const matchesSearch = !search || `${post.title} ${post.excerpt} ${post.content}`.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAutoPublish = () => {
        blogService.generateAutoPosts(1);
        refresh();
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">GigConnect Blog</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        News about work, hiring trends, and freelancer growth.
                    </p>
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <Button onClick={handleAutoPublish} className="w-auto">Auto-Publish News</Button>
                        <label className="flex items-center gap-2 text-xs text-gray-500">
                            <input type="checkbox" checked={showDrafts} onChange={(e) => setShowDrafts(e.target.checked)} />
                            Show drafts
                        </label>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                    className="md:col-span-2 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Search blog posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {categories.map(cat => (
                        <option key={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {filtered.length === 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center text-gray-500">
                    No blog posts yet. Auto mode will publish updates soon.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtered.map(post => (
                    <article key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>{post.category}</span>
                            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{post.title}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(post.tags || []).map(tag => (
                                <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{post.authorName}</span>
                            <button
                                onClick={() => onOpenPost?.(post)}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                Read more
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {isPublic && (
                <div className="mt-10 bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg text-center">
                    <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-200">Join GigConnect</h3>
                    <p className="text-sm text-indigo-700/80 dark:text-indigo-200/80 mt-2">
                        Create your profile, apply to jobs, and start earning today.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Blog;
