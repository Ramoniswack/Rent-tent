'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Mail, Phone, MapPin, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-[40px] animate-pulse">
      <div className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Basecamp Map...</div>
    </div>
  ),
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#f5f8f7] flex flex-col selection:bg-[#059467] selection:text-white">
      <Header />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 animate-fadeIn">
        {/* Header Section */}
        <div className="max-w-4xl mb-16 md:mb-20">
          <span className="inline-block bg-[#059467]/10 text-[#059467] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6">
            Contact Basecamp
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-[#0f231d] tracking-tight mb-8 leading-[1.05]">
            We're base-camped <br />
            <span className="text-[#059467]">and ready to help.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            Whether you're troubleshooting gear or planning a route, our team is on standby to get you back on the trail.
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
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Partnership</option>
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
                  Avg. Response: 2 Hours
                </span>
              </div>

              {/* Contact Details with Hover Interactions */}
              <div className="flex flex-col gap-10">
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:scale-110 group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-all duration-300">
                    <Mail className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.15em] mb-2">Email Basecamp</span>
                    <a className="text-xl font-bold hover:text-emerald-400 transition-colors" href="mailto:help@nomadnotes.com">
                      help@nomadnotes.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:scale-110 group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-all duration-300">
                    <Phone className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.15em] mb-2">Dispatch Line</span>
                    <a className="text-xl font-bold hover:text-emerald-400 transition-colors" href="tel:+15550123456">
                      +1 (555) 012-3456
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:scale-110 group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-all duration-300">
                    <MapPin className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.15em] mb-2">Global HQ</span>
                    <span className="text-xl font-bold leading-relaxed">
                      123 Basecamp Blvd<br />
                      Boulder, CO 80302
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Connection Footer */}
            <div className="pt-12 border-t border-white/10 mt-16 relative z-10">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Connect with the movement</p>
              <div className="flex gap-5">
                {[
                  { name: 'X', path: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
                  { name: 'Instagram', path: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z' },
                  { name: 'Linkedin', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                ].map((social) => (
                  <a
                    key={social.name}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-emerald-500 hover:text-[#0f231d] flex items-center justify-center transition-all text-white hover:scale-110 active:scale-95"
                    href="#"
                    aria-label={`Join us on ${social.name}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="relative w-full h-[500px] rounded-[56px] overflow-hidden shadow-2xl group">
          <Map center={[40.0150, -105.2705]} zoom={13} />

          {/* Floating Address Card with Glassmorphism */}
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 bg-white/90 backdrop-blur-xl p-8 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-white/50 max-w-[320px] transition-all hover:-translate-y-2 z-[1000]">
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#059467]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">NomadHQ Base</span>
            </div>
            <h3 className="text-[#0f231d] font-black text-2xl leading-tight mb-3">Boulder HQ</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">
              123 Basecamp Blvd, Suite 400<br />
              Boulder, CO 80302
            </p>
            <a
              className="group/btn inline-flex items-center gap-2 text-[#059467] text-sm font-black tracking-wide"
              href="https://maps.google.com/?q=40.0150,-105.2705"
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