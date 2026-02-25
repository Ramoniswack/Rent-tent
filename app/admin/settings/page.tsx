'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { Save, Loader2, ArrowLeft, Settings, Percent, Mail, Globe, Type, MessageSquare, Facebook, Twitter, Instagram, Copyright } from 'lucide-react';

interface SiteSettings {
  serviceFeePercentage: number;
  platformName: string;
  supportEmail: string;
  logoText: string;
  footerTagline: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  newsletterText: string;
  copyrightText: string;
}

export default function SiteSettingsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    serviceFeePercentage: 5,
    platformName: 'NomadNotes',
    supportEmail: 'support@travelbuddy.com',
    logoText: 'NomadNotes',
    footerTagline: 'Empowering the modern explorer with tools to travel further, work smarter, and live freely.',
    facebookUrl: 'https://facebook.com',
    twitterUrl: 'https://twitter.com',
    instagramUrl: 'https://instagram.com',
    newsletterText: 'Join our newsletter to get the latest travel tips and gear updates.',
    copyrightText: '© 2024 NomadNotes. All rights reserved.'
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/site-settings`);
      
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/admin/site-settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save setting');
      }
      
      setSuccessMessage(`${key} updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713]">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Site Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Configure platform-wide settings</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-green-600 dark:text-green-400 font-semibold">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Service Fee Percentage */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Percent className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Service Fee Percentage</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Fee applied to all gear rental bookings</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={settings.serviceFeePercentage}
                        onChange={(e) => setSettings({ ...settings, serviceFeePercentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-lg font-semibold focus:ring-2 focus:ring-[#059467]/30 outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold">%</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Current: {settings.serviceFeePercentage}% of rental amount
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleSave('serviceFeePercentage', settings.serviceFeePercentage)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Example:</strong> For a rental of NPR 1,000 with {settings.serviceFeePercentage}% fee, 
                    the service charge would be NPR {(1000 * settings.serviceFeePercentage / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Name */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Globe className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Name</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Display name for your platform</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="flex-1 max-w-md px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                  
                  <button
                    onClick={() => handleSave('platformName', settings.platformName)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Support Email */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Support Email</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Contact email for user support</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="flex-1 max-w-md px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                  
                  <button
                    onClick={() => handleSave('supportEmail', settings.supportEmail)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Header Settings Section */}
          <div className="col-span-full">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 mt-8">Header Settings</h3>
          </div>

          {/* Logo Text */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Type className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Logo Text</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Text displayed in the header logo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={settings.logoText}
                    onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                    className="flex-1 max-w-md px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                  
                  <button
                    onClick={() => handleSave('logoText', settings.logoText)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Settings Section */}
          <div className="col-span-full">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 mt-8">Footer Settings</h3>
          </div>

          {/* Footer Tagline */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-500/10 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Footer Tagline</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Description text in footer</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <textarea
                    value={settings.footerTagline}
                    onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
                    rows={3}
                    className="flex-1 max-w-2xl px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none resize-none"
                  />
                  
                  <button
                    onClick={() => handleSave('footerTagline', settings.footerTagline)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap self-start"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media URLs */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 col-span-full">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Social Media Links</h3>
            
            <div className="space-y-6">
              {/* Facebook */}
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Facebook className="w-5 h-5 text-blue-500" />
                </div>
                <input
                  type="url"
                  value={settings.facebookUrl}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
                <button
                  onClick={() => handleSave('facebookUrl', settings.facebookUrl)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </button>
              </div>

              {/* Twitter */}
              <div className="flex items-center gap-4">
                <div className="p-2 bg-sky-500/10 rounded-lg">
                  <Twitter className="w-5 h-5 text-sky-500" />
                </div>
                <input
                  type="url"
                  value={settings.twitterUrl}
                  onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/yourhandle"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
                <button
                  onClick={() => handleSave('twitterUrl', settings.twitterUrl)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </button>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-4">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Instagram className="w-5 h-5 text-pink-500" />
                </div>
                <input
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/yourprofile"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
                <button
                  onClick={() => handleSave('instagramUrl', settings.instagramUrl)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Newsletter Text */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Mail className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Newsletter Text</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Subscription text in footer</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <textarea
                    value={settings.newsletterText}
                    onChange={(e) => setSettings({ ...settings, newsletterText: e.target.value })}
                    rows={2}
                    className="flex-1 max-w-2xl px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none resize-none"
                  />
                  
                  <button
                    onClick={() => handleSave('newsletterText', settings.newsletterText)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap self-start"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Text */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-500/10 rounded-lg">
                    <Copyright className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Copyright Text</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Copyright notice in footer</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={settings.copyrightText}
                    onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                    className="flex-1 max-w-2xl px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                  
                  <button
                    onClick={() => handleSave('copyrightText', settings.copyrightText)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
