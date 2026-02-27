'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { 
  Save, Loader2, ArrowLeft, Percent, Mail, Globe, 
  Type, MessageSquare, Facebook, Twitter, Instagram, Copyright,
  CheckCircle2, AlertCircle, Plus, Edit2, Trash2, Link as LinkIcon
} from 'lucide-react';

interface MenuItem {
  label: string;
  url: string;
}

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
  footerProductMenu: MenuItem[];
  footerCompanyMenu: MenuItem[];
}

// Type for simple settings (excluding arrays)
type SimpleSettingKey = Exclude<keyof SiteSettings, 'footerProductMenu' | 'footerCompanyMenu'>;

export default function SiteSettingsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<keyof SiteSettings | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    copyrightText: '© 2024 NomadNotes. All rights reserved.',
    footerProductMenu: [],
    footerCompanyMenu: []
  });

  // Footer menu inputs
  const [newProductMenuLabel, setNewProductMenuLabel] = useState('');
  const [newProductMenuUrl, setNewProductMenuUrl] = useState('');
  const [editingProductMenuIndex, setEditingProductMenuIndex] = useState<number | null>(null);
  
  const [newCompanyMenuLabel, setNewCompanyMenuLabel] = useState('');
  const [newCompanyMenuUrl, setNewCompanyMenuUrl] = useState('');
  const [editingCompanyMenuIndex, setEditingCompanyMenuIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      
      // Fetch site settings
      const settingsResponse = await fetch(`${apiUrl}/api/site-settings`);
      if (!settingsResponse.ok) throw new Error('Failed to fetch settings');
      const settingsData = await settingsResponse.json();
      
      // Fetch footer menus from profile-field-options
      const menusResponse = await fetch(`${apiUrl}/api/profile-field-options`);
      const menusData = menusResponse.ok ? await menusResponse.json() : {};
      
      // Combine both data sources
      setSettings({
        ...settingsData,
        footerProductMenu: Array.isArray(menusData.footerProductMenu) ? menusData.footerProductMenu : [],
        footerCompanyMenu: Array.isArray(menusData.footerCompanyMenu) ? menusData.footerCompanyMenu : []
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: keyof SiteSettings) => {
    try {
      setSavingKey(key);
      setError('');
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      
      // Footer menus are stored in profile-field-options, not site-settings
      if (key === 'footerProductMenu' || key === 'footerCompanyMenu') {
        const response = await fetch(`${apiUrl}/api/profile-field-options/${key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ menuItems: settings[key] })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to save menu');
        }
      } else {
        const response = await fetch(`${apiUrl}/api/admin/site-settings/${key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ value: settings[key] })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to save setting');
        }
      }
      
      setSuccessMessage('Setting updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleChange = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const addFooterMenuItem = (menuType: 'footerProductMenu' | 'footerCompanyMenu') => {
    const label = menuType === 'footerProductMenu' ? newProductMenuLabel : newCompanyMenuLabel;
    const url = menuType === 'footerProductMenu' ? newProductMenuUrl : newCompanyMenuUrl;
    const editingIndex = menuType === 'footerProductMenu' ? editingProductMenuIndex : editingCompanyMenuIndex;
    
    if (!label.trim() || !url.trim()) {
      showError('Label and URL are required');
      return;
    }
    
    // Ensure the menu array exists
    const currentMenu = Array.isArray(settings[menuType]) ? settings[menuType] : [];
    
    if (editingIndex !== null) {
      const updatedItems = [...currentMenu];
      updatedItems[editingIndex] = { label: label.trim(), url: url.trim() };
      setSettings({ ...settings, [menuType]: updatedItems });
      
      if (menuType === 'footerProductMenu') {
        setEditingProductMenuIndex(null);
      } else {
        setEditingCompanyMenuIndex(null);
      }
    } else {
      setSettings({
        ...settings,
        [menuType]: [...currentMenu, { label: label.trim(), url: url.trim() }]
      });
    }
    
    if (menuType === 'footerProductMenu') {
      setNewProductMenuLabel('');
      setNewProductMenuUrl('');
    } else {
      setNewCompanyMenuLabel('');
      setNewCompanyMenuUrl('');
    }
  };
  
  const editFooterMenuItem = (menuType: 'footerProductMenu' | 'footerCompanyMenu', index: number) => {
    const currentMenu = Array.isArray(settings[menuType]) ? settings[menuType] : [];
    const item = currentMenu[index];
    if (!item) return;
    
    if (menuType === 'footerProductMenu') {
      setNewProductMenuLabel(item.label);
      setNewProductMenuUrl(item.url);
      setEditingProductMenuIndex(index);
    } else {
      setNewCompanyMenuLabel(item.label);
      setNewCompanyMenuUrl(item.url);
      setEditingCompanyMenuIndex(index);
    }
  };
  
  const removeFooterMenuItem = (menuType: 'footerProductMenu' | 'footerCompanyMenu', index: number) => {
    const currentMenu = Array.isArray(settings[menuType]) ? settings[menuType] : [];
    
    setSettings({
      ...settings,
      [menuType]: currentMenu.filter((_, i) => i !== index)
    });
    
    if (menuType === 'footerProductMenu' && editingProductMenuIndex === index) {
      setEditingProductMenuIndex(null);
      setNewProductMenuLabel('');
      setNewProductMenuUrl('');
    } else if (menuType === 'footerCompanyMenu' && editingCompanyMenuIndex === index) {
      setEditingCompanyMenuIndex(null);
      setNewCompanyMenuLabel('');
      setNewCompanyMenuUrl('');
    }
  };

  // Reusable UI Component for each setting row
  const SettingRow = ({ 
    icon: Icon, title, description, settingKey, type = 'text', 
    iconBg = 'bg-slate-500/10', iconColor = 'text-slate-500', extraContent = null 
  }: {
    icon: any;
    title: string;
    description: string;
    settingKey: SimpleSettingKey;
    type?: 'text' | 'number' | 'url' | 'email' | 'textarea';
    iconBg?: string;
    iconColor?: string;
    extraContent?: React.ReactNode;
  }) => {
    const isSaving = savingKey === settingKey;
    
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-2 rounded-lg ${iconBg} mt-1`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">{description}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 w-full md:w-auto md:min-w-[400px]">
            <div className="relative flex-1">
              {type === 'textarea' ? (
                <textarea
                  value={String(settings[settingKey] || '')}
                  onChange={(e) => handleChange(settingKey, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#059467]/30 outline-none resize-none transition-all"
                />
              ) : (
                <input
                  type={type === 'number' ? 'number' : type === 'url' ? 'url' : type === 'email' ? 'email' : 'text'}
                  value={type === 'number' ? Number(settings[settingKey]) : String(settings[settingKey] || '')}
                  onChange={(e) => handleChange(settingKey, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#059467]/30 outline-none transition-all"
                  step={type === 'number' ? '0.1' : undefined}
                />
              )}
              {type === 'number' && settingKey === 'serviceFeePercentage' && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">%</span>
              )}
            </div>
            
            <button
              onClick={() => handleSave(settingKey)}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#059467] text-white rounded-xl font-medium hover:bg-[#047854] transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap min-w-[100px]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving' : 'Save'}
            </button>
          </div>
        </div>
        {extraContent}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#059467] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713] pb-20">
      <Header />
      
      {/* Toast Notifications */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {successMessage && (
          <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.push('/admin')}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Site Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage core configuration and platform branding</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. General Settings Section */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">General</h2>
            <div className="bg-white dark:bg-[#132a24] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-6 divide-y divide-slate-100 dark:divide-slate-800/60">
              <SettingRow 
                icon={Globe} title="Platform Name" description="Display name for your platform across the site."
                settingKey="platformName" iconBg="bg-purple-500/10" iconColor="text-purple-500"
              />
              <SettingRow 
                icon={Mail} title="Support Email" description="Contact email for user support and inquiries."
                settingKey="supportEmail" type="email" iconBg="bg-blue-500/10" iconColor="text-blue-500"
              />
              <SettingRow 
                icon={Percent} title="Service Fee Percentage" description="Global fee applied to all gear rental bookings."
                settingKey="serviceFeePercentage" type="number" iconBg="bg-green-500/10" iconColor="text-green-500"
                extraContent={
                  <div className="ml-0 md:ml-14 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 inline-block">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Example:</strong> A rental of NPR 1,000 will have a service charge of NPR {(1000 * settings.serviceFeePercentage / 100).toFixed(2)}.
                    </p>
                  </div>
                }
              />
            </div>
          </section>

          {/* 2. Branding Section */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Branding</h2>
            <div className="bg-white dark:bg-[#132a24] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-6 divide-y divide-slate-100 dark:divide-slate-800/60">
              <SettingRow 
                icon={Type} title="Logo Text" description="Text displayed in the top navigation bar."
                settingKey="logoText" iconBg="bg-cyan-500/10" iconColor="text-cyan-500"
              />
            </div>
          </section>

          {/* 3. Social Media Section */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Social Links</h2>
            <div className="bg-white dark:bg-[#132a24] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-6 divide-y divide-slate-100 dark:divide-slate-800/60">
              <SettingRow 
                icon={Facebook} title="Facebook" description="Link to your official Facebook page."
                settingKey="facebookUrl" type="url" iconBg="bg-blue-600/10" iconColor="text-blue-600"
              />
              <SettingRow 
                icon={Twitter} title="Twitter (X)" description="Link to your official Twitter profile."
                settingKey="twitterUrl" type="url" iconBg="bg-sky-500/10" iconColor="text-sky-500"
              />
              <SettingRow 
                icon={Instagram} title="Instagram" description="Link to your official Instagram account."
                settingKey="instagramUrl" type="url" iconBg="bg-pink-500/10" iconColor="text-pink-500"
              />
            </div>
          </section>

          {/* 4. Footer Section */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Footer Configuration</h2>
            <div className="bg-white dark:bg-[#132a24] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-6 divide-y divide-slate-100 dark:divide-slate-800/60">
              <SettingRow 
                icon={MessageSquare} title="Footer Tagline" description="Brief description shown in the footer area."
                settingKey="footerTagline" type="textarea" iconBg="bg-teal-500/10" iconColor="text-teal-500"
              />
              <SettingRow 
                icon={Mail} title="Newsletter Text" description="Call to action text above the newsletter input."
                settingKey="newsletterText" type="textarea" iconBg="bg-orange-500/10" iconColor="text-orange-500"
              />
              <SettingRow 
                icon={Copyright} title="Copyright Text" description="Legal copyright notice at the bottom of the page."
                settingKey="copyrightText" iconBg="bg-slate-500/10" iconColor="text-slate-500"
              />
            </div>
          </section>

          {/* 5. Footer Product Menu */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Footer Product Menu</h2>
            <div className="bg-white dark:bg-[#132a24] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Manage links for the Product column in the footer.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Menu Label</label>
                    <input
                      type="text"
                      value={newProductMenuLabel}
                      onChange={(e) => setNewProductMenuLabel(e.target.value)}
                      placeholder="e.g. Browse Gear"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Destination URL</label>
                    <input
                      type="text"
                      value={newProductMenuUrl}
                      onChange={(e) => setNewProductMenuUrl(e.target.value)}
                      placeholder="e.g. /gear"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addFooterMenuItem('footerProductMenu')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors text-sm"
                  >
                    {editingProductMenuIndex !== null ? <><Edit2 className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Link</>}
                  </button>
                  {editingProductMenuIndex !== null && (
                    <button
                      onClick={() => {
                        setEditingProductMenuIndex(null);
                        setNewProductMenuLabel('');
                        setNewProductMenuUrl('');
                      }}
                      className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {settings.footerProductMenu?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-cyan-50/50 dark:bg-cyan-500/5 border border-cyan-200/50 dark:border-cyan-500/10 rounded-xl group hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">{item.url}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => editFooterMenuItem('footerProductMenu', index)} 
                        className="p-2 hover:bg-cyan-200/50 dark:hover:bg-cyan-500/20 rounded-lg transition-colors text-cyan-600 dark:text-cyan-400"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeFooterMenuItem('footerProductMenu', index)} 
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!settings.footerProductMenu || settings.footerProductMenu.length === 0) && (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                    No menu items added yet
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSave('footerProductMenu')}
                disabled={savingKey === 'footerProductMenu'}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#059467] text-white rounded-xl font-medium hover:bg-[#047854] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {savingKey === 'footerProductMenu' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingKey === 'footerProductMenu' ? 'Saving' : 'Save Product Menu'}
              </button>
            </div>
          </section>

          {/* 6. Footer Company Menu */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Footer Company Menu</h2>
            <div className="bg-white dark:bg-[#132a24] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Manage links for the Company column in the footer.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Menu Label</label>
                    <input
                      type="text"
                      value={newCompanyMenuLabel}
                      onChange={(e) => setNewCompanyMenuLabel(e.target.value)}
                      placeholder="e.g. About Us"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Destination URL</label>
                    <input
                      type="text"
                      value={newCompanyMenuUrl}
                      onChange={(e) => setNewCompanyMenuUrl(e.target.value)}
                      placeholder="e.g. /about"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addFooterMenuItem('footerCompanyMenu')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors text-sm"
                  >
                    {editingCompanyMenuIndex !== null ? <><Edit2 className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Link</>}
                  </button>
                  {editingCompanyMenuIndex !== null && (
                    <button
                      onClick={() => {
                        setEditingCompanyMenuIndex(null);
                        setNewCompanyMenuLabel('');
                        setNewCompanyMenuUrl('');
                      }}
                      className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {settings.footerCompanyMenu?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-violet-50/50 dark:bg-violet-500/5 border border-violet-200/50 dark:border-violet-500/10 rounded-xl group hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span>
                        <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">{item.url}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => editFooterMenuItem('footerCompanyMenu', index)} 
                        className="p-2 hover:bg-violet-200/50 dark:hover:bg-violet-500/20 rounded-lg transition-colors text-violet-600 dark:text-violet-400"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeFooterMenuItem('footerCompanyMenu', index)} 
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!settings.footerCompanyMenu || settings.footerCompanyMenu.length === 0) && (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                    No menu items added yet
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSave('footerCompanyMenu')}
                disabled={savingKey === 'footerCompanyMenu'}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#059467] text-white rounded-xl font-medium hover:bg-[#047854] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {savingKey === 'footerCompanyMenu' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingKey === 'footerCompanyMenu' ? 'Saving' : 'Save Company Menu'}
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
    
  );
}