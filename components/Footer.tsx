'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [settings, setSettings] = useState({
    logoText: 'NomadNotes',
    footerTagline: 'Empowering the modern explorer with tools to travel further, work smarter, and live freely.',
    facebookUrl: 'https://facebook.com',
    twitterUrl: 'https://twitter.com',
    instagramUrl: 'https://instagram.com',
    newsletterText: 'Join our newsletter to get the latest travel tips and gear updates.',
    copyrightText: '© 2024 NomadNotes. All rights reserved.'
  });
  
  const [productMenu, setProductMenu] = useState<Array<{label: string, url: string}>>([]);
  const [companyMenu, setCompanyMenu] = useState<Array<{label: string, url: string}>>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/site-settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching footer settings:', error);
      }
    };
    
    const fetchMenus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/profile-field-options`);
        if (response.ok) {
          const data = await response.json();
          if (data.footerProductMenu) setProductMenu(data.footerProductMenu);
          if (data.footerCompanyMenu) setCompanyMenu(data.footerCompanyMenu);
        }
      } catch (error) {
        console.error('Error fetching footer menus:', error);
      }
    };
    
    fetchSettings();
    fetchMenus();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source: 'footer' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message);
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.message || 'Failed to subscribe. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('Failed to subscribe. Please check your connection.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <footer className="hidden md:block bg-[#0b1713] text-white py-12 px-6 lg:px-20 mt-0">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-[#059467] rounded-lg flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">{settings.logoText}</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            {settings.footerTagline}
          </p>
          <div className="flex gap-4 mt-4">
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Facebook className="w-5 h-5 text-slate-400 hover:text-white" />
            </a>
            <a
              href={settings.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Twitter className="w-5 h-5 text-slate-400 hover:text-white" />
            </a>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Instagram className="w-5 h-5 text-slate-400 hover:text-white" />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Product</h4>
          {productMenu.map((item, index) => (
            item.url.startsWith('/') ? (
              <button
                key={index}
                onClick={() => router.push(item.url)}
                className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm text-left"
              >
                {item.label}
              </button>
            ) : (
              <a
                key={index}
                href={item.url}
                className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm"
              >
                {item.label}
              </a>
            )
          ))}
        </div>

        {/* Links Column 2 */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Company</h4>
          {companyMenu.map((item, index) => (
            item.url.startsWith('/') ? (
              <button
                key={index}
                onClick={() => router.push(item.url)}
                className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm text-left"
              >
                {item.label}
              </button>
            ) : (
              <a
                key={index}
                href={item.url}
                className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-sm"
              >
                {item.label}
              </a>
            )
          ))}
        </div>

        {/* Newsletter Column */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Subscribe</h4>
          <p className="text-slate-400 text-sm">
            {settings.newsletterText}
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isSubmitting}
                className="bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent flex-grow disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#059467] hover:bg-[#047a55] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {message && (
              <p className={`text-sm ${messageType === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">{settings.copyrightText}</p>
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