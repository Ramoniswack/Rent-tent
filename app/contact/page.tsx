'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Mail, Phone, MapPin, ArrowRight, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-[40px] animate-pulse">
      <div className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Basecamp Map...</div>
    </div>
  ),
});

interface ContactContent {
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
  };
  contactInfo: {
    responseTime: string;
    email: { label: string; value: string };
    phone: { label: string; value: string };
    address: { label: string; street: string; city: string };
  };
  formTopics: string[];
  map: {
    latitude: number;
    longitude: number;
    zoom: number;
    cardTitle: string;
    cardAddress: string;
    cardCity: string;
    cardLabel: string;
  };
  social: {
    title: string;
    links: Array<{ name: string; url: string; icon: string }>;
  };
}

export default function ContactPage() {
  const [content, setContent] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/pages/contact`);
      const data = await response.json();
      setContent(data.content);
      
      // Set default topic from fetched content
      if (data.content.formTopics && data.content.formTopics.length > 0) {
        setFormData(prev => ({ ...prev, topic: data.content.formTopics[0] }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call
    console.log('Form data dispatched:', formData);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSent(true);
    
    // Reset success state after 5 seconds
    setTimeout(() => setIsSent(false), 5000);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error || 'Failed to load content'}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f7] flex flex-col selection:bg-[#059467] selection:text-white">
      <Header />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 animate-fadeIn">
        {/* Header Section */}
        <div className="max-w-4xl mb-16 md:mb-20">
          <span className="inline-block bg-[#059467]/10 text-[#059467] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6">
            {content.hero.badge}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-[#0f231d] tracking-tight mb-8 leading-[1.05]">
            {content.hero.title} <br />
            <span className="text-[#059467]">{content.hero.titleHighlight}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            {content.hero.description}
          </p>
        </div>

        {/* Dual Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10 mb-24">
          {/* Left Column: Contact Form (60%) */}
          <div className="w-full lg:w-3/5 bg-white rounded-[48px] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(15,35,29,0.08)] border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#059467]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <label className="flex flex-col gap-3">
                  <span className="text-xs font-black text-[#0f231d] uppercase tracking-[0.1em] ml-1">Full Name</span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-slate-50 border-2 border-transparent text-[#0f231d] placeholder:text-slate-300 rounded-3xl h-16 px-6 focus:ring-0 focus:border-[#059467] focus:bg-white transition-all font-bold outline-none"
                    placeholder="Alex Roamer"
                    type="text"
                    required
                  />
                </label>
                <label className="flex flex-col gap-3">
                  <span className="text-xs font-black text-[#0f231d] uppercase tracking-[0.1em] ml-1">Email Address</span>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-slate-50 border-2 border-transparent text-[#0f231d] placeholder:text-slate-300 rounded-3xl h-16 px-6 focus:ring-0 focus:border-[#059467] focus:bg-white transition-all font-bold outline-none"
                    placeholder="alex@nomad.com"
                    type="email"
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-3">
                <span className="text-xs font-black text-[#0f231d] uppercase tracking-[0.1em] ml-1">Inquiry Topic</span>
                <div className="relative">
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full appearance-none bg-slate-50 border-2 border-transparent text-[#0f231d] rounded-3xl h-16 px-6 pr-12 focus:ring-0 focus:border-[#059467] focus:bg-white transition-all font-bold cursor-pointer outline-none"
                  >
                    {content.formTopics.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#059467]">
                    <ChevronDown className="w-6 h-6 stroke-[3px]" />
                  </div>
                </div>
              </label>

              <label className="flex flex-col gap-3">
                <span className="text-xs font-black text-[#0f231d] uppercase tracking-[0.1em] ml-1">Your Message</span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-slate-50 border-2 border-transparent text-[#0f231d] placeholder:text-slate-300 rounded-[32px] min-h-[220px] p-6 focus:ring-0 focus:border-[#059467] focus:bg-white transition-all font-bold resize-none outline-none leading-relaxed"
                  placeholder="Tell us about your adventure..."
                  required
                />
              </label>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isSent}
                  className={`w-full h-16 rounded-full shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98] ${
                    isSent 
                    ? 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10' 
                    : 'bg-[#059467] hover:bg-[#06ac77] text-white shadow-[#059467]/30'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : isSent ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-black text-lg">Message Sent Successfully!</span>
                    </>
                  ) : (
                    <>
                      <span className="font-black text-lg">Send Message</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform stroke-[3px]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Contact Info (40%) */}
          <div className="w-full lg:w-2/5 bg-[#0f231d] rounded-[48px] p-10 md:p-16 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#059467]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col gap-12 relative z-10">
              {/* Response Badge */}
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full w-fit">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  {content.contactInfo.responseTime}
                </span>
              </div>

              {/* Contact Details with Hover Interactions */}
              <div className="flex flex-col gap-10">
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:scale-110 group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-all duration-300">
                    <Mail className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.15em] mb-2">{content.contactInfo.email.label}</span>
                    <a className="text-xl font-bold hover:text-emerald-400 transition-colors" href={`mailto:${content.contactInfo.email.value}`}>
                      {content.contactInfo.email.value}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:scale-110 group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-all duration-300">
                    <Phone className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.15em] mb-2">{content.contactInfo.phone.label}</span>
                    <a className="text-xl font-bold hover:text-emerald-400 transition-colors" href={`tel:${content.contactInfo.phone.value}`}>
                      {content.contactInfo.phone.value}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:scale-110 group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-all duration-300">
                    <MapPin className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.15em] mb-2">{content.contactInfo.address.label}</span>
                    <span className="text-xl font-bold leading-relaxed">
                      {content.contactInfo.address.street}<br />
                      {content.contactInfo.address.city}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Connection Footer */}
            <div className="pt-12 border-t border-white/10 mt-16 relative z-10">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{content.social.title}</p>
              <div className="flex gap-5">
                {content.social.links.map((social) => (
                  <a
                    key={social.name}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-emerald-500 hover:text-[#0f231d] flex items-center justify-center transition-all text-white hover:scale-110 active:scale-95"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Join us on ${social.name}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="relative w-full h-[500px] rounded-[56px] overflow-hidden shadow-2xl group">
          <Map center={[content.map.latitude, content.map.longitude]} zoom={content.map.zoom} />

          {/* Floating Address Card with Glassmorphism */}
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 bg-white/90 backdrop-blur-xl p-8 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-white/50 max-w-[320px] transition-all hover:-translate-y-2 z-[1000]">
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#059467]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{content.map.cardLabel}</span>
            </div>
            <h3 className="text-[#0f231d] font-black text-2xl leading-tight mb-3">{content.map.cardTitle}</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">
              {content.map.cardAddress}<br />
              {content.map.cardCity}
            </p>
            <a
              className="group/btn inline-flex items-center gap-2 text-[#059467] text-sm font-black tracking-wide"
              href={`https://maps.google.com/?q=${content.map.latitude},${content.map.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform stroke-[2.5px]" />
            </a>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}