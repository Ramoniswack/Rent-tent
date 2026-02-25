'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Loader2, Image as ImageIcon, Users, Compass, Heart, Mail } from 'lucide-react';

interface AboutPageEditorProps {
  onClose: () => void;
  onSave: () => void;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  social: {
    website: string;
    email: string;
  };
}

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface PageContent {
  hero: {
    badge: string;
    title: string;
    description: string[];
    image: string;
  };
  values: Value[];
  mission: {
    quote: string;
    attribution: string;
  };
  team: {
    title: string;
    subtitle: string;
    members: TeamMember[];
  };
  cta: {
    icon: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
}

const iconOptions = ['Compass', 'Users', 'Heart', 'Mail'];

export default function AboutPageEditor({ onClose, onSave }: AboutPageEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<PageContent | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const url = `${apiUrl}/api/pages/about`;
      
      console.log('Fetching About page from:', url);
      console.log('Has token:', !!token);
      
      const response = await fetch(url, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch page content: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      console.log('Content:', data.content);
      
      if (!data.content) {
        throw new Error('No content in response');
      }
      
      setContent(data.content);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const url = `${apiUrl}/api/admin/pages/about`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to save page');
      
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8">
          <Loader2 className="w-8 h-8 text-[#059467] animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 max-w-md">
          <p className="text-red-500 mb-4">{error || 'Failed to load content'}</p>
          <button onClick={onClose} className="w-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#132a24] rounded-3xl max-w-6xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Edit About Page</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Customize all sections of your About page</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Hero Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-[#059467]/10 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-[#059467]" />
              </div>
              Hero Section
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Hero Image URL</label>
                <input
                  type="text"
                  value={content.hero.image}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, image: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Main Title</label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>

            {content.hero.description.map((para, index) => (
              <div key={index}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Paragraph {index + 1}</label>
                <textarea
                  value={para}
                  onChange={(e) => {
                    const newDesc = [...content.hero.description];
                    newDesc[index] = e.target.value;
                    setContent({ ...content, hero: { ...content.hero, description: newDesc } });
                  }}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>
            ))}
          </div>

          {/* Values Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-[#059467]/10 rounded-lg flex items-center justify-center">
                  <Compass className="w-4 h-4 text-[#059467]" />
                </div>
                Values
              </h3>
              <button
                onClick={() => setContent({
                  ...content,
                  values: [...content.values, { icon: 'Compass', title: '', description: '' }]
                })}
                className="flex items-center gap-2 px-4 py-2 bg-[#059467] text-white rounded-lg hover:bg-[#047854] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Value
              </button>
            </div>

            {content.values.map((value, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Value {index + 1}</span>
                  <button
                    onClick={() => setContent({ ...content, values: content.values.filter((_, i) => i !== index) })}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Icon</label>
                    <select
                      value={value.icon}
                      onChange={(e) => {
                        const newValues = [...content.values];
                        newValues[index].icon = e.target.value;
                        setContent({ ...content, values: newValues });
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={value.title}
                      onChange={(e) => {
                        const newValues = [...content.values];
                        newValues[index].title = e.target.value;
                        setContent({ ...content, values: newValues });
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                  <textarea
                    value={value.description}
                    onChange={(e) => {
                      const newValues = [...content.values];
                      newValues[index].description = e.target.value;
                      setContent({ ...content, values: newValues });
                    }}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mission Statement</h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Quote</label>
              <textarea
                value={content.mission.quote}
                onChange={(e) => setContent({ ...content, mission: { ...content.mission, quote: e.target.value } })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Attribution</label>
              <input
                type="text"
                value={content.mission.attribution}
                onChange={(e) => setContent({ ...content, mission: { ...content.mission, attribution: e.target.value } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
          </div>

          {/* Team Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-[#059467]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#059467]" />
                </div>
                Team
              </h3>
              <button
                onClick={() => setContent({
                  ...content,
                  team: {
                    ...content.team,
                    members: [...content.team.members, {
                      name: '',
                      role: '',
                      image: 'https://i.pravatar.cc/400',
                      bio: '',
                      social: { website: '#', email: '#' }
                    }]
                  }
                })}
                className="flex items-center gap-2 px-4 py-2 bg-[#059467] text-white rounded-lg hover:bg-[#047854] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.team.title}
                  onChange={(e) => setContent({ ...content, team: { ...content.team, title: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={content.team.subtitle}
                  onChange={(e) => setContent({ ...content, team: { ...content.team, subtitle: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>
            </div>

            {content.team.members.map((member, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Team Member {index + 1}</span>
                  <button
                    onClick={() => setContent({
                      ...content,
                      team: { ...content.team, members: content.team.members.filter((_, i) => i !== index) }
                    })}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => {
                      const newMembers = [...content.team.members];
                      newMembers[index].name = e.target.value;
                      setContent({ ...content, team: { ...content.team, members: newMembers } });
                    }}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  />
                  
                  <input
                    type="text"
                    placeholder="Role"
                    value={member.role}
                    onChange={(e) => {
                      const newMembers = [...content.team.members];
                      newMembers[index].role = e.target.value;
                      setContent({ ...content, team: { ...content.team, members: newMembers } });
                    }}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Image URL"
                  value={member.image}
                  onChange={(e) => {
                    const newMembers = [...content.team.members];
                    newMembers[index].image = e.target.value;
                    setContent({ ...content, team: { ...content.team, members: newMembers } });
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                />
                
                <textarea
                  placeholder="Bio"
                  value={member.bio}
                  onChange={(e) => {
                    const newMembers = [...content.team.members];
                    newMembers[index].bio = e.target.value;
                    setContent({ ...content, team: { ...content.team, members: newMembers } });
                  }}
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-[#059467]/10 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-[#059467]" />
              </div>
              Call to Action
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Icon</label>
                <select
                  value={content.cta.icon}
                  onChange={(e) => setContent({ ...content, cta: { ...content.cta, icon: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Button Link</label>
                <input
                  type="text"
                  value={content.cta.buttonLink}
                  onChange={(e) => setContent({ ...content, cta: { ...content.cta, buttonLink: e.target.value } })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={content.cta.title}
                onChange={(e) => setContent({ ...content, cta: { ...content.cta, title: e.target.value } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Button Text</label>
              <input
                type="text"
                value={content.cta.buttonText}
                onChange={(e) => setContent({ ...content, cta: { ...content.cta, buttonText: e.target.value } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-8 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors flex items-center gap-2 disabled:opacity-50"
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
