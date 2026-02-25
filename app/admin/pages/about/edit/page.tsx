'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../../components/Header';
import { Plus, Trash2, Save, Loader2, ArrowLeft, Eye, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary, validateImageFile } from '../../../../../lib/cloudinary';

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

export default function EditAboutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<PageContent | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingMemberImage, setUploadingMemberImage] = useState<number | null>(null);
  const [memberUploadProgress, setMemberUploadProgress] = useState(0);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const url = `${apiUrl}/api/pages/about`;
      
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      setUploadProgress(0);

      const result = await uploadImageToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      setContent({
        ...content!,
        hero: {
          ...content!.hero,
          image: result.secure_url
        }
      });

      setSuccessMessage('Image uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleMemberImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, memberIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadingMemberImage(memberIndex);
      setError('');
      setMemberUploadProgress(0);

      const result = await uploadImageToCloudinary(file, (progress) => {
        setMemberUploadProgress(progress);
      });

      const newMembers = [...content!.team.members];
      newMembers[memberIndex].image = result.secure_url;
      setContent({
        ...content!,
        team: {
          ...content!.team,
          members: newMembers
        }
      });

      setSuccessMessage('Member image uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingMemberImage(null);
      setMemberUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    try {
      setSaving(true);
      setError('');
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save page');
      }
      
      const data = await response.json();
      
      setSuccessMessage('About page updated successfully!');
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
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Edit About Page</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Customize all sections of your About page</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="/about"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Hero Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={content.hero.image}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, image: e.target.value } })}
                      placeholder="Image URL or upload below"
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                    />
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 px-4 py-3 bg-[#059467] text-white rounded-xl hover:bg-[#047854] transition-colors disabled:opacity-50">
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Upload
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  {content.hero.image && (
                    <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img 
                        src={content.hero.image} 
                        alt="Hero preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <ImageIcon className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  )}
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
          </div>

          {/* Values Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Values</h2>
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

            <div className="space-y-4">
              {content.values.map((value, index) => (
                <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Value {index + 1}</span>
                    <button
                      onClick={() => setContent({ ...content, values: content.values.filter((_, i) => i !== index) })}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Icon</label>
                      <select
                        value={value.icon}
                        onChange={(e) => {
                          const newValues = [...content.values];
                          newValues[index].icon = e.target.value;
                          setContent({ ...content, values: newValues });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Title</label>
                      <input
                        type="text"
                        value={value.title}
                        onChange={(e) => {
                          const newValues = [...content.values];
                          newValues[index].title = e.target.value;
                          setContent({ ...content, values: newValues });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Description</label>
                    <textarea
                      value={value.description}
                      onChange={(e) => {
                        const newValues = [...content.values];
                        newValues[index].description = e.target.value;
                        setContent({ ...content, values: newValues });
                      }}
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Mission Statement</h2>
            
            <div className="space-y-6">
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
          </div>

          {/* Team Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Team</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

            <div className="space-y-4">
              {content.team.members.map((member, index) => (
                <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Team Member {index + 1}</span>
                    <button
                      onClick={() => setContent({
                        ...content,
                        team: { ...content.team, members: content.team.members.filter((_, i) => i !== index) }
                      })}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const newMembers = [...content.team.members];
                        newMembers[index].name = e.target.value;
                        setContent({ ...content, team: { ...content.team, members: newMembers } });
                      }}
                      className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
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
                      className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Member Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload below"
                        value={member.image}
                        onChange={(e) => {
                          const newMembers = [...content.team.members];
                          newMembers[index].image = e.target.value;
                          setContent({ ...content, team: { ...content.team, members: newMembers } });
                        }}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                      />
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMemberImageUpload(e, index)}
                          disabled={uploadingMemberImage === index}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#059467] text-white rounded-lg hover:bg-[#047854] transition-colors disabled:opacity-50 text-sm">
                          {uploadingMemberImage === index ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {memberUploadProgress}%
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    {member.image && (
                      <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img 
                          src={member.image} 
                          alt={member.name || 'Member preview'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <textarea
                    placeholder="Bio"
                    value={member.bio}
                    onChange={(e) => {
                      const newMembers = [...content.team.members];
                      newMembers[index].bio = e.target.value;
                      setContent({ ...content, team: { ...content.team, members: newMembers } });
                    }}
                    rows={2}
                    className="w-full mt-4 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Call to Action</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
