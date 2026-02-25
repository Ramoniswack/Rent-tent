'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../../components/Header';
import HomePageEditor from '../../../../../components/HomePageEditor';
import { Save, Loader2, ArrowLeft, Eye, AlertCircle, CheckCircle2, LayoutDashboard } from 'lucide-react';

interface HomeContent {
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
    backgroundImage: string;
    ctaPrimary: { text: string; link: string };
    ctaSecondary: { text: string; link: string };
    stats: Array<{ value: string; label: string }>;
  };
  features: {
    badge: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
      colSpan: string;
      accent: string;
    }>;
  };
  ctaBanner: {
    title: string;
    description: string;
    backgroundImage: string;
    ctaPrimary: { text: string; link: string };
    ctaSecondary: { text: string; link: string };
  };
  testimonials: {
    title: string;
    description: string;
    items: Array<{
      name: string;
      role: string;
      rating: number;
      text: string;
      avatar: string;
    }>;
  };
}

export default function EditHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<HomeContent | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const url = `${apiUrl}/api/pages/home`;
      
      const response = await fetch(url, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (!response.ok) throw new Error('Failed to fetch page content');
      
      const data = await response.json();
      setContent(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const url = `${apiUrl}/api/admin/pages/home`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save page');
      }
      
      setSuccessMessage('Home page updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d0b] flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10">
                <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading Editor</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Fetching your page content...</p>
            </div>
          </div>
        )}

        {/* Fatal Error State (Failed to load content) */}
        {!loading && error && !content && (
          <div className="max-w-md mx-auto mt-20 bg-white/60 dark:bg-[#132a24]/60 backdrop-blur-xl border border-red-200 dark:border-red-900/50 rounded-3xl p-8 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Failed to Load Content</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => router.push('/admin')}
              className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Editor Content */}
        {!loading && content && (
          <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
            
            {/* Top Action Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              
              <div className="flex items-start gap-5">
                <button
                  onClick={() => router.push('/admin')}
                  className="mt-1 p-3 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-all shadow-sm group"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Page Builder
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Edit Home Page</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium">Design and structure your landing page experience.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#1a3830] transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  Live Preview
                </a>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="relative group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#059467] to-[#047854] text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(5,148,103,0.39)] hover:shadow-[0_6px_20px_rgba(5,148,103,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{saving ? 'Publishing...' : 'Publish Changes'}</span>
                </button>
              </div>
            </div>

            {/* Floating Status Notifications */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
              {successMessage && (
                <div className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-[#132a24] border border-emerald-200 dark:border-emerald-500/30 shadow-2xl rounded-2xl p-4 text-emerald-700 dark:text-emerald-400 font-bold animate-in slide-in-from-right-8 fade-in duration-300">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p>{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-[#132a24] border border-red-200 dark:border-red-500/30 shadow-2xl rounded-2xl p-4 text-red-700 dark:text-red-400 font-bold animate-in slide-in-from-right-8 fade-in duration-300">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Core Editor Component */}
            <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
              <HomePageEditor 
                content={content}
                setContent={setContent}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
              />
            </div>
            
          </div>
        )}

      </main>
    </div>
  );
}