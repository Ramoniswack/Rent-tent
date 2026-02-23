'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const router = useRouter();

  return (
    <footer className="bg-[#0f231d] text-white py-20 px-6 lg:px-20 mt-12 rounded-t-[3rem]">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-[#059467] rounded-lg flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">NomadNotes</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Empowering the modern explorer with tools to travel further, work smarter, and live freely.
          </p>
          <div className="flex gap-4 mt-4">
            <a
              href="#"
              className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Facebook className="w-5 h-5 text-slate-400 hover:text-white" />
            </a>
            <a
              href="#"
              className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Twitter className="w-5 h-5 text-slate-400 hover:text-white" />
            </a>
            <a
              href="#"
              className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Instagram className="w-5 h-5 text-slate-400 hover:text-white" />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Product</h4>
          <button
            onClick={() => router.push('/match')}
            className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm text-left"
          >
            Match
          </button>
          <button
            onClick={() => router.push('/gear')}
            className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm text-left"
          >
            Gear Rental
          </button>
          <a href="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm">
            Messages
          </a>
          <a href="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm">
            Map
          </a>
        </div>

        {/* Links Column 2 */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Company</h4>
          <button
            onClick={() => router.push('/about')}
            className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm text-left"
          >
            About Us
          </button>
          <button
            onClick={() => router.push('/contact')}
            className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm text-left"
          >
            Contact
          </button>
          <a href="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm">
            Careers
          </a>
          <a href="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm">
            Community
          </a>
          <a href="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm">
            Blog
          </a>
        </div>

        {/* Newsletter Column */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Subscribe</h4>
          <p className="text-slate-400 text-sm">
            Join our newsletter to get the latest travel tips and gear updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent flex-grow"
            />
            <button className="bg-[#059467] hover:bg-[#047a55] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">© 2024 NomadNotes Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
