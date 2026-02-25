'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../../components/Header';
import { Plus, Trash2, Save, Loader2, ArrowLeft, Eye } from 'lucide-react';

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

export default function EditContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ContactContent | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const url = `${apiUrl}/api/pages/contact`;
      
      const response = await fetch(url, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (!response.ok) throw new Error('Failed to fetch page content');
      
      const data = await response.json();
      setContent(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const url = `${apiUrl}/api/admin/pages/contact`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save page');
      }
      
      setSuccessMessage('Contact page updated successfully!');
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

  if (error && !content) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Back to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
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
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Edit Contact Page</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Customize all sections of your Contact page</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Preview
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
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

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Hero Section</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Main Title</label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title Highlight</label>
                  <input
                    type="text"
                    value={content.hero.titleHighlight}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleHighlight: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea
                  value={content.hero.description}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Response Time Badge</label>
                <input
                  type="text"
                  value={content.contactInfo.responseTime}
                  onChange={(e) => setContent({ ...content, contactInfo: { ...content.contactInfo, responseTime: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Label</label>
                  <input
                    type="text"
                    value={content.contactInfo.email.label}
                    onChange={(e) => setContent({ ...content, contactInfo: { ...content.contactInfo, email: { ...content.contactInfo.email, label: e.target.value } } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={content.contactInfo.email.value}
                    onChange={(e) => setContent({ ...content, contactInfo: { ...content.contactInfo, email: { ...content.contactInfo.email, value: e.target.value } } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Label</label>
                  <input
                    type="text"
                    value={content.contactInfo.phone.label}
                    onChange={(e) => setContent({ ...content, contactInfo: { ...content.contactInfo, phone: { ...content.contactInfo.phone, label: e.target.value } } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={content.contactInfo.phone.value}
                    onChange={(e) => setContent({ ...content, contactInfo: { ...content.contactInfo, phone: { ...content.contactInfo.phone, value: e.target.value } } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Address Label</label>
                <input
                  type="text"
                  value={content.contactInfo.address.label}
                  onChange={(e) => setContent({ ...content, contactInfo: { ...content.contactInfo, address: { ...content.contactInfo.address, label: e.target.value } } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={content.contactInfo.address.street}
                    onChange={(e) => setContent({ ...content, contactInfo: { ...content.contactInfo, address: { ...content.contactInfo.address, street: e.target.value } } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City, State ZIP</label>
                  <input
                    type="text"
                    value={content.contactInfo.address.city}
                    onChange={(e) => setContent({ ...content, contactInfo: { ...content.contactInfo, address: { ...content.contactInfo.address, city: e.target.value } } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Topics Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Form Topics</h2>
              <button
                onClick={() => setContent({ ...content, formTopics: [...content.formTopics, 'New Topic'] })}
                className="flex items-center gap-2 px-4 py-2 bg-[#059467] text-white rounded-lg hover:bg-[#047854] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Topic
              </button>
            </div>

            <div className="space-y-4">
              {content.formTopics.map((topic, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => {
                      const newTopics = [...content.formTopics];
                      newTopics[index] = e.target.value;
                      setContent({ ...content, formTopics: newTopics });
                    }}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                  <button
                    onClick={() => setContent({ ...content, formTopics: content.formTopics.filter((_, i) => i !== index) })}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Map Settings</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={content.map.latitude}
                    onChange={(e) => setContent({ ...content, map: { ...content.map, latitude: parseFloat(e.target.value) } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={content.map.longitude}
                    onChange={(e) => setContent({ ...content, map: { ...content.map, longitude: parseFloat(e.target.value) } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Zoom Level</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={content.map.zoom}
                    onChange={(e) => setContent({ ...content, map: { ...content.map, zoom: parseInt(e.target.value) } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Label</label>
                  <input
                    type="text"
                    value={content.map.cardLabel}
                    onChange={(e) => setContent({ ...content, map: { ...content.map, cardLabel: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Title</label>
                  <input
                    type="text"
                    value={content.map.cardTitle}
                    onChange={(e) => setContent({ ...content, map: { ...content.map, cardTitle: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Address</label>
                  <input
                    type="text"
                    value={content.map.cardAddress}
                    onChange={(e) => setContent({ ...content, map: { ...content.map, cardAddress: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card City</label>
                  <input
                    type="text"
                    value={content.map.cardCity}
                    onChange={(e) => setContent({ ...content, map: { ...content.map, cardCity: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Social Links</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.social.title}
                  onChange={(e) => setContent({ ...content, social: { ...content.social, title: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>

              <div className="space-y-4">
                {content.social.links.map((link, index) => (
                  <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Social Link {index + 1}</span>
                      <button
                        onClick={() => setContent({ ...content, social: { ...content.social, links: content.social.links.filter((_, i) => i !== index) } })}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Name</label>
                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => {
                            const newLinks = [...content.social.links];
                            newLinks[index].name = e.target.value;
                            setContent({ ...content, social: { ...content.social, links: newLinks } });
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">URL</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...content.social.links];
                            newLinks[index].url = e.target.value;
                            setContent({ ...content, social: { ...content.social, links: newLinks } });
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end gap-4 sticky bottom-6">
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50 shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
