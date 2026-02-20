'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { userAPI, messageAPI } from '../../services/api';
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
  AlertTriangle,
  Backpack,
  Plane,
  Wallet,
  Diamond,
  MapPin,
  Calendar,
  Globe,
  Mountain,
  Heart,
  UserX
} from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('../../components/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">Loading map...</div>
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
  coordinates?: {
    lat: number;
    lng: number;
  };
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

type TabType = 'profile' | 'preferences' | 'stats' | 'billing' | 'blocked';

export default function AccountPage() {
  const router = useRouter();
  const { logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
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
    name: '',
    username: '',
    bio: '',
    gender: '',
    interests: [] as string[],
    language: 'English (US)',
    currency: 'USD ($)',
    emailNotifications: true,
    publicProfile: true,
    shareLocation: false,
    location: '',
    dateOfBirth: '',
    age: '',
    travelStyle: '',
    languages: [] as string[],
    upcomingTrips: [] as string[],
    coordinates: { lat: 0, lng: 0 },
    billingAddress: {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    matchPreferences: {
      ageRange: [18, 60] as [number, number],
      travelStyles: [] as string[],
      interests: [] as string[],
      locationRange: 500,
      genders: [] as string[]
    }
  });

  useEffect(() => {
    fetchUserProfile();
    
    // Check for tab query parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab && ['profile', 'preferences', 'stats', 'billing'].includes(tab)) {
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
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        gender: profile.gender || '',
        interests: profile.interests || [],
        language: profile.preferences?.language || 'English (US)',
        currency: profile.preferences?.currency || 'USD ($)',
        emailNotifications: profile.preferences?.emailNotifications ?? true,
        publicProfile: profile.preferences?.publicProfile ?? true,
        shareLocation: profile.preferences?.shareLocation ?? false,
        location: profile.location || '',
        dateOfBirth: profile.dateOfBirth || '',
        age: profile.age || '',
        travelStyle: profile.travelStyle || '',
        languages: profile.languages || [],
        upcomingTrips: profile.upcomingTrips || [],
        coordinates: profile.coordinates || { lat: 0, lng: 0 },
        billingAddress: profile.billingAddress || {
          fullName: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        matchPreferences: profile.matchPreferences || {
          ageRange: [18, 60],
          travelStyles: [],
          interests: [],
          locationRange: 500,
          genders: []
        }
      });
    } catch (err: any) {
      // Silently handle profile fetch errors
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const stats = await userAPI.getStats();
      setUserStats(stats);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  // Fetch stats when stats tab is active
  useEffect(() => {
    if (activeTab === 'stats') {
      fetchUserStats();
    }
  }, [activeTab]);

  // Fetch blocked users when blocked tab is active
  useEffect(() => {
    if (activeTab === 'blocked') {
      fetchBlockedUsers();
    }
  }, [activeTab]);

  const fetchBlockedUsers = async () => {
    try {
      setLoadingBlocked(true);
      const data = await messageAPI.getBlockedUsers();
      setBlockedUsers(data);
    } catch (err: any) {
      console.error('Error fetching blocked users:', err);
      setError(err.message || 'Failed to load blocked users');
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await messageAPI.unblockUser(userId);
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
      setSuccess('User unblocked successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to unblock user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nomadnotes_gear');
      formDataUpload.append('folder', 'profile_pictures');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary configuration is missing');
      }

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
      }
      
      const updatedProfile = await userAPI.updateProfile({
        profilePicture: data.secure_url
      });
      
      setUserProfile(updatedProfile);
      setSuccess('Profile picture updated successfully!');
      
      // Refresh user in auth context to update header
      await refreshUser();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setImagePreview(userProfile?.profilePicture || '');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingCover(true);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nomadnotes_gear');
      formDataUpload.append('folder', 'cover_photos');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary configuration is missing');
      }

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
      }
      
      const updatedProfile = await userAPI.updateProfile({
        coverPhoto: data.secure_url
      });
      
      setUserProfile(updatedProfile);
      setSuccess('Cover photo updated successfully!');
      
      // Refresh user in auth context to update header
      await refreshUser();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error uploading cover photo:', err);
      setError(err.message || 'Failed to upload cover photo. Please try again.');
      setCoverPreview(userProfile?.coverPhoto || '');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updatedProfile = await userAPI.updateProfile({
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        gender: formData.gender,
        interests: formData.interests,
        location: formData.location,
        coordinates: formData.coordinates,
        age: formData.age,
        travelStyle: formData.travelStyle,
        languages: formData.languages,
        billingAddress: formData.billingAddress,
        matchPreferences: formData.matchPreferences,
        preferences: {
          language: formData.language,
          currency: formData.currency,
          emailNotifications: formData.emailNotifications,
          publicProfile: formData.publicProfile,
          shareLocation: formData.shareLocation
        }
      });
      
      setUserProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      
      // Refresh user in auth context to update header
      await refreshUser();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        gender: userProfile.gender || '',
        interests: userProfile.interests || [],
        language: userProfile.preferences?.language || 'English (US)',
        currency: userProfile.preferences?.currency || 'USD ($)',
        emailNotifications: userProfile.preferences?.emailNotifications ?? true,
        publicProfile: userProfile.preferences?.publicProfile ?? true,
        shareLocation: userProfile.preferences?.shareLocation ?? false,
        location: userProfile.location || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        age: userProfile.age || '',
        travelStyle: userProfile.travelStyle || '',
        languages: userProfile.languages || [],
        upcomingTrips: userProfile.upcomingTrips || [],
        coordinates: userProfile.coordinates || { lat: 0, lng: 0 },
        billingAddress: userProfile.billingAddress || {
          fullName: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        matchPreferences: userProfile.matchPreferences || {
          ageRange: [18, 60],
          travelStyles: [],
          interests: [],
          locationRange: 500,
          genders: []
        }
      });
      setImagePreview(userProfile.profilePicture || '');
      setCoverPreview(userProfile.coverPhoto || '');
      setError('');
      setSuccess('');
    }
  };

  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Auto-calculate age when date of birth changes
    if (name === 'dateOfBirth') {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({ 
        ...prev, 
        dateOfBirth: value,
        age: calculatedAge
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
    
    if (error) setError('');
  };

  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [name]: value
      }
    }));
    if (error) setError('');
  };

  const addInterest = () => {
    const interest = prompt('Enter an interest:');
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const addTrip = () => {
    if (newTrip.trim() && !formData.upcomingTrips.includes(newTrip.trim())) {
      setFormData(prev => ({
        ...prev,
        upcomingTrips: [...prev.upcomingTrips, newTrip.trim()]
      }));
      setNewTrip('');
    }
  };

  const removeTrip = (trip: string) => {
    setFormData(prev => ({
      ...prev,
      upcomingTrips: prev.upcomingTrips.filter(t => t !== trip)
    }));
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    // Reverse geocode to get location name using Nominatim (OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      // Extract location name from response
      let locationName = '';
      if (data.address) {
        const parts = [];
        if (data.address.city) parts.push(data.address.city);
        else if (data.address.town) parts.push(data.address.town);
        else if (data.address.village) parts.push(data.address.village);
        else if (data.address.county) parts.push(data.address.county);
        
        if (data.address.country) parts.push(data.address.country);
        
        locationName = parts.join(', ') || data.display_name;
      } else {
        locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
      
      setFormData(prev => ({
        ...prev,
        location: locationName,
        coordinates: { lat, lng }
      }));
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      // Fallback to coordinates if geocoding fails
      setFormData(prev => ({
        ...prev,
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        coordinates: { lat, lng }
      }));
    }
    setShowLocationPicker(false);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'NomadNotes/1.0'
              }
            }
          );
          
          const data = await response.json();
          
          // Extract city and country from the response
          const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
          const country = data.address.country || '';
          const locationName = city && country ? `${city}, ${country}` : data.display_name;
          
          setFormData(prev => ({
            ...prev,
            location: locationName,
            coordinates: { lat: latitude, lng: longitude }
          }));
          
          setSuccess('Location detected successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          // Fallback to coordinates if geocoding fails
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            coordinates: { lat: latitude, lng: longitude }
          }));
          setSuccess('Location detected (coordinates only)');
          setTimeout(() => setSuccess(''), 3000);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location permissions in your browser.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while detecting location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex h-screen items-center justify-center bg-[#f5f8f7] dark:bg-[#0f231d]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#059467]" />
            <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">Loading Profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-[#f5f8f7] dark:bg-[#0f231d] text-slate-900 dark:text-slate-100 antialiased overflow-hidden flex min-h-screen">
        {/* Sidebar Navigation - Hidden on mobile */}
        <aside className="hidden md:flex w-[280px] bg-[#f8fcfb] dark:bg-[#132a24] border-r border-slate-100 dark:border-slate-800 flex-col h-full shrink-0 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => router.push('/dashboard')}>
              <div className="bg-[#059467]/10 p-2 rounded-xl text-[#059467]">
                <Plane className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">NomadNotes</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Travel Dashboard</p>
              </div>
            </div>
          
          <nav className="flex flex-col gap-2">
            {/* Profile Tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl font-medium group transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#059467]/10 text-[#059467]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'profile' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#059467] rounded-r-full"></div>
              )}
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>

            {/* Preferences Tab */}
            <button
              onClick={() => setActiveTab('preferences')}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl font-medium group transition-all ${
                activeTab === 'preferences'
                  ? 'bg-[#059467]/10 text-[#059467]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'preferences' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#059467] rounded-r-full"></div>
              )}
              <Settings className="w-5 h-5" />
              <span>Preferences</span>
            </button>

            {/* Stats Tab */}
            <button
              onClick={() => setActiveTab('stats')}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl font-medium group transition-all ${
                activeTab === 'stats'
                  ? 'bg-[#059467]/10 text-[#059467]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'stats' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#059467] rounded-r-full"></div>
              )}
              <BarChart3 className="w-5 h-5" />
              <span>Stats</span>
            </button>

            {/* Billing Tab */}
            <button
              onClick={() => setActiveTab('billing')}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl font-medium group transition-all ${
                activeTab === 'billing'
                  ? 'bg-[#059467]/10 text-[#059467]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'billing' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#059467] rounded-r-full"></div>
              )}
              <CreditCard className="w-5 h-5" />
              <span>Billing</span>
            </button>

            {/* Blocked Users Tab */}
            <button
              onClick={() => setActiveTab('blocked')}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl font-medium group transition-all ${
                activeTab === 'blocked'
                  ? 'bg-[#059467]/10 text-[#059467]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'blocked' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#059467] rounded-r-full"></div>
              )}
              <UserX className="w-5 h-5" />
              <span>Blocked Users</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl font-medium transition-all hover:text-slate-900 dark:hover:text-white mt-auto"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-[#059467]/5 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: imagePreview 
                  ? `url('${imagePreview}')` 
                  : 'linear-gradient(135deg, #059467 0%, #047854 100%)'
              }}
            >
              {!imagePreview && (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {formData.name.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{formData.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pro Nomad</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full bg-white dark:bg-[#0f231d]/95 relative">
        {/* Mobile Tab Navigation - Visible only on mobile */}
        <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-[#0f231d] border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'text-[#059467] border-b-2 border-[#059467]'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all ${
                activeTab === 'preferences'
                  ? 'text-[#059467] border-b-2 border-[#059467]'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Preferences</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'text-[#059467] border-b-2 border-[#059467]'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Stats</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all ${
                activeTab === 'billing'
                  ? 'text-[#059467] border-b-2 border-[#059467]'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing</span>
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all ${
                activeTab === 'blocked'
                  ? 'text-[#059467] border-b-2 border-[#059467]'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>Blocked</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-20">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1 md:mb-2">
                {activeTab === 'profile' && 'Profile Settings'}
                {activeTab === 'preferences' && 'Preferences'}
                {activeTab === 'stats' && 'Travel Statistics'}
                {activeTab === 'billing' && 'Billing & Plans'}
                {activeTab === 'blocked' && 'Blocked Users'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg">
                {activeTab === 'profile' && 'Manage your account details and view your travel statistics.'}
                {activeTab === 'preferences' && 'Customize your experience and notification settings.'}
                {activeTab === 'stats' && 'View your travel history and activity.'}
                {activeTab === 'billing' && 'Manage your subscription and payment methods.'}
                {activeTab === 'blocked' && 'Manage users you have blocked from messaging you.'}
              </p>
            </div>
          </header>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl md:rounded-2xl">
              <p className="text-xs md:text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl md:rounded-2xl">
              <p className="text-xs md:text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-12 gap-4 md:gap-8">
            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <>
                {/* Left Column: Profile */}
                <div className="col-span-12 lg:col-span-7">
                  {/* Cover Photo Section */}
                  <section className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700/50 p-4 md:p-8 shadow-sm mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3 md:mb-4">Cover Photo</h3>
                    <div className="relative group cursor-pointer">
                      <input
                        type="file"
                        id="cover-photo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        disabled={uploadingCover}
                      />
                      <label htmlFor="cover-photo-upload" className="cursor-pointer">
                        <div className="w-full h-32 md:h-48 rounded-xl md:rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                          {uploadingCover ? (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-[#059467] animate-spin" />
                            </div>
                          ) : coverPreview ? (
                            <img
                              alt="Cover Photo"
                              className="w-full h-full object-cover"
                              src={coverPreview}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#059467]/10 to-[#047854]/10 flex flex-col items-center justify-center">
                              <Camera className="w-8 md:w-12 h-8 md:h-12 text-[#059467] mb-2" />
                              <span className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium">
                                Click to upload cover photo
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-xl md:rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-center">
                            <Camera className="w-6 md:w-8 h-6 md:h-8 text-white mx-auto mb-2" />
                            <span className="text-white text-xs md:text-sm font-medium">Change Cover Photo</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </section>

                  <section className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700/50 p-4 md:p-8 shadow-sm mb-4 md:mb-6">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                      {/* Profile Picture */}
                      <div className="relative group cursor-pointer shrink-0 mx-auto md:mx-0">
                        <input
                          type="file"
                          id="profile-picture-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                        <label htmlFor="profile-picture-upload" className="cursor-pointer">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                            {uploadingImage ? (
                              <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-[#059467] animate-spin" />
                              </div>
                            ) : imagePreview ? (
                              <img
                                alt="Profile Picture"
                                className="w-full h-full object-cover"
                                src={imagePreview}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center">
                                <span className="text-white text-4xl font-bold">
                                  {formData.name.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-600 p-2 rounded-full shadow-md border border-slate-100 dark:border-slate-500">
                            <Camera className="w-4 h-4 text-[#059467]" />
                          </div>
                        </label>
                      </div>

                      {/* Profile Form */}
                      <div className="flex-1 w-full space-y-4 md:space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                            <input
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
                            <input
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="@username"
                            />
                          </div>
                        </div>

                        {/* Gender Selection */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border-none rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 cursor-pointer"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</label>
                          <textarea
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400 h-20 md:h-24 resize-none"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            maxLength={300}
                          />
                          <p className="text-xs text-slate-400 dark:text-slate-500">{formData.bio.length}/300 characters</p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                          <input
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            type="email"
                            value={userProfile?.email || ''}
                            disabled
                          />
                          <p className="text-xs text-slate-400 dark:text-slate-500">Email cannot be changed</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Travel Match Profile Section */}
                  <section className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700/50 p-4 md:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                      <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Travel Match Profile</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-4 md:mb-6">Complete your profile to find travel buddies</p>

                    <div className="space-y-4 md:space-y-6">
                      {/* Date of Birth & Age */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date of Birth
                          </label>
                          <input
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Age</label>
                          <input
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 cursor-not-allowed"
                            type="text"
                            name="age"
                            value={formData.age || 'Auto-calculated'}
                            readOnly
                            placeholder="Auto-calculated from DOB"
                          />
                          <p className="text-xs text-slate-400 dark:text-slate-500">Automatically calculated from date of birth</p>
                        </div>
                      </div>

                      {/* Location with Map Picker */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </label>
                        <div className="relative">
                          <input
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 pr-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={async (e) => {
                              handleInputChange(e);
                              // Geocode on input change
                              const destination = e.target.value;
                              if (destination && destination.length >= 3) {
                                try {
                                  const response = await fetch(
                                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
                                  );
                                  const data = await response.json();
                                  if (data && data.length > 0) {
                                    const { lat, lon } = data[0];
                                    setFormData(prev => ({
                                      ...prev,
                                      coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) }
                                    }));
                                  }
                                } catch (err) {
                                  console.error('Geocoding error:', err);
                                }
                              }
                            }}
                            placeholder="e.g. Kathmandu, Nepal"
                          />
                          {detectingLocation && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Loader2 className="w-5 h-5 text-[#059467] animate-spin" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Type a location or click on the map to select
                        </p>
                        
                        {/* Map - Always visible with Auto Detect button overlay */}
                        <div className="mt-2 relative">
                          <LocationMap
                            onLocationSelect={handleLocationSelect}
                            initialPosition={[formData.coordinates.lat || 27.7172, formData.coordinates.lng || 85.3240]}
                            selectedLocation={formData.coordinates.lat && formData.coordinates.lng ? formData.coordinates : null}
                            height="200px"
                            key={`${formData.coordinates.lat}-${formData.coordinates.lng}`}
                          />
                          {/* Auto Detect Button Overlay */}
                          <button
                            type="button"
                            onClick={detectCurrentLocation}
                            disabled={detectingLocation}
                            className="absolute top-3 right-3 z-[1000] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2.5 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            title="Auto detect my location"
                          >
                            {detectingLocation ? (
                              <Loader2 className="w-5 h-5 animate-spin text-[#059467]" />
                            ) : (
                              <MapPin className="w-5 h-5 group-hover:text-[#059467] transition-colors" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Travel Style */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Mountain className="w-4 h-4" />
                          Travel Style
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TRAVEL_STYLES.map(style => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, travelStyle: style }))}
                              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                formData.travelStyle === style
                                  ? 'bg-[#059467] text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Languages
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_LANGUAGES.map(language => (
                            <button
                              key={language}
                              type="button"
                              onClick={() => toggleLanguage(language)}
                              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                formData.languages.includes(language)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {language}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hobbies/Interests for Travel Match */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Travel Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_INTERESTS.map(interest => (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => {
                                if (formData.interests.includes(interest)) {
                                  removeInterest(interest);
                                } else {
                                  setFormData(prev => ({ ...prev, interests: [...prev.interests, interest] }));
                                }
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                formData.interests.includes(interest)
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Upcoming Trips */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Mountain className="w-4 h-4" />
                          Upcoming Trips
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newTrip}
                            onChange={(e) => setNewTrip(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrip())}
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                            placeholder="e.g., Everest Base Camp"
                          />
                          <button
                            type="button"
                            onClick={addTrip}
                            className="px-6 py-3 bg-[#059467] text-white rounded-2xl font-bold hover:bg-[#047854] transition-all flex items-center gap-2"
                          >
                            <Plus size={20} /> Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.upcomingTrips.map(trip => (
                            <div
                              key={trip}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-bold"
                            >
                              {trip}
                              <button
                                type="button"
                                onClick={() => removeTrip(trip)}
                                className="hover:bg-orange-200 dark:hover:bg-orange-800/50 rounded-full p-1 transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            )}

            {/* Preferences Tab Content */}
            {activeTab === 'preferences' && (
              <div className="col-span-12 lg:col-span-7">
                <section className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700/50 p-4 md:p-8 shadow-sm">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6">Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Language</label>
                      <div className="relative">
                        <select
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border-none rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 cursor-pointer"
                        >
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Italian</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Currency</label>
                      <div className="relative">
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border-none rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 cursor-pointer"
                        >
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                          <option>JPY (¥)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm md:text-base text-slate-900 dark:text-white">Email Notifications</p>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Receive updates about your trips and deals.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#059467]"></div>
                      </label>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Public Profile</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Allow other nomads to see your current location.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="publicProfile"
                          checked={formData.publicProfile}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#059467]"></div>
                      </label>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Share Location</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Automatically update location based on IP.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="shareLocation"
                          checked={formData.shareLocation}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#059467]"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Travel Match Filters Section */}
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-8 shadow-sm mt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-6 h-6 text-pink-500" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Travel Match Filters</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Set your preferences for discovering compatible travel buddies</p>
                  
                  <div className="space-y-6">
                    {/* Age Range */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Age Range: <span className="text-[#059467]">{formData.matchPreferences.ageRange[0]} - {formData.matchPreferences.ageRange[1]} years</span>
                      </label>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>Min Age: {formData.matchPreferences.ageRange[0]}</span>
                            <span>18 - 100</span>
                          </div>
                          <input
                            type="range"
                            min="18"
                            max="100"
                            value={formData.matchPreferences.ageRange[0]}
                            onChange={(e) => {
                              const minAge = parseInt(e.target.value);
                              const maxAge = formData.matchPreferences.ageRange[1];
                              // Ensure min is not greater than max
                              if (minAge <= maxAge) {
                                setFormData({
                                  ...formData,
                                  matchPreferences: {
                                    ...formData.matchPreferences,
                                    ageRange: [minAge, maxAge]
                                  }
                                });
                              }
                            }}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#059467]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>Max Age: {formData.matchPreferences.ageRange[1]}</span>
                            <span>18 - 100</span>
                          </div>
                          <input
                            type="range"
                            min="18"
                            max="100"
                            value={formData.matchPreferences.ageRange[1]}
                            onChange={(e) => {
                              const maxAge = parseInt(e.target.value);
                              const minAge = formData.matchPreferences.ageRange[0];
                              // Ensure max is not less than min
                              if (maxAge >= minAge) {
                                setFormData({
                                  ...formData,
                                  matchPreferences: {
                                    ...formData.matchPreferences,
                                    ageRange: [minAge, maxAge]
                                  }
                                });
                              }
                            }}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#059467]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gender Preference */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Preferred Gender {formData.matchPreferences.genders.length > 0 && (
                          <span className="text-xs text-[#059467]">({formData.matchPreferences.genders.length} selected)</span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Male', 'Female', 'Non-binary', 'Any'].map(gender => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => {
                              const genders = formData.matchPreferences.genders;
                              // If "Any" is selected, clear all others
                              if (gender === 'Any') {
                                setFormData({
                                  ...formData,
                                  matchPreferences: {
                                    ...formData.matchPreferences,
                                    genders: genders.includes('Any') ? [] : ['Any']
                                  }
                                });
                              } else {
                                // Remove "Any" if selecting specific gender
                                const newGenders = genders.filter(g => g !== 'Any');
                                setFormData({
                                  ...formData,
                                  matchPreferences: {
                                    ...formData.matchPreferences,
                                    genders: newGenders.includes(gender)
                                      ? newGenders.filter(g => g !== gender)
                                      : [...newGenders, gender]
                                  }
                                });
                              }
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                              formData.matchPreferences.genders.includes(gender)
                                ? 'bg-[#059467] text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Select "Any" to see all genders, or choose specific preferences</p>
                    </div>

                    {/* Travel Style */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Mountain className="w-4 h-4" />
                        Preferred Travel Styles {formData.matchPreferences.travelStyles.length > 0 && (
                          <span className="text-xs text-[#059467]">({formData.matchPreferences.travelStyles.length} selected)</span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TRAVEL_STYLES.map(style => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => {
                              const styles = formData.matchPreferences.travelStyles;
                              setFormData({
                                ...formData,
                                matchPreferences: {
                                  ...formData.matchPreferences,
                                  travelStyles: styles.includes(style)
                                    ? styles.filter(s => s !== style)
                                    : [...styles, style]
                                }
                              });
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                              formData.matchPreferences.travelStyles.includes(style)
                                ? 'bg-[#059467] text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Select multiple styles to find travelers with similar preferences</p>
                    </div>

                    {/* Interests */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Preferred Interests {formData.matchPreferences.interests.length > 0 && (
                          <span className="text-xs text-[#059467]">({formData.matchPreferences.interests.length} selected)</span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_INTERESTS.map(interest => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => {
                              const interests = formData.matchPreferences.interests;
                              setFormData({
                                ...formData,
                                matchPreferences: {
                                  ...formData.matchPreferences,
                                  interests: interests.includes(interest)
                                    ? interests.filter(i => i !== interest)
                                    : [...interests, interest]
                                }
                              });
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                              formData.matchPreferences.interests.includes(interest)
                                ? 'bg-pink-500 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">More interests = better matches! Select all that apply</p>
                    </div>

                    {/* Location Range */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Search Radius: <span className="text-[#059467]">
                          {formData.matchPreferences.locationRange === 0 ? 'Nearby only (< 10 km)' : 
                           formData.matchPreferences.locationRange >= 500 ? 'Worldwide (500+ km)' : 
                           `Within ${formData.matchPreferences.locationRange} km`}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={formData.matchPreferences.locationRange}
                        onChange={(e) => setFormData({
                          ...formData,
                          matchPreferences: {
                            ...formData.matchPreferences,
                            locationRange: parseInt(e.target.value)
                          }
                        })}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#059467]"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Nearby</span>
                        <span>Regional</span>
                        <span>Worldwide</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                        {formData.matchPreferences.locationRange < 50 ? 'Perfect for finding local travel buddies' :
                         formData.matchPreferences.locationRange < 200 ? 'Great for regional adventures' :
                         'Ideal for international travel connections'}
                      </p>
                    </div>

                    {/* Preview Summary */}
                    <div className="bg-gradient-to-br from-[#059467]/10 to-pink-500/10 rounded-2xl p-5 border-2 border-dashed border-[#059467]/30">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        Your Match Preferences Summary
                      </h4>
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <p>• Looking for travelers aged <strong>{formData.matchPreferences.ageRange[0]}-{formData.matchPreferences.ageRange[1]}</strong></p>
                        <p>• Gender: <strong>{formData.matchPreferences.genders.length === 0 ? 'Any' : formData.matchPreferences.genders.join(', ')}</strong></p>
                        <p>• Travel styles: <strong>{formData.matchPreferences.travelStyles.length === 0 ? 'Any' : formData.matchPreferences.travelStyles.join(', ')}</strong></p>
                        <p>• Shared interests: <strong>{formData.matchPreferences.interests.length === 0 ? 'Any' : formData.matchPreferences.interests.length + ' selected'}</strong></p>
                        <p>• Within <strong>{formData.matchPreferences.locationRange === 0 ? '10' : formData.matchPreferences.locationRange >= 500 ? '500+' : formData.matchPreferences.locationRange} km</strong> of your location</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Stats Tab Content */}
            {activeTab === 'stats' && (
              <div className="col-span-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                  {/* Left Column: Stats Cards */}
                  <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 md:gap-6">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white px-2">Travel Stats</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Stat Card 1 */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Trips</span>
                          <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{userStats.totalTrips}</span>
                          <span className="text-xs font-semibold text-[#059467] mt-1 md:mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                            {userStats.percentageIncrease > 0 ? '+' : ''}{userStats.percentageIncrease}% this year
                          </span>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#059467]/10 flex items-center justify-center text-[#059467]">
                          <Plane className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                      </div>

                      {/* Stat Card 2 */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Expenses</span>
                          <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            ${userStats.totalExpenses >= 1000 
                              ? `${(userStats.totalExpenses / 1000).toFixed(1)}k` 
                              : userStats.totalExpenses.toFixed(0)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 mt-1 md:mt-2">
                            From all trips
                          </span>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <Wallet className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                      </div>

                      {/* Stat Card 3 */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Gear Rented</span>
                          <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{userStats.gearRented}</span>
                          <span className="text-xs font-semibold text-slate-400 mt-1 md:mt-2">Active rentals</span>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Backpack className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Upgrade Card */}
                  <div className="col-span-12 lg:col-span-5">
                    {/* Promo Card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#059467] to-[#035e41] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg text-white">
                      <div className="absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full blur-xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                          <div className="bg-white/20 p-1.5 md:p-2 rounded-lg md:rounded-xl">
                            <Diamond className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Pro</span>
                        </div>
                        <h4 className="font-bold text-lg md:text-xl mb-1">Upgrade to Nomad Pro</h4>
                        <p className="text-white/80 text-xs md:text-sm mb-3 md:mb-4">Get unlimited trip tracking and offline maps.</p>
                        <button className="w-full py-2 md:py-3 bg-white text-[#059467] text-sm md:text-base font-bold rounded-lg md:rounded-xl hover:bg-slate-100 transition-colors">
                          View Plans
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab Content */}
            {activeTab === 'billing' && (
              <div className="col-span-12 lg:col-span-7">
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Billing Address</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Manage your billing information for payments and subscriptions.</p>
                  
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                        type="text"
                        name="fullName"
                        value={formData.billingAddress.fullName}
                        onChange={handleBillingAddressChange}
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Address Line 1 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address Line 1</label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                        type="text"
                        name="addressLine1"
                        value={formData.billingAddress.addressLine1}
                        onChange={handleBillingAddressChange}
                        placeholder="123 Main Street"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address Line 2 (Optional)</label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                        type="text"
                        name="addressLine2"
                        value={formData.billingAddress.addressLine2}
                        onChange={handleBillingAddressChange}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">City</label>
                        <input
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                          type="text"
                          name="city"
                          value={formData.billingAddress.city}
                          onChange={handleBillingAddressChange}
                          placeholder="New York"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">State / Province</label>
                        <input
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                          type="text"
                          name="state"
                          value={formData.billingAddress.state}
                          onChange={handleBillingAddressChange}
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    {/* Postal Code & Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Postal Code</label>
                        <input
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 placeholder:text-slate-400"
                          type="text"
                          name="postalCode"
                          value={formData.billingAddress.postalCode}
                          onChange={handleBillingAddressChange}
                          placeholder="10001"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Country</label>
                        <select
                          className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467]/50 cursor-pointer"
                          name="country"
                          value={formData.billingAddress.country}
                          onChange={handleBillingAddressChange}
                        >
                          <option value="">Select Country</option>
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Italy">Italy</option>
                          <option value="Spain">Spain</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="Switzerland">Switzerland</option>
                          <option value="Japan">Japan</option>
                          <option value="South Korea">South Korea</option>
                          <option value="Singapore">Singapore</option>
                          <option value="India">India</option>
                          <option value="Nepal">Nepal</option>
                          <option value="Thailand">Thailand</option>
                          <option value="Indonesia">Indonesia</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Brazil">Brazil</option>
                          <option value="Argentina">Argentina</option>
                        </select>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        <strong>Note:</strong> Your billing address is used for payment processing and invoicing. This information is kept secure and private.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Blocked Users Tab Content */}
            {activeTab === 'blocked' && (
              <div className="col-span-12">
                <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Blocked Users</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Users you've blocked won't be able to message you or see your activity.</p>
                  
                  {loadingBlocked ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#059467] animate-spin" />
                    </div>
                  ) : blockedUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserX className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No blocked users</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">You haven't blocked anyone yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blockedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-full bg-cover bg-center shadow-md ring-2 ring-white dark:ring-slate-800"
                              style={{ backgroundImage: `url(${user.imageUrl})` }}
                            />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {user.name}
                              </p>
                              {user.username && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  @{user.username}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            className="px-4 py-2 bg-[#059467] hover:bg-[#047854] text-white text-sm font-semibold rounded-full transition-colors"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>

          {/* Action Buttons - Moved to Bottom */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-3 w-full md:w-auto md:justify-end mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            {(activeTab === 'profile' || activeTab === 'preferences' || activeTab === 'billing') && (
              <>
                <button 
                  onClick={handleCancel}
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-3 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm md:text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-3 rounded-full bg-[#059467] text-white text-sm md:text-base font-semibold shadow-lg shadow-[#059467]/30 hover:bg-[#047854] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
    <div className="hidden md:block">
      <Footer />
    </div>
  </>
  );
}
