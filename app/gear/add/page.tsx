'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { gearAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import {
  Check,
  Info,
  ArrowLeft,
  ArrowRight,
  Zap,
  ImagePlus,
  X as XIcon,
  Upload,
  Loader2,
  Camera
} from 'lucide-react';

// Cloudinary types
declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function AddGearPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    // Specifications
    brand: '',
    model: '',
    size: '',
    weight: '',
    color: '',
    // Step 2: Images
    images: [] as string[],
    imageInput: '',
    // Step 3: Pricing
    pricePerDay: '',
    minimumRentalDays: '1',
    deposit: '',
    currency: 'USD',
    // Step 4: Review (no additional fields)
  });

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Test backend connection on mount
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        console.log('Backend health check:', data);
      } catch (err) {
        console.error('Backend not reachable:', err);
        setError('Backend server is not running. Please start the backend server.');
      }
    };
    testBackend();
  }, []);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
            <p className="text-[#0d1c17]/60 dark:text-white/60">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const steps = [
    { number: 1, label: 'Basic Info', completed: currentStep > 1 },
    { number: 2, label: 'Images', completed: currentStep > 2 },
    { number: 3, label: 'Pricing', completed: currentStep > 3 },
    { number: 4, label: 'Review', completed: currentStep > 4 }
  ];

  const categories = [
    'Backpacks',
    'Tents',
    'Sleeping Bags',
    'Trekking Poles',
    'Camping Gear',
    'Climbing Equipment',
    'Winter Gear',
    'Electronics',
    'Clothing',
    'Other'
  ];

  const conditions = [
    'Excellent',
    'Good',
    'Fair',
    'Used'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAddImage = () => {
    if (formData.imageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, prev.imageInput.trim()],
        imageInput: ''
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Cloudinary upload function
  const handleCloudinaryUpload = () => {
    if (typeof window === 'undefined' || !window.cloudinary) {
      alert('Cloudinary widget not loaded. Please refresh the page.');
      return;
    }

    setUploadingImage(true);

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'nomadnotes/gear',
        resourceType: 'image',
        cropping: true,
        croppingAspectRatio: 1.5, // 3:2 ratio
        showSkipCropButton: false,
        croppingShowDimensions: true,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#059467',
            tabIcon: '#059467',
            link: '#059467',
            action: '#059467',
            inactiveTabIcon: '#8E8E93',
            error: '#FF6B6B',
            inProgress: '#059467',
            complete: '#059467',
            sourceBg: '#F8F9FA'
          },
          fonts: {
            default: null,
            "'Inter', sans-serif": 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          }
        }
      },
      (error: any, result: any) => {
        setUploadingImage(false);
        
        if (error) {
          console.error('Cloudinary upload error:', error);
          alert('Upload failed. Please try again.');
          return;
        }

        if (result && result.event === 'success') {
          const imageUrl = result.info.secure_url;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));
        }
      }
    );

    widget.open();
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          setError('Title is required');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Description is required');
          return false;
        }
        if (!formData.category) {
          setError('Category is required');
          return false;
        }
        if (!formData.condition) {
          setError('Condition is required');
          return false;
        }
        if (!formData.location.trim()) {
          setError('Location is required');
          return false;
        }
        break;
      case 2:
        // Images are optional
        break;
      case 3:
        if (!formData.pricePerDay || parseFloat(formData.pricePerDay) <= 0) {
          setError('Valid daily price is required');
          return false;
        }
        if (!formData.minimumRentalDays || parseInt(formData.minimumRentalDays) < 1) {
          setError('Minimum rental days must be at least 1');
          return false;
        }
        if (formData.deposit && parseFloat(formData.deposit) < 0) {
          setError('Security deposit cannot be negative');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const gearData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        pricePerDay: parseFloat(formData.pricePerDay),
        currency: formData.currency,
        location: formData.location,
        images: formData.images,
        specifications: {
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          size: formData.size || undefined,
          weight: formData.weight || undefined,
          color: formData.color || undefined,
        },
        minimumRentalDays: parseInt(formData.minimumRentalDays),
        deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
      };

      console.log('Submitting gear data:', gearData);

      const result = await gearAPI.create(gearData);
      
      console.log('Gear created successfully:', result);
      
      // Redirect to the newly created gear page
      router.push(`/gear/${result._id}`);
    } catch (err: any) {
      console.error('Error creating gear:', err);
      const errorMessage = err.message || 'Failed to create gear listing';
      setError(errorMessage);
      setLoading(false);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    } else {
      router.back();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Basic Information
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Tell us about your gear
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                  htmlFor="title"
                >
                  Gear Title *
                </label>
                <input
                  className="w-full px-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                  id="title"
                  name="title"
                  placeholder="e.g., Arc'teryx Alpha SV Jacket"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                  htmlFor="description"
                >
                  Description *
                </label>
                <textarea
                  className="w-full px-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400 min-h-[120px] resize-none"
                  id="description"
                  name="description"
                  placeholder="Describe your gear, its features, and condition..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                    htmlFor="category"
                  >
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                    htmlFor="condition"
                  >
                    Condition *
                  </label>
                  <select
                    className="w-full px-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium"
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select condition</option>
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                  htmlFor="location"
                >
                  Location *
                </label>
                <input
                  className="w-full px-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                  id="location"
                  name="location"
                  placeholder="e.g., Vancouver, BC"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Specifications Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Specifications (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Brand */}
                  <div className="space-y-2">
                    <label
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                      htmlFor="brand"
                    >
                      Brand
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                      id="brand"
                      name="brand"
                      placeholder="e.g., Arc'teryx"
                      type="text"
                      value={formData.brand}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <label
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                      htmlFor="model"
                    >
                      Model
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                      id="model"
                      name="model"
                      placeholder="e.g., Alpha SV"
                      type="text"
                      value={formData.model}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Size */}
                  <div className="space-y-2">
                    <label
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                      htmlFor="size"
                    >
                      Size
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                      id="size"
                      name="size"
                      placeholder="e.g., Medium, 65L"
                      type="text"
                      value={formData.size}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <label
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                      htmlFor="weight"
                    >
                      Weight
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                      id="weight"
                      name="weight"
                      placeholder="e.g., 1.2kg, 2.5lbs"
                      type="text"
                      value={formData.weight}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Color */}
                  <div className="space-y-2 sm:col-span-2">
                    <label
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                      htmlFor="color"
                    >
                      Color
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                      id="color"
                      name="color"
                      placeholder="e.g., Black, Blue"
                      type="text"
                      value={formData.color}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Add Images
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Show off your gear with photos
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Cloudinary Upload Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleCloudinaryUpload}
                  disabled={uploadingImage || formData.images.length >= 5}
                  className="w-full px-6 py-4 bg-[#059467] hover:bg-[#047854] disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-3"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Upload from Device
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink mx-4 text-sm text-slate-500 dark:text-slate-400 bg-[#f5f8f7] dark:bg-[#0f231d] px-2">
                    or add image URL
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>
              </div>

              {/* Image URL Input */}
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                  htmlFor="imageInput"
                >
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                    id="imageInput"
                    name="imageInput"
                    placeholder="https://example.com/image.jpg"
                    type="url"
                    value={formData.imageInput}
                    onChange={handleInputChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                    disabled={formData.images.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={!formData.imageInput.trim() || formData.images.length >= 5}
                    className="px-6 py-4 bg-[#059467] hover:bg-[#047854] disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors flex items-center gap-2"
                  >
                    <ImagePlus className="w-5 h-5" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-slate-500 ml-1">
                  Add image URLs one at a time. Maximum 5 images allowed.
                </p>
              </div>

              {/* Upload Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">📸 Image Upload Tips:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Upload up to 5 high-quality images</li>
                      <li>• Max 5MB per image</li>
                      <li>• Supported formats: JPG, PNG, WEBP</li>
                      <li>• Images will be automatically cropped to 3:2 ratio</li>
                      <li>• First image will be used as the main photo</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Images ({formData.images.length}/5)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={image}
                          alt={`Gear image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          {index === 0 ? 'Main' : `${index + 1} of ${formData.images.length}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {formData.images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <Upload className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-center">
                    No images added yet
                  </p>
                  <p className="text-xs text-slate-400 text-center mt-1">
                    Add at least one image to showcase your gear
                  </p>
                </div>
              )}
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Set your pricing
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Control how much you earn and how you get paid
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Daily Price */}
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                  htmlFor="pricePerDay"
                >
                  Daily Price *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">$</span>
                  </div>
                  <input
                    className="w-full pl-8 pr-20 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium text-lg placeholder:text-slate-400"
                    id="pricePerDay"
                    name="pricePerDay"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-sm">/ day</span>
                  </div>
                </div>
              </div>

              {/* Min Days & Deposit Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                    htmlFor="minimumRentalDays"
                  >
                    Min Rental Days *
                  </label>
                  <input
                    className="w-full px-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium text-lg placeholder:text-slate-400"
                    id="minimumRentalDays"
                    name="minimumRentalDays"
                    placeholder="1"
                    type="number"
                    min="1"
                    value={formData.minimumRentalDays}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                    htmlFor="deposit"
                  >
                    Security Deposit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-medium">$</span>
                    </div>
                    <input
                      className="w-full pl-8 pr-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium text-lg placeholder:text-slate-400"
                      id="deposit"
                      name="deposit"
                      placeholder="0"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.deposit}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
                  htmlFor="currency"
                >
                  Currency
                </label>
                <select
                  className="w-full px-4 py-4 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-medium"
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="NPR">NPR (₨)</option>
                </select>
              </div>
            </div>

            {/* Tips Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                className="flex items-center gap-2 text-[#059467] text-sm font-medium hover:underline"
              >
                <Info className="w-4 h-4" />
                <span>Tips for pricing your gear</span>
              </button>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Review & Publish
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Check everything looks good before publishing
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Preview Card */}
              <div className="bg-[#f5f8f7] dark:bg-slate-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  {formData.images.length > 0 ? (
                    <img
                      src={formData.images[0]}
                      alt={formData.title}
                      className="w-24 h-24 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <ImagePlus className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {formData.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      {formData.category} • {formData.condition}
                    </p>
                    <p className="text-2xl font-bold text-[#059467]">
                      ${formData.pricePerDay} <span className="text-sm font-normal text-slate-500">/ day</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Location</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formData.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Min Rental</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formData.minimumRentalDays} {parseInt(formData.minimumRentalDays) === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Security Deposit</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${formData.deposit || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Images</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formData.images.length} {formData.images.length === 1 ? 'image' : 'images'}
                    </span>
                  </div>
                </div>

                {/* Specifications */}
                {(formData.brand || formData.model || formData.size || formData.weight || formData.color) && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {formData.brand && (
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Brand</span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{formData.brand}</p>
                        </div>
                      )}
                      {formData.model && (
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Model</span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{formData.model}</p>
                        </div>
                      )}
                      {formData.size && (
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Size</span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{formData.size}</p>
                        </div>
                      )}
                      {formData.weight && (
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Weight</span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{formData.weight}</p>
                        </div>
                      )}
                      {formData.color && (
                        <div className="col-span-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Color</span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{formData.color}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Description Preview */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Description
                </label>
                <div className="bg-[#f5f8f7] dark:bg-slate-900 rounded-2xl p-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {formData.description}
                  </p>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                <p className="text-xs text-blue-900 dark:text-blue-200">
                  By publishing this listing, you agree to our Terms of Service and confirm that all information provided is accurate.
                </p>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col items-center">
        <main className="w-full max-w-[640px] flex-1 flex flex-col justify-start px-4 sm:px-0 mt-6 mb-8">
          {/* Progress Stepper */}
          <div className="mb-10 px-4">
            <div className="relative flex justify-between items-center w-full">
              {/* Connecting Line Background */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 dark:bg-slate-700 -z-10 transform -translate-y-1/2" />
              
              {/* Active Line Progress */}
              <div 
                className="absolute top-1/2 left-0 h-[2px] bg-[#059467] -z-0 transform -translate-y-1/2 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center gap-2 group cursor-pointer relative">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                      step.completed
                        ? 'bg-[#059467] text-white ring-4 ring-[#f5f8f7] dark:ring-[#0f231d]'
                        : currentStep === step.number
                        ? 'bg-[#059467] text-white ring-4 ring-[#059467]/20 ring-offset-2 ring-offset-[#f5f8f7] dark:ring-offset-[#0f231d]'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 ring-4 ring-[#f5f8f7] dark:ring-[#0f231d]'
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-bold">{step.number}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold absolute -bottom-6 w-max ${
                      step.completed || currentStep === step.number
                        ? 'text-[#059467]'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Central Form Card */}
          <form className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl p-8 sm:p-10 flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
            {renderStepContent()}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <p className="text-sm text-red-900 dark:text-red-200 font-medium mb-2">
                  Error: {error}
                </p>
                <details className="text-xs text-red-800 dark:text-red-300">
                  <summary className="cursor-pointer hover:underline">Debug Info</summary>
                  <div className="mt-2 space-y-1">
                    <p>Token exists: {!!localStorage.getItem('token') ? 'Yes' : 'No'}</p>
                    <p>User exists: {!!localStorage.getItem('user') ? 'Yes' : 'No'}</p>
                    <p>Auth status: {status}</p>
                    <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</p>
                  </div>
                </details>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-3 rounded-full text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-8 py-3 rounded-full bg-[#059467] hover:bg-[#047854] text-white font-bold shadow-lg shadow-[#059467]/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : currentStep === 4 ? (
                  <>
                    Publish Listing
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
