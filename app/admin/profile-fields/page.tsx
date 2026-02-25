'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { Save, Loader2, ArrowLeft, Plus, Trash2, Mountain, Heart, Globe, Package, BadgeCheck, Sparkles, Truck, Headphones, Edit2 } from 'lucide-react';

interface BookingFeature {
  icon: string;
  title: string;
  description: string;
}

interface MenuItem {
  label: string;
  url: string;
}

interface FieldOptions {
  travelStyles: string[];
  interests: string[];
  languages: string[];
  gearCategories: string[];
  gearConditions: string[];
  bookingFeatures: BookingFeature[];
  footerProductMenu: MenuItem[];
  footerCompanyMenu: MenuItem[];
}

export default function ProfileFieldsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<FieldOptions>({
    travelStyles: [],
    interests: [],
    languages: [],
    gearCategories: [],
    gearConditions: [],
    bookingFeatures: [],
    footerProductMenu: [],
    footerCompanyMenu: []
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // New item inputs
  const [newTravelStyle, setNewTravelStyle] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newGearCategory, setNewGearCategory] = useState('');
  const [newGearCondition, setNewGearCondition] = useState('');
  
  // Booking feature inputs
  const [newFeatureIcon, setNewFeatureIcon] = useState('Sparkles');
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureDescription, setNewFeatureDescription] = useState('');
  const [editingFeatureIndex, setEditingFeatureIndex] = useState<number | null>(null);
  
  // Footer menu inputs
  const [newProductMenuLabel, setNewProductMenuLabel] = useState('');
  const [newProductMenuUrl, setNewProductMenuUrl] = useState('');
  const [editingProductMenuIndex, setEditingProductMenuIndex] = useState<number | null>(null);
  
  const [newCompanyMenuLabel, setNewCompanyMenuLabel] = useState('');
  const [newCompanyMenuUrl, setNewCompanyMenuUrl] = useState('');
  const [editingCompanyMenuIndex, setEditingCompanyMenuIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/profile-field-options`);
      
      if (!response.ok) throw new Error('Failed to fetch options');
      
      const data = await response.json();
      setOptions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (fieldType: 'travelStyles' | 'interests' | 'languages' | 'gearCategories' | 'gearConditions' | 'bookingFeatures' | 'footerProductMenu' | 'footerCompanyMenu') => {
    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      
      let body;
      if (fieldType === 'bookingFeatures') {
        body = { features: options[fieldType] };
      } else if (fieldType === 'footerProductMenu' || fieldType === 'footerCompanyMenu') {
        body = { menuItems: options[fieldType] };
      } else {
        body = { options: options[fieldType] };
      }
      
      const response = await fetch(`${apiUrl}/api/profile-field-options/${fieldType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save options');
      }
      
      setSuccessMessage(`${fieldType} updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addOption = (fieldType: 'travelStyles' | 'interests' | 'languages' | 'gearCategories' | 'gearConditions', value: string) => {
    if (!value.trim()) return;
    
    if (options[fieldType].includes(value.trim())) {
      setError('This option already exists');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setOptions({
      ...options,
      [fieldType]: [...options[fieldType], value.trim()]
    });
    
    // Clear input
    if (fieldType === 'travelStyles') setNewTravelStyle('');
    if (fieldType === 'interests') setNewInterest('');
    if (fieldType === 'languages') setNewLanguage('');
    if (fieldType === 'gearCategories') setNewGearCategory('');
    if (fieldType === 'gearConditions') setNewGearCondition('');
  };

  const removeOption = (fieldType: 'travelStyles' | 'interests' | 'languages' | 'gearCategories' | 'gearConditions', index: number) => {
    setOptions({
      ...options,
      [fieldType]: options[fieldType].filter((_, i) => i !== index)
    });
  };
  
  const addBookingFeature = () => {
    if (!newFeatureTitle.trim() || !newFeatureDescription.trim()) {
      setError('Title and description are required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (editingFeatureIndex !== null) {
      // Update existing feature
      const updatedFeatures = [...options.bookingFeatures];
      updatedFeatures[editingFeatureIndex] = {
        icon: newFeatureIcon,
        title: newFeatureTitle.trim(),
        description: newFeatureDescription.trim()
      };
      setOptions({ ...options, bookingFeatures: updatedFeatures });
      setEditingFeatureIndex(null);
    } else {
      // Add new feature
      setOptions({
        ...options,
        bookingFeatures: [...options.bookingFeatures, {
          icon: newFeatureIcon,
          title: newFeatureTitle.trim(),
          description: newFeatureDescription.trim()
        }]
      });
    }
    
    // Clear inputs
    setNewFeatureIcon('Sparkles');
    setNewFeatureTitle('');
    setNewFeatureDescription('');
  };
  
  const editBookingFeature = (index: number) => {
    const feature = options.bookingFeatures[index];
    setNewFeatureIcon(feature.icon);
    setNewFeatureTitle(feature.title);
    setNewFeatureDescription(feature.description);
    setEditingFeatureIndex(index);
  };
  
  const removeBookingFeature = (index: number) => {
    setOptions({
      ...options,
      bookingFeatures: options.bookingFeatures.filter((_, i) => i !== index)
    });
    if (editingFeatureIndex === index) {
      setEditingFeatureIndex(null);
      setNewFeatureIcon('Sparkles');
      setNewFeatureTitle('');
      setNewFeatureDescription('');
    }
  };
  
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Sparkles, Truck, Headphones, Shield: BadgeCheck, Package, Mountain, Heart, Globe
    };
    return icons[iconName] || Sparkles;
  };
  
  // Footer menu management functions
  const addFooterMenuItem = (menuType: 'footerProductMenu' | 'footerCompanyMenu') => {
    const label = menuType === 'footerProductMenu' ? newProductMenuLabel : newCompanyMenuLabel;
    const url = menuType === 'footerProductMenu' ? newProductMenuUrl : newCompanyMenuUrl;
    const editingIndex = menuType === 'footerProductMenu' ? editingProductMenuIndex : editingCompanyMenuIndex;
    
    if (!label.trim() || !url.trim()) {
      setError('Label and URL are required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (editingIndex !== null) {
      // Update existing item
      const updatedItems = [...options[menuType]];
      updatedItems[editingIndex] = { label: label.trim(), url: url.trim() };
      setOptions({ ...options, [menuType]: updatedItems });
      
      if (menuType === 'footerProductMenu') {
        setEditingProductMenuIndex(null);
      } else {
        setEditingCompanyMenuIndex(null);
      }
    } else {
      // Add new item
      setOptions({
        ...options,
        [menuType]: [...options[menuType], { label: label.trim(), url: url.trim() }]
      });
    }
    
    // Clear inputs
    if (menuType === 'footerProductMenu') {
      setNewProductMenuLabel('');
      setNewProductMenuUrl('');
    } else {
      setNewCompanyMenuLabel('');
      setNewCompanyMenuUrl('');
    }
  };
  
  const editFooterMenuItem = (menuType: 'footerProductMenu' | 'footerCompanyMenu', index: number) => {
    const item = options[menuType][index];
    
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
    setOptions({
      ...options,
      [menuType]: options[menuType].filter((_, i) => i !== index)
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
              <h1 className="text-3xl font-black text-slate-900 dark:text-white"> Field Options</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage options for user  fields</p>
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

        <div className="space-y-8">
          {/* Travel Styles (Vibe) */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Mountain className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Travel Styles (Vibe)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Options for user travel style preferences</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('travelStyles')}
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
                    Save
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTravelStyle}
                  onChange={(e) => setNewTravelStyle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('travelStyles', newTravelStyle)}
                  placeholder="Add new travel style..."
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
                <button
                  onClick={() => addOption('travelStyles', newTravelStyle)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.travelStyles.map((style, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                  >
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{style}</span>
                    <button
                      onClick={() => removeOption('travelStyles', index)}
                      className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Interests</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Options for user interests and hobbies</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('interests')}
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
                    Save
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('interests', newInterest)}
                  placeholder="Add new interest..."
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
                <button
                  onClick={() => addOption('interests', newInterest)}
                  className="px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg"
                  >
                    <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">{interest}</span>
                    <button
                      onClick={() => removeOption('interests', index)}
                      className="p-1 hover:bg-pink-200 dark:hover:bg-pink-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Languages Spoken</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Options for languages users can speak</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('languages')}
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
                    Save
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('languages', newLanguage)}
                  placeholder="Add new language..."
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
                <button
                  onClick={() => addOption('languages', newLanguage)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{language}</span>
                    <button
                      onClick={() => removeOption('languages', index)}
                      className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gear Categories */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Package className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gear Categories</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Options for gear rental categories</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('gearCategories')}
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
                    Save
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGearCategory}
                  onChange={(e) => setNewGearCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('gearCategories', newGearCategory)}
                  placeholder="Add new gear category..."
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
                <button
                  onClick={() => addOption('gearCategories', newGearCategory)}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.gearCategories?.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
                  >
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{category}</span>
                    <button
                      onClick={() => removeOption('gearCategories', index)}
                      className="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gear Conditions */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <BadgeCheck className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gear Conditions</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Options for gear condition ratings</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('gearConditions')}
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
                    Save
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGearCondition}
                  onChange={(e) => setNewGearCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('gearConditions', newGearCondition)}
                  placeholder="Add new condition..."
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                />
                <button
                  onClick={() => addOption('gearConditions', newGearCondition)}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.gearConditions?.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                  >
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{condition}</span>
                    <button
                      onClick={() => removeOption('gearConditions', index)}
                      className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Features */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Booking Page Features</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Features displayed on gear booking pages</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('bookingFeatures')}
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
                    Save
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {/* Add/Edit Feature Form */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <select
                    value={newFeatureIcon}
                    onChange={(e) => setNewFeatureIcon(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  >
                    <option value="Sparkles">✨ Sparkles</option>
                    <option value="Truck">🚚 Truck</option>
                    <option value="Headphones">🎧 Headphones</option>
                    <option value="Shield">🛡️ Shield</option>
                    <option value="Package">📦 Package</option>
                  </select>
                  <input
                    type="text"
                    value={newFeatureTitle}
                    onChange={(e) => setNewFeatureTitle(e.target.value)}
                    placeholder="Feature title..."
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                <textarea
                  value={newFeatureDescription}
                  onChange={(e) => setNewFeatureDescription(e.target.value)}
                  placeholder="Feature description..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addBookingFeature}
                    className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {editingFeatureIndex !== null ? (
                      <>
                        <Edit2 className="w-5 h-5" />
                        Update Feature
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Add Feature
                      </>
                    )}
                  </button>
                  {editingFeatureIndex !== null && (
                    <button
                      onClick={() => {
                        setEditingFeatureIndex(null);
                        setNewFeatureIcon('Sparkles');
                        setNewFeatureTitle('');
                        setNewFeatureDescription('');
                      }}
                      className="px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {options.bookingFeatures?.map((feature, index) => {
                  const IconComponent = getIconComponent(feature.icon);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl"
                    >
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{feature.title}</h4>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">{feature.description}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => editBookingFeature(index)}
                          className="p-2 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded transition-colors"
                          title="Edit feature"
                        >
                          <Edit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </button>
                        <button
                          onClick={() => removeBookingFeature(index)}
                          className="p-2 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded transition-colors"
                          title="Remove feature"
                        >
                          <Trash2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Product Menu */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Package className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Footer Product Menu</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Menu items in Product column</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('footerProductMenu')}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50"
              >
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save</>}
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProductMenuLabel}
                    onChange={(e) => setNewProductMenuLabel(e.target.value)}
                    placeholder="Menu label..."
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                  <input
                    type="text"
                    value={newProductMenuUrl}
                    onChange={(e) => setNewProductMenuUrl(e.target.value)}
                    placeholder="URL (e.g., /match)..."
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addFooterMenuItem('footerProductMenu')}
                    className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {editingProductMenuIndex !== null ? <><Edit2 className="w-5 h-5" />Update</> : <><Plus className="w-5 h-5" />Add</>}
                  </button>
                  {editingProductMenuIndex !== null && (
                    <button
                      onClick={() => {
                        setEditingProductMenuIndex(null);
                        setNewProductMenuLabel('');
                        setNewProductMenuUrl('');
                      }}
                      className="px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {options.footerProductMenu?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                    <div>
                      <span className="text-sm font-bold text-cyan-900 dark:text-cyan-100">{item.label}</span>
                      <span className="text-xs text-cyan-700 dark:text-cyan-300 ml-2">→ {item.url}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editFooterMenuItem('footerProductMenu', index)} className="p-2 hover:bg-cyan-200 dark:hover:bg-cyan-800 rounded transition-colors">
                        <Edit2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      </button>
                      <button onClick={() => removeFooterMenuItem('footerProductMenu', index)} className="p-2 hover:bg-cyan-200 dark:hover:bg-cyan-800 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Company Menu */}
          <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <Globe className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Footer Company Menu</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Menu items in Company column</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('footerCompanyMenu')}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-semibold hover:bg-[#047854] transition-colors disabled:opacity-50"
              >
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save</>}
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCompanyMenuLabel}
                    onChange={(e) => setNewCompanyMenuLabel(e.target.value)}
                    placeholder="Menu label..."
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                  <input
                    type="text"
                    value={newCompanyMenuUrl}
                    onChange={(e) => setNewCompanyMenuUrl(e.target.value)}
                    placeholder="URL (e.g., /about)..."
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/30 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addFooterMenuItem('footerCompanyMenu')}
                    className="flex-1 px-6 py-3 bg-violet-500 text-white rounded-xl font-semibold hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {editingCompanyMenuIndex !== null ? <><Edit2 className="w-5 h-5" />Update</> : <><Plus className="w-5 h-5" />Add</>}
                  </button>
                  {editingCompanyMenuIndex !== null && (
                    <button
                      onClick={() => {
                        setEditingCompanyMenuIndex(null);
                        setNewCompanyMenuLabel('');
                        setNewCompanyMenuUrl('');
                      }}
                      className="px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {options.footerCompanyMenu?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                    <div>
                      <span className="text-sm font-bold text-violet-900 dark:text-violet-100">{item.label}</span>
                      <span className="text-xs text-violet-700 dark:text-violet-300 ml-2">→ {item.url}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editFooterMenuItem('footerCompanyMenu', index)} className="p-2 hover:bg-violet-200 dark:hover:bg-violet-800 rounded transition-colors">
                        <Edit2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </button>
                      <button onClick={() => removeFooterMenuItem('footerCompanyMenu', index)} className="p-2 hover:bg-violet-200 dark:hover:bg-violet-800 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
