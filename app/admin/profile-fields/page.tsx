'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { 
  Save, Loader2, ArrowLeft, Plus, Trash2, Mountain, Heart, 
  Globe, Package, BadgeCheck, Sparkles, Truck, Headphones, 
  Edit2, AlertCircle, CheckCircle2, Settings 
} from 'lucide-react';

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
    bookingFeatures: []
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

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const handleSave = async (fieldType: keyof FieldOptions) => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      
      let body;
      if (fieldType === 'bookingFeatures') {
        body = { features: options[fieldType] };
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
      
      showSuccess(`${fieldType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated successfully!`);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addOption = (fieldType: keyof Pick<FieldOptions, 'travelStyles'|'interests'|'languages'|'gearCategories'|'gearConditions'>, value: string) => {
    if (!value.trim()) return;
    
    if (options[fieldType].includes(value.trim())) {
      showError('This option already exists');
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

  const removeOption = (fieldType: keyof Pick<FieldOptions, 'travelStyles'|'interests'|'languages'|'gearCategories'|'gearConditions'>, index: number) => {
    setOptions({
      ...options,
      [fieldType]: options[fieldType].filter((_, i) => i !== index)
    });
  };
  
  const addBookingFeature = () => {
    if (!newFeatureTitle.trim() || !newFeatureDescription.trim()) {
      showError('Title and description are required');
      return;
    }
    
    if (editingFeatureIndex !== null) {
      const updatedFeatures = [...options.bookingFeatures];
      updatedFeatures[editingFeatureIndex] = {
        icon: newFeatureIcon,
        title: newFeatureTitle.trim(),
        description: newFeatureDescription.trim()
      };
      setOptions({ ...options, bookingFeatures: updatedFeatures });
      setEditingFeatureIndex(null);
    } else {
      setOptions({
        ...options,
        bookingFeatures: [...options.bookingFeatures, {
          icon: newFeatureIcon,
          title: newFeatureTitle.trim(),
          description: newFeatureDescription.trim()
        }]
      });
    }
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d0b] flex flex-col relative overflow-hidden">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
            <div className="w-16 h-16 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10">
              <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading Options</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Fetching system configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d0b] flex flex-col relative overflow-hidden pb-16">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Header />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-start gap-5">
            <button
              onClick={() => router.push('/admin')}
              className="mt-1 p-3 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-all shadow-sm group"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  System Config
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Field Options</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium">Manage drop-down selections and system-wide lists.</p>
            </div>
          </div>
        </div>

        {/* Floating Status Notifications */}
        <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 pointer-events-none">
          {successMessage && (
            <div className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-[#132a24] border border-emerald-200 dark:border-emerald-500/30 shadow-2xl rounded-2xl p-4 text-emerald-700 dark:text-emerald-400 font-bold animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p>{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-[#132a24] border border-red-200 dark:border-red-500/30 shadow-2xl rounded-2xl p-4 text-red-700 dark:text-red-400 font-bold animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          
          {/* Travel Styles (Purple Theme) */}
          <section className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Mountain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Travel Styles</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">User profile vibe preferences</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('travelStyles')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newTravelStyle}
                  onChange={(e) => setNewTravelStyle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('travelStyles', newTravelStyle)}
                  placeholder="e.g. Backpacking, Luxury, Adventure..."
                  className="flex-1 px-4 py-3.5 bg-slate-50/50 dark:bg-[#0b1713]/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
                <button
                  onClick={() => addOption('travelStyles', newTravelStyle)}
                  className="px-6 py-3.5 bg-slate-900 dark:bg-purple-500/20 text-white dark:text-purple-400 border border-transparent dark:border-purple-500/30 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Style
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.travelStyles.map((style, index) => (
                  <div key={index} className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20 rounded-xl group transition-all hover:border-purple-300 dark:hover:border-purple-500/40">
                    <span className="text-sm font-bold text-purple-800 dark:text-purple-300">{style}</span>
                    <button onClick={() => removeOption('travelStyles', index)} className="p-1 text-purple-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors opacity-60 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interests (Pink Theme) */}
          <section className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Interests & Hobbies</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Profile matching keywords</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('interests')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('interests', newInterest)}
                  placeholder="e.g. Photography, Hiking, Food..."
                  className="flex-1 px-4 py-3.5 bg-slate-50/50 dark:bg-[#0b1713]/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/50 outline-none transition-all"
                />
                <button
                  onClick={() => addOption('interests', newInterest)}
                  className="px-6 py-3.5 bg-slate-900 dark:bg-pink-500/20 text-white dark:text-pink-400 border border-transparent dark:border-pink-500/30 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-pink-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Interest
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.interests.map((interest, index) => (
                  <div key={index} className="flex items-center gap-2 px-3.5 py-2 bg-pink-50 dark:bg-pink-500/10 border border-pink-200/60 dark:border-pink-500/20 rounded-xl group transition-all hover:border-pink-300 dark:hover:border-pink-500/40">
                    <span className="text-sm font-bold text-pink-800 dark:text-pink-300">{interest}</span>
                    <button onClick={() => removeOption('interests', index)} className="p-1 text-pink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors opacity-60 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Languages (Blue Theme) */}
          <section className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Languages Spoken</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Profile selection options</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('languages')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('languages', newLanguage)}
                  placeholder="e.g. English, Spanish, French..."
                  className="flex-1 px-4 py-3.5 bg-slate-50/50 dark:bg-[#0b1713]/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
                <button
                  onClick={() => addOption('languages', newLanguage)}
                  className="px-6 py-3.5 bg-slate-900 dark:bg-blue-500/20 text-white dark:text-blue-400 border border-transparent dark:border-blue-500/30 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Language
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.languages.map((language, index) => (
                  <div key={index} className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 rounded-xl group transition-all hover:border-blue-300 dark:hover:border-blue-500/40">
                    <span className="text-sm font-bold text-blue-800 dark:text-blue-300">{language}</span>
                    <button onClick={() => removeOption('languages', index)} className="p-1 text-blue-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors opacity-60 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gear Categories (Emerald Theme) */}
          <section className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gear Categories</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Classifications for rental items</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('gearCategories')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newGearCategory}
                  onChange={(e) => setNewGearCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('gearCategories', newGearCategory)}
                  placeholder="e.g. Tents, Cameras, Backpacks..."
                  className="flex-1 px-4 py-3.5 bg-slate-50/50 dark:bg-[#0b1713]/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                />
                <button
                  onClick={() => addOption('gearCategories', newGearCategory)}
                  className="px-6 py-3.5 bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-400 border border-transparent dark:border-emerald-500/30 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.gearCategories?.map((category, index) => (
                  <div key={index} className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl group transition-all hover:border-emerald-300 dark:hover:border-emerald-500/40">
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{category}</span>
                    <button onClick={() => removeOption('gearCategories', index)} className="p-1 text-emerald-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors opacity-60 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gear Conditions (Amber Theme) */}
          <section className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gear Conditions</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Standardized condition ratings</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('gearConditions')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newGearCondition}
                  onChange={(e) => setNewGearCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption('gearConditions', newGearCondition)}
                  placeholder="e.g. Like New, Good, Fair..."
                  className="flex-1 px-4 py-3.5 bg-slate-50/50 dark:bg-[#0b1713]/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                />
                <button
                  onClick={() => addOption('gearConditions', newGearCondition)}
                  className="px-6 py-3.5 bg-slate-900 dark:bg-amber-500/20 text-white dark:text-amber-400 border border-transparent dark:border-amber-500/30 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Condition
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.gearConditions?.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl group transition-all hover:border-amber-300 dark:hover:border-amber-500/40">
                    <span className="text-sm font-bold text-amber-800 dark:text-amber-300">{condition}</span>
                    <button onClick={() => removeOption('gearConditions', index)} className="p-1 text-amber-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors opacity-60 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Booking Features (Indigo Theme) */}
          <section className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking Features</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Perks shown on gear pages</p>
                </div>
              </div>
              <button
                onClick={() => handleSave('bookingFeatures')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form Sidebar */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-50/50 dark:bg-[#0b1713]/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Icon</label>
                    <select
                      value={newFeatureIcon}
                      onChange={(e) => setNewFeatureIcon(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                      <option value="Sparkles">✨ Sparkles</option>
                      <option value="Truck">🚚 Truck</option>
                      <option value="Headphones">🎧 Headphones</option>
                      <option value="Shield">🛡️ Shield</option>
                      <option value="Package">📦 Package</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      value={newFeatureTitle}
                      onChange={(e) => setNewFeatureTitle(e.target.value)}
                      placeholder="e.g. Free Shipping..."
                      className="w-full px-4 py-3 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Description</label>
                    <textarea
                      value={newFeatureDescription}
                      onChange={(e) => setNewFeatureDescription(e.target.value)}
                      placeholder="Add a short description..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={addBookingFeature}
                      className="flex-1 px-4 py-3 bg-slate-900 dark:bg-indigo-500/20 text-white dark:text-indigo-400 border border-transparent dark:border-indigo-500/30 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-500/30 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {editingFeatureIndex !== null ? <><Edit2 className="w-4 h-4" /> Update Feature</> : <><Plus className="w-4 h-4" /> Add Feature</>}
                    </button>
                    {editingFeatureIndex !== null && (
                      <button
                        onClick={() => {
                          setEditingFeatureIndex(null);
                          setNewFeatureIcon('Sparkles');
                          setNewFeatureTitle('');
                          setNewFeatureDescription('');
                        }}
                        className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="lg:col-span-3 space-y-3">
                {options.bookingFeatures?.map((feature, index) => {
                  const IconComponent = getIconComponent(feature.icon);
                  return (
                    <div key={index} className="flex items-start gap-4 p-5 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200/50 dark:border-indigo-500/10 rounded-2xl group transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                      <div className="p-3 bg-white dark:bg-[#132a24] shadow-sm rounded-xl flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{feature.description}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editBookingFeature(index)} className="p-2 hover:bg-indigo-200/50 dark:hover:bg-indigo-500/20 rounded-lg transition-colors text-indigo-600 dark:text-indigo-400" title="Edit feature">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeBookingFeature(index)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors text-red-500" title="Remove feature">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!options.bookingFeatures || options.bookingFeatures.length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-600">
                    <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-bold">No features added yet</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}