'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Mail, ArrowRight, Quote, Globe, AtSign } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  const teamMembers = [
    {
      name: 'Sarah Jenkins',
      role: 'Founder & CEO',
      image: 'https://i.pravatar.cc/400?img=1',
    },
    {
      name: 'Marcus Chen',
      role: 'Head of Product',
      image: 'https://i.pravatar.cc/400?img=13',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Community Lead',
      image: 'https://i.pravatar.cc/400?img=5',
    },
    {
      name: 'David Okonjo',
      role: 'Tech Lead',
      image: 'https://i.pravatar.cc/400?img=12',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f7]">
      <Header />

      <main className="flex-grow">
        {/* Hero Narrative Section */}
        <section className="px-6 py-12 lg:py-20 flex justify-center bg-[#f5f8f7]">
          <div className="max-w-[1024px] w-full flex flex-col items-center text-center">
            {/* Eyebrow */}
            <span className="text-[#059467] text-xs font-bold tracking-widest uppercase mb-4">
              Our Journey
            </span>

            {/* Headline */}
            <h1 className="text-[#0d1c17] text-4xl md:text-[48px] font-black leading-tight tracking-[-0.02em] max-w-[800px] mb-8">
              Built by Nomads, for Nomads
            </h1>

            {/* Body Text */}
            <div className="flex flex-col gap-6 max-w-[720px] text-slate-500 text-lg font-medium leading-relaxed mb-12">
              <p>
                We started NomadNotes on a rainy afternoon in Bali, realizing that while the world is vast, the tools to navigate it as a worker were limited. What began as a shared spreadsheet of Wi-Fi speeds and coffee shop vibes has grown into a global movement.
              </p>
              <p>
                Today, we're a diverse team of explorers dedicated to making the digital nomad lifestyle sustainable, accessible, and deeply connected for everyone, everywhere. We believe that home isn't a place, but a feeling you carry with you.
              </p>
            </div>

            {/* Hero Image */}
            <div 
              className="w-full aspect-[21/9] bg-center bg-cover bg-no-repeat rounded-xl shadow-lg overflow-hidden relative group"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80')"
              }}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
            </div>
          </div>
        </section>

        {/* Mission Statement Card */}
        <section className="px-6 py-10 flex justify-center">
          <div className="max-w-[1024px] w-full bg-[#0f231d] rounded-xl p-10 md:p-20 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
            {/* Decorative Icon */}
            <Quote className="text-[#059467] w-16 h-16 mb-6 opacity-80" />

            {/* Quote */}
            <blockquote className="relative z-10">
              <p className="text-white text-2xl md:text-[32px] font-bold leading-tight tracking-tight">
                "To empower the global workforce to explore without boundaries."
              </p>
              <footer className="mt-6 text-[#059467] font-medium tracking-wide uppercase text-sm">
                — NomadNotes Mission
              </footer>
            </blockquote>

            {/* Abstract Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#059467]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#059467]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          </div>
        </section>

        {/* Team Grid */}
        <section className="px-6 py-16 lg:py-24 flex justify-center bg-white">
          <div className="max-w-[1024px] w-full">
            <div className="text-center mb-16">
              <h2 className="text-[#0d1c17] text-3xl font-bold mb-4">Meet the Crew</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                The explorers, builders, and dreamers behind the screen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="group flex flex-col items-center">
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-6 shadow-md transition-transform duration-300 group-hover:scale-105">
                    <img
                      alt={`Portrait of ${member.name}`}
                      className="w-full h-full object-cover"
                      src={member.image}
                    />
                  </div>
                  <h3 className="text-[#0d1c17] text-2xl font-bold mb-1">{member.name}</h3>
                  <p className="text-[#059467] text-sm font-semibold uppercase tracking-wide mb-4">
                    {member.role}
                  </p>
                  <div className="flex gap-3 text-slate-400">
                    <a className="hover:text-[#059467] transition-colors" href="#">
                      <Globe className="w-5 h-5" />
                    </a>
                    <a className="hover:text-[#059467] transition-colors" href="#">
                      <AtSign className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="border-t-4 border-[#059467] bg-[#f5f8f7] py-20 px-6">
          <div className="max-w-[1024px] mx-auto flex flex-col items-center text-center">
            <div className="bg-[#059467]/10 p-4 rounded-full mb-6">
              <Mail className="text-[#059467] w-8 h-8" />
            </div>
            <h2 className="text-[#0d1c17] text-3xl md:text-[32px] font-bold mb-8">
              Have a question for the crew?
            </h2>
            <button
              onClick={() => router.push('/contact')}
              className="bg-[#059467] text-white text-lg font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-[#047a55] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
