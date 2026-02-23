'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { authAPI, userAPI } from '../../services/api';
import { uploadPublicImageToCloudinary } from '../../lib/cloudinary';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  User, Mail, RotateCcw, Calendar, MapPin, Eye, EyeOff,
  ArrowRight, ArrowLeft, Check, AlertCircle, Upload, X, Compass, Loader2
} from 'lucide-react';

// Types
interface FormData {
  // Step 1
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  location: string;
  gender: string;
  termsAccepted: boolean;
  // Step 2
  interests: string[];
  languages: string[];
  travelStyle: string;
  // Step 3
  bio: string;
  profilePicture: string;
  coverPhoto: string;
}

const TRAVEL_INTERESTS = [
  'Trekking', 'Photography', 'Culture', 'Food', 'Hiking',
  'Yoga', 'Meditation', 'Local Cuisine', 'Mountaineering',
  'Rock Climbing', 'Camping'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian',
  'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Hindi',
  'Arabic', 'Russian', 'Nepali'
];

const TRAVEL_STYLES = [
  'Adventure', 'Relaxed', 'Cultural', 'Extreme',
  'Slow Travel', 'Luxury', 'Budget'
];

export default function RegisterPage() {
  const router = useRouter();
  const { login, user, status } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    location: '',
    gender: '',
    termsAccepted: false,
    interests: [],
    languages: [],
    travelStyle: '',
    bio: '',
    profilePicture: '',
    coverPhoto: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.push('/dashboard');
    }
  }, [status, user, router]);

  // Password strength calculation
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Medium', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  // Validation functions
  const validateStep1 = (): boolean => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Please enter your date of birth');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Please enter your location');
      return false;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return false;
    }
    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Generate username when name changes
    if (name === 'name' && value.trim()) {
      const username = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15);
      const randomNum = Math.floor(Math.random() * 999);
      setGeneratedUsername(username ? `${username}${randomNum}` : '');
    }
    
    if (error) setError('');
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
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

  const selectTravelStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      travelStyle: prev.travelStyle === style ? '' : style
    }));
  };

  // Image upload handlers
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setUploadingProfile(true);
    setError('');

    try {
      const result = await uploadPublicImageToCloudinary(file);
      setFormData(prev => ({ ...prev, profilePicture: result.secure_url }));
      setProfilePreview(result.secure_url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setUploadingCover(true);
    setError('');

    try {
      const result = await uploadPublicImageToCloudinary(file);
      setFormData(prev => ({ ...prev, coverPhoto: result.secure_url }));
      setCoverPreview(result.secure_url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  const removeProfilePicture = () => {
    setFormData(prev => ({ ...prev, profilePicture: '' }));
    setProfilePreview('');
  };

  const removeCoverPhoto = () => {
    setFormData(prev => ({ ...prev, coverPhoto: '' }));
    setCoverPreview('');
  };

  // Auto-detect location using browser geolocation API
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get location name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch location');
          }

          const data = await response.json();
          
          // Extract city and country
          const city = data.address.city || data.address.town || data.address.village || data.address.state;
          const country = data.address.country;
          
          const locationString = city && country ? `${city}, ${country}` : data.display_name;
          
          setFormData(prev => ({ ...prev, location: locationString }));
        } catch (err: any) {
          setError('Failed to detect location. Please enter manually.');
          console.error('Location detection error:', err);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An error occurred while detecting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
    setError('');
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSkip = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleSubmit();
    }
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Register user with basic info
      const registerResponse = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Store token
      localStorage.setItem('token', registerResponse.token);

      // Update profile with additional info
      const profileData: any = {
        dateOfBirth: formData.dateOfBirth,
        location: formData.location,
        gender: formData.gender
      };

      // Add optional fields if provided
      if (formData.interests.length > 0) profileData.interests = formData.interests;
      if (formData.languages.length > 0) profileData.languages = formData.languages;
      if (formData.travelStyle) profileData.travelStyle = formData.travelStyle;
      if (formData.bio) profileData.bio = formData.bio;
      if (formData.profilePicture) profileData.profilePicture = formData.profilePicture;
      if (formData.coverPhoto) profileData.coverPhoto = formData.coverPhoto;

      await userAPI.updateProfile(profileData);

      // Get updated user data
      const userData = await userAPI.getProfile();

      // Update auth context
      login(registerResponse.token, userData);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
      <Header />

      <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden py-12">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
        
        {/* Topographic Pattern */}
        <div 
          className="absolute inset-0 opacity-50 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        ></div>

        {/* Registration Card */}
        <div className="relative w-full max-w-[600px] bg-white dark:bg-[#152e26] rounded-2xl shadow-2xl p-8 md:p-12 z-10 mx-4 border border-white/50 dark:border-white/5">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="size-12 bg-[#0f231d]/5 dark:bg-white/10 rounded-full flex items-center justify-center mb-4 text-[#0f231d] dark:text-white">
              <Compass className="w-7 h-7" />
            </div>
            <h1 className="text-[#0f231d] dark:text-white text-2xl font-bold leading-tight tracking-tight mb-2">
              Join NomadNotes
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Create your account and start your adventure
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center size-10 rounded-full font-bold text-sm transition-all duration-300 ${
                  step < currentStep
                    ? 'bg-[#059467] text-white'
                    : step === currentStep
                    ? 'bg-[#059467] text-white ring-4 ring-[#059467]/20'
                    : 'bg-slate-200 dark:bg-[#2a453b] text-slate-500 dark:text-slate-400'
                }`}>
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`h-1 w-12 rounded-full transition-all duration-300 ${
                    step < currentStep ? 'bg-[#059467]' : 'bg-slate-200 dark:bg-[#2a453b]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px]">
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  {generatedUsername && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-1 flex items-center gap-1">
                      <span className="text-[#059467]">✓</span>
                      Your username will be: <span className="font-semibold text-[#059467]">@{generatedUsername}</span>
                      <span className="text-slate-400">(editable later)</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200"
                      id="email"
                      name="email"
                      placeholder="nomad@example.com"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-12 px-4 pr-12 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200"
                      id="password"
                      name="password"
                      placeholder="•••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-slate-400 hover:text-[#059467] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              level < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-slate-200 dark:bg-[#2a453b]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        passwordStrength === 4 ? 'text-green-600 dark:text-green-400' :
                        passwordStrength === 3 ? 'text-yellow-600 dark:text-yellow-400' :
                        passwordStrength === 2 ? 'text-orange-600 dark:text-orange-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too weak'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-12 px-4 pr-12 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="•••••••••"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-slate-400 hover:text-[#059467] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" htmlFor="dateOfBirth">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:opacity-80"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" htmlFor="location">
                    Location
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        className="w-full h-12 px-4 pr-12 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200"
                        id="location"
                        name="location"
                        placeholder="City, Country"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        disabled={detectingLocation}
                      />
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="h-12 px-4 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-medium text-sm shadow-md shadow-[#059467]/20 hover:shadow-[#059467]/30 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      title="Auto-detect location"
                    >
                      {detectingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">Detecting...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-4 h-4" />
                          <span className="hidden sm:inline">Detect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" htmlFor="gender">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200 appearance-none cursor-pointer"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      className="appearance-none w-5 h-5 mt-0.5 rounded-md border-2 border-slate-200 dark:border-[#2a453b] checked:bg-[#059467] checked:border-[#059467] focus:ring-2 focus:ring-[#059467]/20 transition-all duration-200 cursor-pointer relative flex-shrink-0
                      checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-white checked:after:text-sm checked:after:font-bold"
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      required
                    />
                    <span className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      I agree to the{' '}
                      <a href="/terms" className="text-[#059467] hover:underline font-medium">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-[#059467] hover:underline font-medium">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  className="w-full h-12 mt-6 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#059467]/20 hover:shadow-[#059467]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* STEP 2: Travel Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                  You can complete this later in your account settings
                </p>

                {/* Travel Interests */}
                <div className="space-y-3">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1">
                    Travel Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          formData.interests.includes(interest)
                            ? 'bg-[#059467] text-white shadow-md shadow-[#059467]/20'
                            : 'bg-slate-100 dark:bg-[#2a453b] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#345244]'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-3">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1">
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          formData.languages.includes(language)
                            ? 'bg-[#059467] text-white shadow-md shadow-[#059467]/20'
                            : 'bg-slate-100 dark:bg-[#2a453b] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#345244]'
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Travel Style */}
                <div className="space-y-3">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1">
                    Travel Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => selectTravelStyle(style)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          formData.travelStyle === style
                            ? 'bg-[#059467] text-white shadow-md shadow-[#059467]/20'
                            : 'bg-slate-100 dark:bg-[#2a453b] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#345244]'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleBack}
                    className="flex-1 h-12 bg-slate-100 dark:bg-[#2a453b] hover:bg-slate-200 dark:hover:bg-[#345244] text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 h-12 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#059467]/20 hover:shadow-[#059467]/30 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  className="w-full h-12 bg-transparent border-2 border-slate-200 dark:border-[#2a453b] hover:bg-slate-50 dark:hover:bg-[#1a3329] text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-base transition-all duration-200"
                >
                  Skip for Now
                </button>
              </div>
            )}

            {/* STEP 3: Profile Details */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                  You can add these later in your account settings
                </p>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200 resize-none"
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself and your travel experiences..."
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* Profile Picture */}
                <div className="space-y-3">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1">
                    Profile Picture
                  </label>
                  {profilePreview ? (
                    <div className="relative w-32 h-32 mx-auto">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-full h-full rounded-full object-cover border-4 border-slate-200 dark:border-[#2a453b]"
                      />
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute -top-2 -right-2 size-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-[#2a453b] rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a3329] transition-all duration-200">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {uploadingProfile ? (
                          <>
                            <div className="w-8 h-8 border-2 border-[#059467] border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Click to upload profile picture
                            </p>
                            <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfileUpload}
                        disabled={uploadingProfile}
                      />
                    </label>
                  )}
                </div>

                {/* Cover Photo */}
                <div className="space-y-3">
                  <label className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1">
                    Cover Photo
                  </label>
                  {coverPreview ? (
                    <div className="relative w-full h-40 mx-auto">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full rounded-2xl object-cover border-2 border-slate-200 dark:border-[#2a453b]"
                      />
                      <button
                        type="button"
                        onClick={removeCoverPhoto}
                        className="absolute top-2 right-2 size-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-[#2a453b] rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a3329] transition-all duration-200">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {uploadingCover ? (
                          <>
                            <div className="w-8 h-8 border-2 border-[#059467] border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Click to upload cover photo
                            </p>
                            <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        disabled={uploadingCover}
                      />
                    </label>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 h-12 bg-slate-100 dark:bg-[#2a453b] hover:bg-slate-200 dark:hover:bg-[#345244] text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || uploadingProfile || uploadingCover}
                    className="flex-1 h-12 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#059467]/20 hover:shadow-[#059467]/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  disabled={loading || uploadingProfile || uploadingCover}
                  className="w-full h-12 bg-transparent border-2 border-slate-200 dark:border-[#2a453b] hover:bg-slate-50 dark:hover:bg-[#1a3329] text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for Now
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#059467] font-bold hover:underline decoration-2 underline-offset-4"
                disabled={loading}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
