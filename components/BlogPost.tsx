import React from 'react';
import { BlogPost as BlogPostType } from '../types';
import { blogService } from '../services/blogService';

interface BlogPostProps {
    slug?: string;
    onBack?: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ slug, onBack }) => {
    const post: BlogPostType | undefined = slug ? blogService.getPostBySlug(slug) : undefined;

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-300">Post not found.</p>
                {onBack && (
                    <button onClick={onBack} className="mt-4 text-indigo-600 hover:underline">
                        Back to blog
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="text-sm text-indigo-600 hover:underline mb-4">
                ← Back to blog
            </button>
            <article className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{post.category}</span>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{post.title}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                    {(post.tags || []).map(tag => (
                        <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
                <div>
                    {post.content.split('\n').map((line, idx) => (
                        <p key={`${post.id}-${idx}`} className="text-gray-700 dark:text-gray-200 leading-relaxed mb-3">
                            {line}
                        </p>
                    ))}
                </div>
                <div className="mt-6 text-xs text-gray-500">
                    By {post.authorName} {post.isAi ? '(Auto)' : ''}
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
