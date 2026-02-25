'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { userAPI, messageAPI } from '../../services/api';
import { formatNPRShort } from '../../lib/currency';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  User,
  Settings,
  BarChart3,
  CreditCard,
  LogOut,
  Camera,
  X,
  Plus,
  Loader2,
  TrendingUp,
  Backpack,
  Plane,
  Wallet,
  Diamond,
  MapPin,
  Calendar,
  Globe,
  Mountain,
  Heart,
  UserX,
  Users,
  AlertTriangle
} from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('../../components/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">Loading map...</div>
});

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  age?: string;
  gender?: string;
  languages?: string[];
  interests?: string[];
  travelStyle?: string;
  upcomingTrips?: string[];
  preferences?: {
    language?: string;
    currency?: string;
    emailNotifications?: boolean;
    publicProfile?: boolean;
    shareLocation?: boolean;
  };
  dateOfBirth?: string;
  coordinates?: { lat: number; lng: number; };
  billingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  matchPreferences?: {
    ageRange: [number, number];
    travelStyles: string[];
    interests: string[];
    locationRange: number;
    genders: string[];
  };
}

const TRAVEL_STYLES = ['Adventure', 'Relaxed', 'Cultural', 'Extreme', 'Slow Travel', 'Luxury', 'Budget'];
const COMMON_INTERESTS = ['Trekking', 'Photography', 'Culture', 'Food', 'Hiking', 'Yoga', 'Meditation', 'Local Cuisine', 'Mountaineering', 'Rock Climbing', 'Camping', 'Coworking', 'Cafes', 'History', 'Language Exchange'];
const COMMON_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian', 'Nepali'];

type TabType = 'profile' | 'settings' | 'stats' | 'billing' | 'blocked';

export default function AccountPage() {
  const router = useRouter();
  const { logout, refreshUser } = useAuth();
  const { showConfirm, showToast } = useToast();
  
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialTab = (searchParams.get('tab') as TabType) || 'profile';
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState({
    totalTrips: 0,
    totalExpenses: 0,
    gearRented: 0,
    gearOwned: 0,
    totalConnections: 0,
    tripsThisYear: 0,
    percentageIncrease: 0
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [newTrip, setNewTrip] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', username: '', bio: '', gender: '', interests: [] as string[],
    language: 'English (US)', currency: 'USD ($)', emailNotifications: true,
    publicProfile: true, shareLocation: false, location: '', dateOfBirth: '',
    age: '', travelStyle: '', languages: [] as string[], upcomingTrips: [] as string[],
    coordinates: { lat: 0, lng: 0 },
    billingAddress: { fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' },
    matchPreferences: { ageRange: [18, 60] as [number, number], travelStyles: [] as string[], interests: [] as string[], locationRange: 500, genders: [] as string[] }
  });

  useEffect(() => {
    fetchUserProfile();
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'preferences' || tab === 'filters') {
        router.push('/match');
      } else if (tab && ['profile', 'settings', 'stats', 'billing', 'blocked'].includes(tab)) {
        setActiveTab(tab as TabType);
      }
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await userAPI.getProfile();
      setUserProfile(profile);
      setImagePreview(profile.profilePicture || '');
      setCoverPreview(profile.coverPhoto || '');
      
      setFormData({
        name: profile.name || '', username: profile.username || '', bio: profile.bio || '', gender: profile.gender || '',
        interests: profile.interests || [], language: profile.preferences?.language || 'English (US)', currency: profile.preferences?.currency || 'USD ($)',
        emailNotifications: profile.preferences?.emailNotifications ?? true, publicProfile: profile.preferences?.publicProfile ?? true,
        shareLocation: profile.preferences?.shareLocation ?? false, location: profile.location || '', dateOfBirth: profile.dateOfBirth || '',
        age: profile.age || '', travelStyle: profile.travelStyle || '', languages: profile.languages || [], upcomingTrips: profile.upcomingTrips || [],
        coordinates: profile.coordinates || { lat: 0, lng: 0 },
        billingAddress: profile.billingAddress || { fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' },
        matchPreferences: profile.matchPreferences || { ageRange: [18, 60], travelStyles: [], interests: [], locationRange: 500, genders: [] }
      });
    } catch (err: any) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') fetchUserStats();
    if (activeTab === 'blocked') fetchBlockedUsers();
  }, [activeTab]);

  const fetchUserStats = async () => {
    try {
      const stats = await userAPI.getStats();
      setUserStats(stats);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      setLoadingBlocked(true);
      const data = await messageAPI.getBlockedUsers();
      setBlockedUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load blocked users');
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await messageAPI.unblockUser(userId);
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
      showToast('User unblocked successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to unblock user', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return setError('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return setError('Image size must be less than 5MB');

    try {
      type === 'profile' ? setUploadingImage(true) : setUploadingCover(true);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => type === 'profile' ? setImagePreview(reader.result as string) : setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nomadnotes_gear');
      formDataUpload.append('folder', type === 'profile' ? 'profile_pictures' : 'cover_photos');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST', body: formDataUpload,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Failed to upload image');
      
      const payload = type === 'profile' ? { profilePicture: data.secure_url } : { coverPhoto: data.secure_url };
      const updatedProfile = await userAPI.updateProfile(payload);
      
      setUserProfile(updatedProfile);
      showToast(`${type === 'profile' ? 'Profile' : 'Cover'} photo updated!`, 'success');
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      type === 'profile' ? setImagePreview(userProfile?.profilePicture || '') : setCoverPreview(userProfile?.coverPhoto || '');
    } finally {
      type === 'profile' ? setUploadingImage(false) : setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(''); setSuccess('');

      const updatedProfile = await userAPI.updateProfile({
        name: formData.name, username: formData.username, bio: formData.bio, gender: formData.gender,
        interests: formData.interests, location: formData.location, coordinates: formData.coordinates,
        age: formData.age, travelStyle: formData.travelStyle, languages: formData.languages,
        billingAddress: formData.billingAddress, matchPreferences: formData.matchPreferences,
        preferences: {
          language: formData.language, currency: formData.currency,
          emailNotifications: formData.emailNotifications, publicProfile: formData.publicProfile,
          shareLocation: formData.shareLocation
        }
      });
      
      setUserProfile(updatedProfile);
      showToast('Profile updated successfully!', 'success');
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) fetchUserProfile(); // Refetch to reset
    setError(''); setSuccess('');
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age.toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'dateOfBirth') {
      setFormData(prev => ({ ...prev, dateOfBirth: value, age: calculateAge(value) }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, [name]: value } }));
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev, languages: prev.languages.includes(language) ? prev.languages.filter(l => l !== language) : [...prev.languages, language]
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev, interests: prev.interests.includes(interest) ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
    }));
  };

  const addTrip = () => {
    if (newTrip.trim() && !formData.upcomingTrips.includes(newTrip.trim())) {
      setFormData(prev => ({ ...prev, upcomingTrips: [...prev.upcomingTrips, newTrip.trim()] }));
      setNewTrip('');
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
      const data = await response.json();
      
      let locationName = '';
      if (data.address) {
        const parts = [];
        if (data.address.city) parts.push(data.address.city);
        else if (data.address.town) parts.push(data.address.town);
        else if (data.address.village) parts.push(data.address.village);
        
        if (data.address.country) parts.push(data.address.country);
        locationName = parts.join(', ') || data.display_name;
      } else {
        locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
      setFormData(prev => ({ ...prev, location: locationName, coordinates: { lat, lng } }));
    } catch (err) {
      setFormData(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, coordinates: { lat, lng } }));
    }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported');
    setDetectingLocation(true); setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || '';
          const country = data.address.country || '';
          setFormData(prev => ({ ...prev, location: city && country ? `${city}, ${country}` : data.display_name, coordinates: { lat: latitude, lng: longitude } }));
          showToast('Location detected successfully!', 'success');
        } catch (err) {
          setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, coordinates: { lat: latitude, lng: longitude } }));
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        setError('Location access denied or unavailable.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Logout',
      message: 'Are you sure you want to logout? You will need to sign in again to access your account.',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: () => {
        logout();
        showToast('Successfully logged out', 'success');
        router.push('/login');
      }
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex h-[80vh] items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-slate-900 dark:text-[#059467]" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const navItems = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
    { id: 'blocked', icon: UserX, label: 'Blocked' },
  ] as const;

  return (
    <>
      <Header />
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col md:flex-row antialiased">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[280px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700/50 flex-col shrink-0 sticky top-0 h-screen z-10">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-emerald-100 dark:bg-emerald-500/10 p-2.5 rounded-xl text-[#059467] dark:text-emerald-400">
                <Plane className="w-6 h-6 -rotate-12" />
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white text-lg font-black tracking-tight leading-tight">Account</h1>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">Manage Details</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1.5">
              {navItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-[#059467] text-white shadow-md shadow-[#059467]/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-700/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl font-semibold transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden sticky top-[60px] sm:top-[72px] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
          <div className="flex overflow-x-auto snap-x hide-scrollbar px-2 py-2">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex-1 min-w-[100px] snap-center flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === id
                    ? 'text-[#059467] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-12 relative w-full max-w-5xl mx-auto">
          <div className="p-4 md:p-8 lg:p-10">
            
            {/* Header Text */}
            <header className="mb-6 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {navItems.find(item => item.id === activeTab)?.label} Settings
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
                {activeTab === 'profile' && 'Update your personal details, photos, and travel interests.'}
                {activeTab === 'settings' && 'Manage your app preferences and notification settings.'}
                {activeTab === 'stats' && 'Track your footprint, connections, and platform activity.'}
                {activeTab === 'billing' && 'Keep your payment info and subscription up to date.'}
                {activeTab === 'blocked' && 'Manage users you have restricted from contacting you.'}
              </p>
            </header>

            {/* Error Message Display */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">{error}</p>
              </div>
            )}

            {/* Content Switcher */}
            <div className="space-y-6 md:space-y-8">
              
              {/* ================= PROFILE TAB ================= */}
              {activeTab === 'profile' && (
                <>
                  {/* Cover & Avatar Card */}
                  <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
                    <div className="relative group cursor-pointer rounded-[20px] overflow-hidden">
                      <input type="file" id="cover-photo-upload" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} disabled={uploadingCover} />
                      <label htmlFor="cover-photo-upload" className="cursor-pointer block">
                        <div className="w-full h-40 md:h-56 bg-slate-100 dark:bg-slate-900">
                          {uploadingCover ? (
                            <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-slate-900 dark:text-[#059467] animate-spin" /></div>
                          ) : coverPreview ? (
                            <img alt="Cover" className="w-full h-full object-cover" src={coverPreview} />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                              <Camera className="w-10 h-10 text-[#059467]/50" />
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2"><Camera className="w-4 h-4" /> Change Cover</span>
                        </div>
                      </label>
                    </div>

                    <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-12 md:-mt-16 relative z-10">
                      <div className="relative group cursor-pointer shrink-0">
                        <input type="file" id="profile-picture-upload" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} disabled={uploadingImage} />
                        <label htmlFor="profile-picture-upload" className="cursor-pointer block">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xl">
                            {uploadingImage ? (
                              <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-slate-900 dark:text-[#059467] animate-spin" /></div>
                            ) : imagePreview ? (
                              <img alt="Profile" className="w-full h-full object-cover" src={imagePreview} />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center">
                                <span className="text-white text-4xl font-black">{formData.name.charAt(0).toUpperCase() || '?'}</span>
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-600 group-hover:scale-110 transition-transform">
                            <Camera className="w-4 h-4 text-[#059467] dark:text-emerald-400" />
                          </div>
                        </label>
                      </div>

                      <div className="flex-1 w-full text-center sm:text-left pt-2">
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white truncate">{formData.name || 'Your Name'}</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{formData.username ? `@${formData.username}` : 'Add a username'}</p>
                      </div>
                    </div>
                  </section>

                  {/* Basic Info Form */}
                  <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#059467]" /> Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                        <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 focus:border-[#059467] transition-all" type="text" name="name" value={formData.name} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
                        <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 focus:border-[#059467] transition-all" type="text" name="username" value={formData.username} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                        <input className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70" type="email" value={userProfile?.email || ''} disabled />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 focus:border-[#059467] transition-all appearance-none cursor-pointer">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                          <span>Bio</span>
                          <span className="text-xs text-slate-400 font-normal">{formData.bio.length}/300</span>
                        </label>
                        <textarea className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 focus:border-[#059467] transition-all min-h-[100px] resize-y" name="bio" value={formData.bio} onChange={handleInputChange} maxLength={300} placeholder="I love exploring hidden trails and local cafes..." />
                      </div>
                    </div>
                  </section>

                  {/* Travel Match Profile Section */}
                  <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-500" /> Travel Match Profile
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Birthday</label>
                          <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Home Base</label>
                          <div className="relative">
                            <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all" type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="E.g., Kathmandu, Nepal" />
                            <button type="button" onClick={detectCurrentLocation} disabled={detectingLocation} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Detect Location">
                              {detectingLocation ? <Loader2 className="w-4 h-4 text-slate-900 dark:text-[#059467] animate-spin" /> : <MapPin className="w-4 h-4 text-slate-400 hover:text-[#059467]" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Map Picker */}
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
                        <LocationMap onLocationSelect={handleLocationSelect} initialPosition={[formData.coordinates.lat || 27.7172, formData.coordinates.lng || 85.3240]} selectedLocation={formData.coordinates.lat ? formData.coordinates : null} height="200px" key={`${formData.coordinates.lat}-${formData.coordinates.lng}`} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Mountain className="w-4 h-4 text-slate-400" /> Vibe</label>
                        <div className="flex flex-wrap gap-2">
                          {TRAVEL_STYLES.map(style => (
                            <button key={style} type="button" onClick={() => setFormData(prev => ({ ...prev, travelStyle: style }))} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${formData.travelStyle === style ? 'bg-[#059467] text-white border-[#059467]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> Languages Spoken</label>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_LANGUAGES.map(lang => (
                            <button key={lang} type="button" onClick={() => toggleLanguage(lang)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${formData.languages.includes(lang) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Heart className="w-4 h-4 text-slate-400" /> Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_INTERESTS.map(interest => (
                            <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${formData.interests.includes(interest) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* ================= SETTINGS TAB ================= */}
              {activeTab === 'settings' && (
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 md:p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> App Language</label>
                      <select name="language" value={formData.language} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 appearance-none cursor-pointer">
                        <option>English (US)</option><option>Spanish</option><option>French</option><option>German</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Wallet className="w-4 h-4 text-slate-400" /> Currency</label>
                      <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 appearance-none cursor-pointer">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                        <option>NPR (Rs)</option>
                        <option>INR (₹)</option>
                        <option>AUD ($)</option>
                        <option>CAD ($)</option>
                        <option>JPY (¥)</option>
                      </select>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        This currency will be used throughout the app for trips, expenses, and gear rentals.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3">Privacy & Notifications</h4>
                    
                    {[
                      { name: 'emailNotifications', title: 'App Notifications', desc: 'Receive push notifications about trips, bookings, and matches.' },
                      { name: 'publicProfile', title: 'Public Profile', desc: 'Allow other nomads to view your profile and reviews in match discover.' },
                      { name: 'shareLocation', title: 'Location Sharing', desc: 'Show your location on friends map and in match profiles.' }
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input type="checkbox" name={item.name} checked={formData[item.name as keyof typeof formData] as boolean} onChange={handleInputChange} className="sr-only peer" />
                          <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059467]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ================= STATS TAB ================= */}
              {activeTab === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
                    <div>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Trips</span>
                      <p className="text-4xl font-black text-slate-900 dark:text-white my-1">{userStats.totalTrips}</p>
                      <span className="text-xs font-bold text-[#059467] flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" /> +{userStats.percentageIncrease}% this year
                      </span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center text-[#059467]">
                      <Plane className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
                    <div>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Expenses</span>
                      <p className="text-4xl font-black text-slate-900 dark:text-white my-1">{formatNPRShort(userStats.totalExpenses)}</p>
                      <span className="text-xs font-bold text-slate-400">From all completed trips</span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center text-amber-500">
                      <Wallet className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
                    <div>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Gear Rented</span>
                      <p className="text-4xl font-black text-slate-900 dark:text-white my-1">{userStats.gearRented}</p>
                      <span className="text-xs font-bold text-slate-400">Active & Past rentals</span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Backpack className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
                    <div>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Connections</span>
                      <p className="text-4xl font-black text-slate-900 dark:text-white my-1">{userStats.totalConnections}</p>
                      <span className="text-xs font-bold text-slate-400">Mutual travel matches</span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center text-blue-500">
                      <Users className="w-8 h-8" />
                    </div>
                  </div>

                  {/* PRO Upgrade Card */}
                  <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#059467] to-[#035e41] rounded-3xl p-8 shadow-xl text-white mt-4">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-white/20 p-2 rounded-xl"><Diamond className="w-6 h-6" /></div>
                          <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Pro Member</span>
                        </div>
                        <h4 className="font-black text-2xl mb-1">Take Your Travels Further</h4>
                        <p className="text-white/80 font-medium max-w-md">Unlock unlimited trip planning, offline maps, and premium travel matches.</p>
                      </div>
                      <button className="whitespace-nowrap px-8 py-3.5 bg-white text-[#059467] font-bold rounded-2xl hover:bg-emerald-50 hover:scale-105 transition-all shadow-lg">
                        View Pro Plans
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= BILLING TAB ================= */}
              {activeTab === 'billing' && (
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 md:p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all" type="text" name="fullName" value={formData.billingAddress.fullName} onChange={handleBillingAddressChange} placeholder="Name on card" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address Line 1</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all" type="text" name="addressLine1" value={formData.billingAddress.addressLine1} onChange={handleBillingAddressChange} placeholder="123 Main St" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address Line 2 (Optional)</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all" type="text" name="addressLine2" value={formData.billingAddress.addressLine2} onChange={handleBillingAddressChange} placeholder="Apt, Suite, etc." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">City</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all" type="text" name="city" value={formData.billingAddress.city} onChange={handleBillingAddressChange} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">State / Province</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all" type="text" name="state" value={formData.billingAddress.state} onChange={handleBillingAddressChange} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Postal Code</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all" type="text" name="postalCode" value={formData.billingAddress.postalCode} onChange={handleBillingAddressChange} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Country</label>
                      <select name="country" value={formData.billingAddress.country} onChange={handleBillingAddressChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 transition-all appearance-none cursor-pointer">
                        <option value="">Select Country</option>
                        <option value="United States">United States</option><option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option><option value="Australia">Australia</option>
                        <option value="Nepal">Nepal</option><option value="India">India</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl flex gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Your billing address is used securely for payment processing and invoicing purposes only.</p>
                  </div>
                </section>
              )}

              {/* ================= BLOCKED TAB ================= */}
              {activeTab === 'blocked' && (
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 md:p-8 shadow-sm min-h-[400px]">
                  {loadingBlocked ? (
                    <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-slate-900 dark:text-[#059467] animate-spin" /></div>
                  ) : blockedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4"><UserX className="w-8 h-8 text-slate-400" /></div>
                      <p className="text-slate-900 dark:text-white font-bold text-lg">No blocked users</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">When you block someone, they will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blockedUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-cover bg-center shadow-sm" style={{ backgroundImage: `url(${user.imageUrl || ''})`, backgroundColor: '#e2e8f0' }} />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                              {user.username && <p className="text-xs font-medium text-slate-500">@{user.username}</p>}
                            </div>
                          </div>
                          <button onClick={() => handleUnblockUser(user.id)} className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#059467] dark:hover:border-emerald-500 hover:text-[#059467] dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-all shadow-sm">
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </main>

        {/* Floating Action Bar (Sticky to bottom) */}
        {['profile', 'settings', 'billing'].includes(activeTab) && (
          <div className="fixed bottom-0 left-0 right-0 md:left-[280px] z-50 p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <div className="max-w-5xl mx-auto flex gap-3 md:justify-end">
              <button 
                onClick={handleCancel} 
                className="flex-1 md:flex-none px-6 py-3 md:py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="flex-1 md:flex-none px-8 py-3 md:py-3.5 rounded-2xl bg-[#059467] text-white font-bold shadow-lg shadow-[#059467]/30 hover:bg-[#047854] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}