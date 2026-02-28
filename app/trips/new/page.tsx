'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Search,
  Globe,
  Lock,
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react';

const LocationMap = dynamic(() => import('../../../components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] rounded-2xl overflow-hidden relative shadow-inner bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
       <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
    </div>
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240]); // Default to Kathmandu
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Auto-calculate trip duration or validation status
  const isDateRangeValid = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return true;
    return new Date(formData.endDate) >= new Date(formData.startDate);
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.destination.trim()) {
      setError('Trip title and destination are required explorers.');
      return;
    }

    if (!isDateRangeValid) {
      setError('The journey cannot end before it begins. Check your dates!');
      return;
    }

    try {
      setLoading(true);
      const tripData = {
        ...formData,
        country: formData.country || formData.destination.split(',').pop()?.trim() || 'Global',
        lat: selectedLocation?.lat,
        lng: selectedLocation?.lng,
        imageUrl: coverPhotoUrl
      };

      const newTrip = await tripAPI.create(tripData);
      router.push(`/trips/${newTrip._id}`);
    } catch (err: any) {
      setError(err.message || 'The expedition log failed to save. Try again?');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, destination: data.display_name }));
      }
    } catch (err) {
      console.error('Reverse geocoding failed');
    }
  }, []);

  const geocodeDestination = useCallback(async (destination: string) => {
    if (!destination || destination.length < 3) return;
    
    try {
      setGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (err) {
      console.error('Geocoding failed');
    } finally {
      setGeocoding(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.destination) geocodeDestination(formData.destination);
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.destination, geocodeDestination]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nomadnotes_gear');
      
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ddiptfgrs'}/image/upload`,
        { method: 'POST', body: data }
      );
      const fileData = await res.json();
      setCoverPhotoUrl(fileData.secure_url);
    } catch (err) {
      setError('Image upload failed. Try a smaller file?');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713] selection:bg-emerald-500 selection:text-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fadeIn">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Introduction */}
          <div className="lg:w-1/3 space-y-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 rotate-3">
               <Globe className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-black dark:text-white tracking-tight leading-tight">
              Where to <br />
              <span className="text-emerald-500 text-5xl">Next?</span>
            </h1>
            <p className="text-black dark:text-white font-medium leading-relaxed">
              Plan your route, set your dates, and share your journey with the nomad community.
            </p>
            
            <div className="hidden lg:block pt-8 border-t border-slate-200 dark:border-slate-800">
               <div className="flex items-center gap-4 text-sm font-bold text-black dark:text-white uppercase tracking-widest">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Syncing Active
               </div>
            </div>
          </div>

          {/* Right: The Form Card */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 border border-white dark:border-white/5 relative overflow-hidden">
              
              {error && (
                <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-sm animate-shake">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Trip Branding */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Trip Identity</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full text-2xl font-black bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none pb-2 transition-colors text-black dark:text-white placeholder:text-black dark:placeholder:text-white"
                    placeholder="Adventure Title..."
                    required
                  />
                </div>

                {/* Destination & Map */}
                <div className="space-y-4">
                   <div className="relative group">
                    <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className="w-full pl-8 py-3 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-colors font-bold text-black dark:text-white placeholder:text-black dark:placeholder:text-white"
                      placeholder="Search Destination..."
                    />
                    {geocoding && <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={18} />}
                  </div>
                  
                  <div className="relative rounded-[2rem] overflow-hidden shadow-inner ring-1 ring-slate-100 dark:ring-white/5">
                    <button
                      type="button"
                      onClick={() => setIsMapFullscreen(true)}
                      className="absolute top-4 right-4 z-[1000] p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      title="Fullscreen Map"
                    >
                      <Maximize2 className="text-emerald-500" size={18} />
                    </button>
                    <LocationMap 
                      onLocationSelect={(lat, lng) => {
                        setSelectedLocation({ lat, lng });
                        setMapCenter([lat, lng]);
                        reverseGeocode(lat, lng);
                      }}
                      initialPosition={mapCenter}
                      selectedLocation={selectedLocation}
                      height="220px"
                    />
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Arrival</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                      <input
                        type="date"
                        name="startDate"
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none font-bold text-sm text-black dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Departure</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                      <input
                        type="date"
                        name="endDate"
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none font-bold text-sm text-black dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Media */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Visuals</label>
                  {coverPhotoUrl ? (
                    <div className="relative group rounded-3xl overflow-hidden h-40 shadow-lg">
                      <img src={coverPhotoUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Cover" />
                      <button 
                        type="button" 
                        onClick={() => setCoverPhotoUrl('')}
                        className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-xl hover:bg-rose-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                      <Upload className="text-black dark:text-white group-hover:text-emerald-500 transition-colors mb-2" size={32} />
                      <span className="text-xs font-black text-black dark:text-white uppercase tracking-widest">Drop cover image here</span>
                      <input type="file" className="hidden" onChange={handleDirectFileUpload} accept="image/*" />
                      {uploadingImage && <Loader2 className="mt-4 animate-spin text-emerald-500" size={20} />}
                    </label>
                  )}
                </div>

                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${formData.isPublic ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {formData.isPublic ? <Eye size={20} /> : <Lock size={20} />}
                    </div>
                    <div>
                      <h4 className="font-black text-black dark:text-white text-sm">Public Trip</h4>
                      <p className="text-xs text-black dark:text-white font-medium">Visible to other nomads in Discover</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleInputChange} className="sr-only peer" />
                    <div className="w-14 h-8 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading || !isDateRangeValid}
                  className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Log Expedition'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Fullscreen Map Modal */}
      {isMapFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <MapPin className="text-emerald-500" size={24} />
              <h3 className="text-white font-black text-lg">Select Location</h3>
            </div>
            <button
              onClick={() => setIsMapFullscreen(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <Minimize2 className="text-white" size={20} />
            </button>
          </div>
          <div className="flex-1 relative">
            <LocationMap 
              onLocationSelect={(lat, lng) => {
                setSelectedLocation({ lat, lng });
                setMapCenter([lat, lng]);
                reverseGeocode(lat, lng);
              }}
              initialPosition={mapCenter}
              selectedLocation={selectedLocation}
              height="100%"
            />
          </div>
          {selectedLocation && (
            <div className="p-4 bg-white/10 backdrop-blur-sm">
              <button
                onClick={() => setIsMapFullscreen(false)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-colors"
              >
                Confirm Location
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}