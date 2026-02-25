'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Mail, ArrowRight, Quote, Globe, AtSign, Compass, Heart, Users, Loader2 } from 'lucide-react';

interface PageContent {
  hero: {
    badge: string;
    title: string;
    description: string[];
    image: string;
  };
  values: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  mission: {
    quote: string;
    attribution: string;
  };
  team: {
    title: string;
    subtitle: string;
    members: Array<{
      name: string;
      role: string;
      image: string;
      bio: string;
      social: {
        website: string;
        email: string;
      };
    }>;
  };
  cta: {
    icon: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
}

const iconMap: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Mail: <Mail className="w-8 h-8" />,
};

export default function AboutPage() {
  const router = useRouter();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const url = `${apiUrl}/api/pages/about`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch page content');
        }
        const data = await response.json();
        setPageContent(data.content);
      } catch (err: any) {
        console.error('Error fetching page content:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713] flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#059467] animate-spin mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !pageContent) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713] flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">Failed to load page content</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#059467] text-white px-6 py-2 rounded-lg hover:bg-[#047854] transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713] flex flex-col selection:bg-[#059467] selection:text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Narrative Section */}
        <section className="px-6 py-16 lg:py-28 flex justify-center overflow-hidden">
          <div className="max-w-[1024px] w-full flex flex-col items-center text-center animate-fadeIn">
            <span className="inline-block bg-[#059467]/10 text-[#059467] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6">
              {pageContent.hero.badge}
            </span>

            <h1 className="text-[#0d1c17] dark:text-white text-4xl md:text-[64px] font-black leading-[1.1] tracking-[-0.03em] max-w-[850px] mb-10">
              {pageContent.hero.title.split(',')[0]}, <span className="text-[#059467]">{pageContent.hero.title.split(',')[1]}</span>
            </h1>

            <div className="flex flex-col gap-6 max-w-[760px] text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-16">
              {pageContent.hero.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Hero Image with Parallax-like effect */}
            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#059467] to-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div 
                className="relative w-full aspect-[21/9] bg-center bg-cover bg-no-repeat rounded-2xl shadow-2xl overflow-hidden grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                style={{ backgroundImage: `url('${pageContent.hero.image}')` }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="px-6 py-10 flex justify-center">
          <div className="max-w-[1024px] w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {pageContent.values.map((v, i) => (
              <div key={i} className="bg-white dark:bg-[#132a24] p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-[#059467]/20 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300">
                <div className="w-12 h-12 bg-[#059467]/10 text-[#059467] rounded-xl flex items-center justify-center mb-6">
                  {iconMap[v.icon]}
                </div>
                <h4 className="text-[#0d1c17] dark:text-white text-lg font-bold mb-2">{v.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Statement Card */}
        <section className="px-6 py-20 flex justify-center">
          <div className="max-w-[1024px] w-full bg-[#0f231d] rounded-[2rem] p-10 md:p-24 relative overflow-hidden flex flex-col items-center text-center shadow-2xl group">
            <Quote className="text-[#059467] w-20 h-20 mb-8 opacity-40 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />

            <blockquote className="relative z-10">
              <p className="text-white text-3xl md:text-[42px] font-black leading-tight tracking-tight max-w-[800px]">
                "{pageContent.mission.quote}"
              </p>
              <footer className="mt-10 flex items-center justify-center gap-4">
                <div className="h-px w-8 bg-[#059467]"></div>
                <span className="text-[#059467] font-black tracking-widest uppercase text-xs">{pageContent.mission.attribution}</span>
                <div className="h-px w-8 bg-[#059467]"></div>
              </footer>
            </blockquote>

            {/* Animated Background Blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#059467]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[#059467]/30 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#059467]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </section>

        {/* Team Grid */}
        <section className="px-6 py-24 lg:py-32 flex justify-center bg-white dark:bg-[#0b1713]">
          <div className="max-w-[1024px] w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
              <div className="max-w-xl">
                <h2 className="text-[#0d1c17] dark:text-white text-4xl font-black tracking-tight mb-4">{pageContent.team.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                  {pageContent.team.subtitle}
                </p>
              </div>
              <div className="hidden md:block h-px flex-grow bg-slate-100 dark:bg-slate-800 mx-10 mb-4"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {pageContent.team.members.map((member, index) => (
                <div key={index} className="group">
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6 shadow-lg shadow-slate-200 dark:shadow-slate-900">
                    <img
                      alt={`Portrait of ${member.name}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src={member.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f231d]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <p className="text-white/80 text-xs font-medium leading-relaxed">{member.bio}</p>
                    </div>
                  </div>
                  <h3 className="text-[#0d1c17] dark:text-white text-xl font-black mb-1 group-hover:text-[#059467] transition-colors">{member.name}</h3>
                  <p className="text-[#059467] text-[10px] font-black uppercase tracking-widest mb-4">
                    {member.role}
                  </p>
                  <div className="flex gap-4 text-slate-300">
                    <a className="hover:text-[#059467] transition-all transform hover:-translate-y-1" href={member.social.website}>
                      <Globe className="w-5 h-5" />
                    </a>
                    <a className="hover:text-[#059467] transition-all transform hover:-translate-y-1" href={member.social.email}>
                      <AtSign className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="relative bg-[#0f231d] py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-5 grayscale" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')"}}></div>
          <div className="max-w-[1024px] mx-auto flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 bg-[#059467] rounded-2xl shadow-xl shadow-emerald-900/50 flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-300">
              {iconMap[pageContent.cta.icon]}
            </div>
            <h2 className="text-white text-3xl md:text-5xl font-black mb-10 tracking-tight">
              {pageContent.cta.title}
            </h2>
            <button
              onClick={() => router.push(pageContent.cta.buttonLink)}
              className="group bg-[#059467] text-white text-lg font-black py-5 px-12 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 hover:bg-[#06ac77] transition-all duration-300 flex items-center gap-3 active:scale-95"
            >
              <span>{pageContent.cta.buttonText}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
