import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';
import EmployerDashboard from './components/EmployerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Messages from './components/Messages';
import { UserRole, View } from './types';
import JobForm from './components/JobForm';
import Welcome from './components/Welcome';
import About from './components/About';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import GodModeBanner from './components/GodModeBanner';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { useBackgroundAgents } from './hooks/useBackgroundAgents';
import WalletDashboard from './components/WalletDashboard';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Contact from './components/Contact';
import { supabaseTableSyncService } from './services/supabaseTableSyncService';
import AIChatbot from './components/AIChatbot';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import { seoService } from './services/seoService';
import Safety from './components/Safety';

const AppContent: React.FC = () => {
    const { user, isGodMode } = useAuth();
    const [currentView, setCurrentView] = useState<View>({ name: 'dashboard' });
    const [authView, setAuthView] = useState('welcome'); // welcome, login, signup, terms, privacy, contact, blog, blogPost, safety
    const [publicBlogSlug, setPublicBlogSlug] = useState<string | null>(null);
    useBackgroundAgents(user);

    useEffect(() => {
        supabaseTableSyncService.hydrate();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            window.localStorage.setItem('gigconnect_referrer', ref);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            seoService.applyForView(authView, authView === 'blogPost' ? { slug: publicBlogSlug } : undefined);
        } else {
            seoService.applyForView(currentView.name, currentView.params);
        }
    }, [user, authView, publicBlogSlug, currentView]);

    const navigate = (viewName: string, params?: object) => {
        setCurrentView({ name: viewName, params });
    };

    if (!user) {
        const isAuthForm = authView === 'login' || authView === 'signup';
        const isLegal = authView === 'terms' || authView === 'privacy' || authView === 'contact' || authView === 'safety';

        const renderPublicView = () => {
            if (authView === 'terms') return <Terms />;
            if (authView === 'privacy') return <Privacy />;
            if (authView === 'contact') return <Contact />;
            if (authView === 'safety') return <Safety />;
            if (authView === 'blog') return <Blog isPublic onOpenPost={(post) => { setPublicBlogSlug(post.slug); setAuthView('blogPost'); }} />;
            if (authView === 'blogPost') return <BlogPost slug={publicBlogSlug || undefined} onBack={() => setAuthView('blog')} />;
            return <Welcome onLoginClick={() => setAuthView('login')} onSignupClick={() => setAuthView('signup')} onBlogClick={() => setAuthView('blog')} />;
        };

        return (
            <div className="min-h-screen text-gray-900 dark:text-gray-100 font-sans">
                {!isAuthForm ? (
                    <main className="container mx-auto p-4 sm:p-6 pb-24 sm:pb-28">
                        <div className="mb-6">
                            {isLegal && (
                                <button onClick={() => setAuthView('welcome')} className="text-sm text-indigo-600 hover:underline">
                                    Back to Welcome
                                </button>
                            )}
                        </div>
                        {renderPublicView()}
                    </main>
                ) : (
                    <div className="min-h-screen flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-md">
                            {authView === 'login' && <LoginForm onSignupClick={() => setAuthView('signup')} onBackClick={() => setAuthView('welcome')} />}
                            {authView === 'signup' && <SignupForm onLoginClick={() => setAuthView('login')} onBackClick={() => setAuthView('welcome')} />}
                        </div>
                    </div>
                )}
                <Footer onNavigatePublic={(view) => setAuthView(view)} />
                <AIChatbot />
            </div>
        );
    }
    
    const renderView = () => {
        switch (currentView.name) {
            case 'profile':
                return <Profile navigate={navigate} reviewJobId={currentView.params?.reviewJobId} />;
            case 'messages':
                return <Messages navigate={navigate} conversationUserId={currentView.params?.userId} />;
            case 'postJob':
                return <JobForm navigate={navigate} jobToEdit={currentView.params?.job} />;
            case 'about':
                return <About />;
            case 'wallet':
                return <WalletDashboard />;
            case 'terms':
                return <Terms />;
            case 'privacy':
                return <Privacy />;
            case 'contact':
                return <Contact />;
            case 'safety':
                return <Safety />;
            case 'blog':
                return <Blog onOpenPost={(post) => navigate('blogPost', { slug: post.slug })} />;
            case 'blogPost':
                return <BlogPost slug={currentView.params?.slug} onBack={() => navigate('blog')} />;
            case 'dashboard':
            default:
                if (user.role === UserRole.Admin) return <AdminDashboard navigate={navigate} />;
                if (user.role === UserRole.Employer) return <EmployerDashboard navigate={navigate} />;
                return <Dashboard navigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen text-gray-900 dark:text-gray-100 font-sans">
            {isGodMode && <GodModeBanner />}
            <Navbar navigate={navigate} />
            <main className={`p-4 pb-24 sm:p-6 sm:pb-28 ${isGodMode ? 'pt-28 sm:pt-32' : 'pt-20 sm:pt-24'}`}>
                {renderView()}
            </main>
            <Footer navigate={navigate} />
            <AIChatbot />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <ErrorBoundary>
                        <AppContent />
                    </ErrorBoundary>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
