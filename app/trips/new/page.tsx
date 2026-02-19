'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { tripAPI } from '../../../services/api';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import {
  MapPin,
  Calendar,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Search
} from 'lucide-react';

const LocationMap = dynamic(() => import('../../../components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] rounded-input overflow-hidden relative shadow-inner bg-slate-200 animate-pulse" />
  ),
});

export default function CreateTripPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    isPublic: true,
    currency: 'USD'
  });
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-8.4095, 115.1889]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a trip title');
      return;
    }
    if (!formData.destination.trim()) {
      setError('Please enter a destination');
      return;
    }
    if (!formData.startDate) {
      setError('Please select a start date');
      return;
    }
    if (!formData.endDate) {
      setError('Please select an end date');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);

      // Prepare trip data
      const tripData: any = {
        title: formData.title,
        destination: formData.destination,
        country: formData.country || formData.destination.split(',').pop()?.trim() || 'Unknown',
        startDate: formData.startDate,
        endDate: formData.endDate,
        isPublic: formData.isPublic,
        currency: formData.currency
      };

      // Add location coordinates if selected
      if (selectedLocation) {
        tripData.lat = selectedLocation.lat;
        tripData.lng = selectedLocation.lng;
      }

      // Add cover photo URL if uploaded
      if (coverPhotoUrl) {
        tripData.imageUrl = coverPhotoUrl;
      }

      // Create trip
      const newTrip = await tripAPI.create(tripData);
      
      // Navigate to the new trip details page
      router.push(`/trips/${newTrip._id}`);
    } catch (err: any) {
      console.error('Error creating trip:', err);
      setError(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Geocode destination to get coordinates
  const geocodeDestination = useCallback(async (destination: string) => {
    if (!destination || destination.length < 3) return;
    
    try {
      setGeocoding(true);
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setSelectedLocation(newLocation);
        setMapCenter([newLocation.lat, newLocation.lng]);
        console.log('Geocoded location:', newLocation);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setGeocoding(false);
    }
  }, []);

  // Debounce geocoding when destination changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.destination) {
        geocodeDestination(formData.destination);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [formData.destination, geocodeDestination]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };



  const handleCloudinaryUpload = () => {
    setUploadingImage(true);

    // @ts-ignore - Cloudinary widget is loaded via script
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ddiptfgrs',
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nomadnotes_gear',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        maxFileSize: 5000000,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        resourceType: 'image',
        cropping: true,
        croppingAspectRatio: 2,
        showSkipCropButton: true,
        croppingShowDimensions: true,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#059467',
            tabIcon: '#059467',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#059467',
            action: '#059467',
            inactiveTabIcon: '#9CA3AF',
            error: '#EF4444',
            inProgress: '#059467',
            complete: '#059467',
            sourceBg: '#F9FAFB'
          }
        }
      },
      (error: any, result: any) => {
        setUploadingImage(false);
        
        if (error) {
          console.error('Upload error:', error);
          setError(`Failed to upload image: ${error.message || 'Please try again'}`);
          return;
        }

        if (result.event === 'success') {
          const imageUrl = result.info.secure_url;
          setCoverPhotoUrl(imageUrl);
          console.log('Image uploaded successfully:', imageUrl);
        }
      }
    );

    widget.open();
  };

  const removeCoverPhoto = () => {
    setCoverPhotoUrl('');
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    console.log('Selected location:', { lat, lng });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] bg-topographic">
        <main className="flex-grow flex items-center justify-center py-12 px-4">
          {/* Card Container */}
          <div className="w-full max-w-[640px] bg-white dark:bg-[#132a24] rounded-2xl shadow-[0_25px_50px_-12px_rgba(5,148,103,0.15)] p-8 md:p-12 relative overflow-hidden transition-all">
            {/* Close Button */}
            <button
              onClick={() => router.back()}
              className="absolute top-8 right-8 text-slate-400 hover:text-[#059467] transition-colors"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Header */}
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-[#0d1c17] dark:text-white text-[30px] font-black leading-tight tracking-[-0.033em] mb-2">
                Create New Trip
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base font-normal">
                Start planning your next adventure. Fill in the details below.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Trip Title */}
              <div className="flex flex-col gap-2">
                <label className="text-[#0d1c17] dark:text-white text-sm font-bold tracking-wide uppercase">
                  Trip Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full h-14 bg-slate-100 dark:bg-slate-800 border-none rounded-input px-5 text-base text-[#0d1c17] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#059467] focus:ring-offset-2 dark:focus:ring-offset-[#132a24] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. Summer in Bali"
                  required
                />
              </div>

              {/* Destination & Map Group */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d1c17] dark:text-white text-sm font-bold tracking-wide uppercase">
                    Where are you going?
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#059467] pointer-events-none w-5 h-5" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full h-14 bg-slate-100 dark:bg-slate-800 border-none rounded-input pl-12 pr-12 text-base text-[#0d1c17] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#059467] focus:ring-offset-2 dark:focus:ring-offset-[#132a24] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g. Ubud, Indonesia"
                      required
                    />
                    {geocoding && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-[#059467] animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Type a location and the map will update automatically
                  </p>
                </div>

                {/* Map Snippet */}
                <LocationMap 
                  onLocationSelect={handleLocationSelect}
                  initialPosition={mapCenter}
                  selectedLocation={selectedLocation}
                  height="200px"
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d1c17] dark:text-white text-sm font-bold tracking-wide uppercase">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full h-14 bg-slate-100 dark:bg-slate-800 border-none rounded-input px-5 text-base text-[#0d1c17] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#059467] focus:ring-offset-2 dark:focus:ring-offset-[#132a24] transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Select start date"
                      required
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d1c17] dark:text-white text-sm font-bold tracking-wide uppercase">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full h-14 bg-slate-100 dark:bg-slate-800 border-none rounded-input px-5 text-base text-[#0d1c17] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#059467] focus:ring-offset-2 dark:focus:ring-offset-[#132a24] transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Select end date"
                      required
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="flex flex-col gap-2">
                <label className="text-[#0d1c17] dark:text-white text-sm font-bold tracking-wide uppercase">
                  Cover Photo
                </label>
                
                {/* Cloudinary Upload Button */}
                <button
                  type="button"
                  onClick={handleCloudinaryUpload}
                  disabled={uploadingImage || loading}
                  className="w-full border-2 border-dashed border-[#059467]/40 bg-[#e7f4f0]/30 dark:bg-[#059467]/5 hover:bg-[#e7f4f0]/60 dark:hover:bg-[#059467]/10 rounded-input p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="size-12 rounded-full bg-white dark:bg-[#059467]/20 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    {uploadingImage ? (
                      <Loader2 className="text-[#059467] w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="text-[#059467] w-6 h-6" />
                    )}
                  </div>
                  <p className="text-[#059467] font-bold text-sm">
                    {uploadingImage ? 'Uploading...' : coverPhotoUrl ? 'Change Cover Photo' : 'Click to upload'}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    JPG, PNG or WEBP (max. 5MB)
                  </p>
                </button>

                {/* Image Preview */}
                {coverPhotoUrl && (
                  <div className="relative group mt-2">
                    <img
                      src={coverPhotoUrl}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-input border-2 border-[#059467]/20"
                    />
                    <button
                      type="button"
                      onClick={removeCoverPhoto}
                      disabled={loading}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Help Text */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mt-2">
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    💡 Upload a beautiful cover photo to make your trip stand out. You can crop and adjust the image before uploading.
                  </p>
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-2">
                <div className="flex flex-col">
                  <span className="text-[#0d1c17] dark:text-white text-base font-bold">
                    Public Trip
                  </span>
                  <span className="text-slate-500 text-sm">
                    Visible to the community and explore page
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#059467]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#059467] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed" />
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#059467] hover:bg-[#047853] text-white rounded-input font-bold text-base shadow-lg shadow-[#059467]/30 transition-all hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-[#059467]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Trip...
                    </>
                  ) : (
                    'Create Trip'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="text-slate-500 hover:text-[#0d1c17] dark:hover:text-white text-sm font-medium text-center transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
