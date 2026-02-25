'use client';

import { useState } from 'react';
import { Plus, Trash2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary, validateImageFile } from '../lib/cloudinary';

interface HomeContent {
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
    backgroundImage: string;
    ctaPrimary: { text: string; link: string };
    ctaSecondary: { text: string; link: string };
    stats: Array<{ value: string; label: string }>;
  };
  features: {
    badge: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
      colSpan: string;
      accent: string;
    }>;
  };
  ctaBanner: {
    title: string;
    description: string;
    backgroundImage: string;
    ctaPrimary: { text: string; link: string };
    ctaSecondary: { text: string; link: string };
  };
  testimonials: {
    title: string;
    description: string;
    items: Array<{
      name: string;
      role: string;
      rating: number;
      text: string;
      avatar: string;
    }>;
  };
}

interface HomePageEditorProps {
  content: HomeContent;
  setContent: (content: HomeContent) => void;
  setError: (error: string) => void;
  setSuccessMessage: (message: string) => void;
}

const iconOptions = ['Map', 'Tent', 'Users', 'Wallet', 'CheckSquare', 'CloudOff', 'Mountain'];
const accentOptions = [
  'from-emerald-500/20 to-teal-500/20',
  'from-blue-500/20 to-cyan-500/20',
  'from-purple-500/20 to-pink-500/20',
  'from-orange-500/20 to-red-500/20'
];

export default function HomePageEditor({ content, setContent, setError, setSuccessMessage }: HomePageEditorProps) {
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [heroUploadProgress, setHeroUploadProgress] = useState(0);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);
  const [uploadingTestimonialAvatar, setUploadingTestimonialAvatar] = useState<number | null>(null);
  const [testimonialUploadProgress, setTestimonialUploadProgress] = useState(0);

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadingHeroImage(true);
      setError('');
      setHeroUploadProgress(0);

      const result = await uploadImageToCloudinary(file, (progress) => {
        setHeroUploadProgress(progress);
      });

      setContent({
        ...content,
        hero: {
          ...content.hero,
          backgroundImage: result.secure_url
        }
      });

      setSuccessMessage('Hero image uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingHeroImage(false);
      setHeroUploadProgress(0);
    }
  };

  const handleBannerImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadingBannerImage(true);
      setError('');
      setBannerUploadProgress(0);

      const result = await uploadImageToCloudinary(file, (progress) => {
        setBannerUploadProgress(progress);
      });

      setContent({
        ...content,
        ctaBanner: {
          ...content.ctaBanner,
          backgroundImage: result.secure_url
        }
      });

      setSuccessMessage('Banner image uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingBannerImage(false);
      setBannerUploadProgress(0);
    }
  };

  const handleTestimonialAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadingTestimonialAvatar(index);
      setError('');
      setTestimonialUploadProgress(0);

      const result = await uploadImageToCloudinary(file, (progress) => {
        setTestimonialUploadProgress(progress);
      });

      const newItems = [...content.testimonials.items];
      newItems[index].avatar = result.secure_url;
      setContent({
        ...content,
        testimonials: {
          ...content.testimonials,
          items: newItems
        }
      });

      setSuccessMessage('Avatar uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingTestimonialAvatar(null);
      setTestimonialUploadProgress(0);
    }
  };

  return (
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
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Main Title</label>
            <input
              type="text"
              value={content.hero.title}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
            />
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Background Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={content.hero.backgroundImage}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundImage: e.target.value } })}
                placeholder="Image URL or upload below"
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  disabled={uploadingHeroImage}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-3 bg-[#059467] text-white rounded-xl hover:bg-[#047854] transition-colors disabled:opacity-50">
                  {uploadingHeroImage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {heroUploadProgress}%
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
            {content.hero.backgroundImage && (
              <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img 
                  src={content.hero.backgroundImage} 
                  alt="Hero preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Primary CTA Text</label>
              <input
                type="text"
                value={content.hero.ctaPrimary.text}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaPrimary: { ...content.hero.ctaPrimary, text: e.target.value } } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Primary CTA Link</label>
              <input
                type="text"
                value={content.hero.ctaPrimary.link}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaPrimary: { ...content.hero.ctaPrimary, link: e.target.value } } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secondary CTA Text</label>
              <input
                type="text"
                value={content.hero.ctaSecondary.text}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaSecondary: { ...content.hero.ctaSecondary, text: e.target.value } } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secondary CTA Link</label>
              <input
                type="text"
                value={content.hero.ctaSecondary.link}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaSecondary: { ...content.hero.ctaSecondary, link: e.target.value } } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Stats</label>
              <button
                onClick={() => setContent({
                  ...content,
                  hero: {
                    ...content.hero,
                    stats: [...content.hero.stats, { value: '0', label: 'New Stat' }]
                  }
                })}
                className="flex items-center gap-2 px-3 py-1 bg-[#059467] text-white rounded-lg hover:bg-[#047854] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Stat
              </button>
            </div>
            <div className="space-y-3">
              {content.hero.stats.map((stat, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Value"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...content.hero.stats];
                      newStats[index].value = e.target.value;
                      setContent({ ...content, hero: { ...content.hero, stats: newStats } });
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...content.hero.stats];
                      newStats[index].label = e.target.value;
                      setContent({ ...content, hero: { ...content.hero, stats: newStats } });
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={() => setContent({ ...content, hero: { ...content.hero, stats: content.hero.stats.filter((_, i) => i !== index) } })}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Features</h2>
          <button
            onClick={() => setContent({
              ...content,
              features: {
                ...content.features,
                items: [...content.features.items, {
                  title: '',
                  description: '',
                  icon: 'Mountain',
                  colSpan: '',
                  accent: accentOptions[0]
                }]
              }
            })}
            className="flex items-center gap-2 px-4 py-2 bg-[#059467] text-white rounded-lg hover:bg-[#047854] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </button>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Badge</label>
            <input
              type="text"
              value={content.features.badge}
              onChange={(e) => setContent({ ...content, features: { ...content.features, badge: e.target.value } })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
            <input
              type="text"
              value={content.features.title}
              onChange={(e) => setContent({ ...content, features: { ...content.features, title: e.target.value } })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={content.features.description}
              onChange={(e) => setContent({ ...content, features: { ...content.features, description: e.target.value } })}
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {content.features.items.map((feature, index) => (
            <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Feature {index + 1}</span>
                <button
                  onClick={() => setContent({ ...content, features: { ...content.features, items: content.features.items.filter((_, i) => i !== index) } })}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Icon</label>
                  <select
                    value={feature.icon}
                    onChange={(e) => {
                      const newItems = [...content.features.items];
                      newItems[index].icon = e.target.value;
                      setContent({ ...content, features: { ...content.features, items: newItems } });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Column Span</label>
                  <input
                    type="text"
                    placeholder="e.g., md:col-span-2"
                    value={feature.colSpan}
                    onChange={(e) => {
                      const newItems = [...content.features.items];
                      newItems[index].colSpan = e.target.value;
                      setContent({ ...content, features: { ...content.features, items: newItems } });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Accent Color</label>
                  <select
                    value={feature.accent}
                    onChange={(e) => {
                      const newItems = [...content.features.items];
                      newItems[index].accent = e.target.value;
                      setContent({ ...content, features: { ...content.features, items: newItems } });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    {accentOptions.map((accent, i) => (
                      <option key={i} value={accent}>Accent {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => {
                      const newItems = [...content.features.items];
                      newItems[index].title = e.target.value;
                      setContent({ ...content, features: { ...content.features, items: newItems } });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Description</label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => {
                      const newItems = [...content.features.items];
                      newItems[index].description = e.target.value;
                      setContent({ ...content, features: { ...content.features, items: newItems } });
                    }}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner Section */}
      <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">CTA Banner</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
            <input
              type="text"
              value={content.ctaBanner.title}
              onChange={(e) => setContent({ ...content, ctaBanner: { ...content.ctaBanner, title: e.target.value } })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={content.ctaBanner.description}
              onChange={(e) => setContent({ ...content, ctaBanner: { ...content.ctaBanner, description: e.target.value } })}
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Background Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={content.ctaBanner.backgroundImage}
                onChange={(e) => setContent({ ...content, ctaBanner: { ...content.ctaBanner, backgroundImage: e.target.value } })}
                placeholder="Image URL or upload below"
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageUpload}
                  disabled={uploadingBannerImage}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-3 bg-[#059467] text-white rounded-xl hover:bg-[#047854] transition-colors disabled:opacity-50">
                  {uploadingBannerImage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {bannerUploadProgress}%
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
            {content.ctaBanner.backgroundImage && (
              <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img 
                  src={content.ctaBanner.backgroundImage} 
                  alt="Banner preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Primary CTA Text</label>
              <input
                type="text"
                value={content.ctaBanner.ctaPrimary.text}
                onChange={(e) => setContent({ ...content, ctaBanner: { ...content.ctaBanner, ctaPrimary: { ...content.ctaBanner.ctaPrimary, text: e.target.value } } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Primary CTA Link</label>
              <input
                type="text"
                value={content.ctaBanner.ctaPrimary.link}
                onChange={(e) => setContent({ ...content, ctaBanner: { ...content.ctaBanner, ctaPrimary: { ...content.ctaBanner.ctaPrimary, link: e.target.value } } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secondary CTA Text</label>
              <input
                type="text"
                value={content.ctaBanner.ctaSecondary.text}
                onChange={(e) => setContent({ ...content, ctaBanner: { ...content.ctaBanner, ctaSecondary: { ...content.ctaBanner.ctaSecondary, text: e.target.value } } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secondary CTA Link</label>
              <input
                type="text"
                value={content.ctaBanner.ctaSecondary.link}
                onChange={(e) => setContent({ ...content, ctaBanner: { ...content.ctaBanner, ctaSecondary: { ...content.ctaBanner.ctaSecondary, link: e.target.value } } })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Testimonials</h2>
          <button
            onClick={() => setContent({
              ...content,
              testimonials: {
                ...content.testimonials,
                items: [...content.testimonials.items, {
                  name: '',
                  role: '',
                  rating: 5,
                  text: '',
                  avatar: 'https://i.pravatar.cc/400'
                }]
              }
            })}
            className="flex items-center gap-2 px-4 py-2 bg-[#059467] text-white rounded-lg hover:bg-[#047854] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Title</label>
            <input
              type="text"
              value={content.testimonials.title}
              onChange={(e) => setContent({ ...content, testimonials: { ...content.testimonials, title: e.target.value } })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Description</label>
            <textarea
              value={content.testimonials.description}
              onChange={(e) => setContent({ ...content, testimonials: { ...content.testimonials, description: e.target.value } })}
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {content.testimonials.items.map((testimonial, index) => (
            <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Testimonial {index + 1}</span>
                <button
                  onClick={() => setContent({ ...content, testimonials: { ...content.testimonials, items: content.testimonials.items.filter((_, i) => i !== index) } })}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => {
                      const newItems = [...content.testimonials.items];
                      newItems[index].name = e.target.value;
                      setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Role</label>
                  <input
                    type="text"
                    value={testimonial.role}
                    onChange={(e) => {
                      const newItems = [...content.testimonials.items];
                      newItems[index].role = e.target.value;
                      setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={testimonial.rating}
                    onChange={(e) => {
                      const newItems = [...content.testimonials.items];
                      newItems[index].rating = parseFloat(e.target.value);
                      setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Avatar</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Avatar URL or upload below"
                    value={testimonial.avatar}
                    onChange={(e) => {
                      const newItems = [...content.testimonials.items];
                      newItems[index].avatar = e.target.value;
                      setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                    }}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTestimonialAvatarUpload(e, index)}
                      disabled={uploadingTestimonialAvatar === index}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#059467] text-white rounded-lg hover:bg-[#047854] transition-colors disabled:opacity-50 text-sm">
                      {uploadingTestimonialAvatar === index ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {testimonialUploadProgress}%
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
                {testimonial.avatar && (
                  <div className="mt-2 relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name || 'Avatar preview'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Testimonial Text</label>
                <textarea
                  value={testimonial.text}
                  onChange={(e) => {
                    const newItems = [...content.testimonials.items];
                    newItems[index].text = e.target.value;
                    setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                  }}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
