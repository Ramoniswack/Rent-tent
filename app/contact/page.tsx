'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Mail, Phone, MapPin, ArrowRight, ChevronDown } from 'lucide-react';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-[40px]">
      <div className="text-slate-400">Loading map...</div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] flex flex-col">
      <Header />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header Section */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-[#0f231d] tracking-tight mb-6 leading-[1.1]">
            We're base-camped and ready to help.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            Whether you're troubleshooting gear or planning a route, our team is on standby to get you back on the trail.
          </p>
        </div>

        {/* Dual Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 mb-20">
          {/* Left Column: Contact Form (60%) */}
          <div className="w-full lg:w-3/5 bg-white rounded-[40px] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-[#0f231d] uppercase tracking-wide">Name</span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-slate-50 border-0 text-[#0f231d] placeholder:text-slate-400 rounded-2xl h-14 px-5 focus:ring-2 focus:ring-[#059467] focus:bg-white transition-all font-medium"
                    placeholder="Alex Roamer"
                    type="text"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-[#0f231d] uppercase tracking-wide">Email</span>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-slate-50 border-0 text-[#0f231d] placeholder:text-slate-400 rounded-2xl h-14 px-5 focus:ring-2 focus:ring-[#059467] focus:bg-white transition-all font-medium"
                    placeholder="alex@nomad.com"
                    type="email"
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-[#0f231d] uppercase tracking-wide">Topic</span>
                <div className="relative">
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full appearance-none bg-slate-50 border-0 text-[#0f231d] rounded-2xl h-14 px-5 pr-10 focus:ring-2 focus:ring-[#059467] focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Partnership</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#059467]">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-[#0f231d] uppercase tracking-wide">Message</span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-slate-50 border-0 text-[#0f231d] placeholder:text-slate-400 rounded-2xl min-h-[180px] p-5 focus:ring-2 focus:ring-[#059467] focus:bg-white transition-all font-medium resize-none"
                  placeholder="Tell us about your adventure..."
                  required
                />
              </label>

              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full bg-[#059467] hover:bg-[#047a55] text-[#0f231d] text-base font-bold h-14 rounded-full shadow-lg shadow-[#059467]/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Send Message</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Contact Info (40%) */}
          <div className="w-full lg:w-2/5 bg-[#0f231d] rounded-[40px] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Abstract Pattern Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#059467]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col gap-10 relative z-10">
              {/* Response Badge */}
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full w-fit">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-yellow-500 text-xs font-bold uppercase tracking-wide">
                  Average response: 2 hours
                </span>
              </div>

              {/* Contact Details */}
              <div className="flex flex-col gap-8">
                <div className="flex items-start gap-5 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-sm font-medium mb-1">Email Support</span>
                    <a
                      className="text-lg font-bold hover:text-[#059467] transition-colors"
                      href="mailto:help@nomadnotes.com"
                    >
                      help@nomadnotes.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-colors">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-sm font-medium mb-1">Phone Line</span>
                    <a
                      className="text-lg font-bold hover:text-[#059467] transition-colors"
                      href="tel:+15550123456"
                    >
                      +1 (555) 012-3456
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#059467] group-hover/item:bg-[#059467] group-hover/item:text-[#0f231d] transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-sm font-medium mb-1">Headquarters</span>
                    <span className="text-lg font-bold">
                      123 Basecamp Blvd<br />
                      Boulder, CO 80302
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="pt-10 border-t border-white/10 mt-auto relative z-10">
              <p className="text-white/40 text-sm font-medium mb-4">Follow our journey</p>
              <div className="flex gap-4">
                <a
                  className="w-10 h-10 rounded-full bg-slate-100/10 hover:bg-[#059467] hover:text-[#0f231d] flex items-center justify-center transition-all text-white"
                  href="#"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-slate-100/10 hover:bg-[#059467] hover:text-[#0f231d] flex items-center justify-center transition-all text-white"
                  href="#"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      clipRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      fillRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-slate-100/10 hover:bg-[#059467] hover:text-[#0f231d] flex items-center justify-center transition-all text-white"
                  href="#"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      clipRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      fillRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="relative w-full h-[400px] rounded-[40px] overflow-hidden shadow-lg">
          {/* Leaflet Map */}
          <Map center={[40.0150, -105.2705]} zoom={13} />

          {/* Floating Address Card */}
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs transition-transform hover:-translate-y-1 z-[1000]">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#059467] shadow-[0_0_10px_#059467]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">NomadHQ</span>
            </div>
            <h3 className="text-[#0f231d] font-bold text-lg leading-tight mb-2">Boulder Basecamp</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              123 Basecamp Blvd, Suite 400<br />
              Boulder, CO 80302
            </p>
            <a
              className="text-[#059467] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
              href="https://maps.google.com/?q=40.0150,-105.2705"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
