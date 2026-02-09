import React, { useState } from 'react';
import { blogService } from '../services/blogService';
import { BlogPost } from '../types';
import Button from './Button';
import Input from './Input';

const BlogManager: React.FC = () => {
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Work News');
    const [tags, setTags] = useState('news, work');
    const [status, setStatus] = useState<BlogPost['status']>('Published');
    const [created, setCreated] = useState<BlogPost | null>(null);

    const handleCreate = () => {
        if (!title || !content) return;
        const post = blogService.createPost({
            title,
            excerpt: excerpt || content.slice(0, 140) + '...',
            content,
            category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            authorName: 'GigConnect Admin',
            status,
            publishedAt: status === 'Published' ? new Date().toISOString() : undefined,
        });
        setCreated(post);
        setTitle('');
        setExcerpt('');
        setContent('');
    };

    const handleAuto = () => {
        const posts = blogService.generateAutoPosts(1);
        setCreated(posts[0] || null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold">Blog Publisher</h3>
                    <p className="text-sm text-gray-500">Auto-mode news + manual posts.</p>
                </div>
                <Button onClick={handleAuto} className="w-auto">Auto-Publish Now</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input id="blog-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input id="blog-category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                <Input id="blog-tags" label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as BlogPost['status'])}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                        <option>Published</option>
                        <option>Draft</option>
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Excerpt</label>
                <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    placeholder="Short summary for preview cards"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Content</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    placeholder="Write the full post here..."
                />
            </div>

            <Button onClick={handleCreate} className="w-auto">Publish Post</Button>

            {created && (
                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm">
                    <p className="font-semibold">Published:</p>
                    <p>{created.title}</p>
                    <p className="text-xs text-gray-500">Slug: {created.slug}</p>
                </div>
            )}
        </div>
    );
};

export default BlogManager;
