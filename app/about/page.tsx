'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Mail, ArrowRight, Quote, Globe, AtSign, Compass, Heart, Users } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  const teamMembers = useMemo(() => [
    {
      name: 'Sarah Jenkins',
      role: 'Founder & CEO',
      image: 'https://i.pravatar.cc/400?img=1',
      bio: 'Visionary behind the nomad movement with 10+ years in remote product design.'
    },
    {
      name: 'Marcus Chen',
      role: 'Head of Product',
      image: 'https://i.pravatar.cc/400?img=13',
      bio: 'Ensuring our tools are as fast as the airport Wi-Fi you rely on.'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Community Lead',
      image: 'https://i.pravatar.cc/400?img=5',
      bio: 'Connecting thousands of nomads across 120 different countries.'
    },
    {
      name: 'David Okonjo',
      role: 'Tech Lead',
      image: 'https://i.pravatar.cc/400?img=12',
      bio: 'The architect building our global infrastructure from his van.'
    },
  ], []);

  const values = [
    { icon: <Compass className="w-6 h-6" />, title: 'Boundless Exploration', desc: 'We encourage curiosity and the courage to find new paths.' },
    { icon: <Users className="w-6 h-6" />, title: 'Radical Community', desc: 'Digital nomadism shouldn’t be lonely. We build bridges.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Sustainability', desc: 'Respecting the local cultures and environments we visit.' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f7] flex flex-col selection:bg-[#059467] selection:text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Narrative Section */}
        <section className="px-6 py-16 lg:py-28 flex justify-center overflow-hidden">
          <div className="max-w-[1024px] w-full flex flex-col items-center text-center animate-fadeIn">
            <span className="inline-block bg-[#059467]/10 text-[#059467] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6">
              Our Journey
            </span>

            <h1 className="text-[#0d1c17] text-4xl md:text-[64px] font-black leading-[1.1] tracking-[-0.03em] max-w-[850px] mb-10">
              Built by Nomads, <span className="text-[#059467]">for Nomads.</span>
            </h1>

            <div className="flex flex-col gap-6 max-w-[760px] text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-16">
              <p>
                We started NomadNotes on a rainy afternoon in Bali, realizing that while the world is vast, the tools to navigate it as a worker were limited. What began as a shared spreadsheet of Wi-Fi speeds has grown into a global movement.
              </p>
              <p>
                Today, we're a diverse team of explorers dedicated to making the digital nomad lifestyle sustainable, accessible, and deeply connected for everyone, everywhere.
              </p>
            </div>

            {/* Hero Image with Parallax-like effect */}
            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#059467] to-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div 
                className="relative w-full aspect-[21/9] bg-center bg-cover bg-no-repeat rounded-2xl shadow-2xl overflow-hidden grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80')" }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="px-6 py-10 flex justify-center">
          <div className="max-w-[1024px] w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-[#059467]/20 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300">
                <div className="w-12 h-12 bg-[#059467]/10 text-[#059467] rounded-xl flex items-center justify-center mb-6">{v.icon}</div>
                <h4 className="text-[#0d1c17] text-lg font-bold mb-2">{v.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
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
                "To empower the global workforce to explore without boundaries."
              </p>
              <footer className="mt-10 flex items-center justify-center gap-4">
                <div className="h-px w-8 bg-[#059467]"></div>
                <span className="text-[#059467] font-black tracking-widest uppercase text-xs">NomadNotes Mission</span>
                <div className="h-px w-8 bg-[#059467]"></div>
              </footer>
            </blockquote>

            {/* Animated Background Blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#059467]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[#059467]/30 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#059467]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </section>

        {/* Team Grid */}
        <section className="px-6 py-24 lg:py-32 flex justify-center bg-white">
          <div className="max-w-[1024px] w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
              <div className="max-w-xl">
                <h2 className="text-[#0d1c17] text-4xl font-black tracking-tight mb-4">Meet the Crew</h2>
                <p className="text-slate-500 text-lg font-medium">
                  The explorers, builders, and dreamers working remotely to build the future of travel.
                </p>
              </div>
              <div className="hidden md:block h-px flex-grow bg-slate-100 mx-10 mb-4"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {teamMembers.map((member, index) => (
                <div key={index} className="group">
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6 shadow-lg shadow-slate-200">
                    <img
                      alt={`Portrait of ${member.name}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src={member.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f231d]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <p className="text-white/80 text-xs font-medium leading-relaxed">{member.bio}</p>
                    </div>
                  </div>
                  <h3 className="text-[#0d1c17] text-xl font-black mb-1 group-hover:text-[#059467] transition-colors">{member.name}</h3>
                  <p className="text-[#059467] text-[10px] font-black uppercase tracking-widest mb-4">
                    {member.role}
                  </p>
                  <div className="flex gap-4 text-slate-300">
                    <a className="hover:text-[#059467] transition-all transform hover:-translate-y-1" href="#">
                      <Globe className="w-5 h-5" />
                    </a>
                    <a className="hover:text-[#059467] transition-all transform hover:-translate-y-1" href="#">
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
              <Mail className="text-white w-8 h-8" />
            </div>
            <h2 className="text-white text-3xl md:text-5xl font-black mb-10 tracking-tight">
              Have a question for the crew?
            </h2>
            <button
              onClick={() => router.push('/contact')}
              className="group bg-[#059467] text-white text-lg font-black py-5 px-12 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 hover:bg-[#06ac77] transition-all duration-300 flex items-center gap-3 active:scale-95"
            >
              <span>Get in Touch</span>
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