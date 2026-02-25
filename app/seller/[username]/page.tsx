'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { gearAPI, bookingAPI } from '../../../services/api';
import { formatNPR } from '../../../lib/currency';
import { getCityName } from '../../../lib/location';
import { useAuth } from '../../../hooks/useAuth';
import {
  ArrowLeft,
  MapPin,
  Star,
  Package,
  BadgeCheck,
  Loader2,
  Mail,
  User as UserIcon,
  ShoppingBag,
  Edit,
  Calendar,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface GearItem {
  _id: string;
  title: string;
  category: string;
  location: string;
  pricePerDay: number;
  rating: number;
  images?: string[];
  available: boolean;
  owner: {
    _id: string;
    name: string;
    profilePicture?: string;
    username: string;
  };
}

interface SellerData {
  user: {
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
    location?: string;
    bio?: string;
  };
  gear: GearItem[];
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const username = params.username as string;
  
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [rentals, setRentals] = useState<any[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [activeTab, setActiveTab] = useState<'gear' | 'rentals'>('gear');

  const isOwnProfile = useMemo(() => {
    return currentUser && sellerData?.user && (
      currentUser._id === sellerData.user._id || 
      currentUser.username === sellerData.user.username
    );
  }, [currentUser, sellerData]);

  const fetchRentals = useCallback(async () => {
    try {
      setLoadingRentals(true);
      const bookings = await bookingAPI.getGearBookings();
      setRentals(bookings);
    } catch (err) {
      console.error('Error fetching rentals:', err);
    } finally {
      setLoadingRentals(false);
    }
  }, []);

  const fetchSellerGear = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await gearAPI.getGearByUser(username);
      setSellerData(data);
      
      if (currentUser && (currentUser._id === data.user._id || currentUser.username === data.user.username)) {
        fetchRentals();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load seller information');
    } finally {
      setLoading(false);
    }
  }, [username, currentUser, fetchRentals]);

  useEffect(() => {
    if (username) fetchSellerGear();
  }, [fetchSellerGear]);

  const categories = useMemo(() => 
    Array.from(new Set(sellerData?.gear.map(item => item.category) || [])),
  [sellerData]);

  const filteredGear = useMemo(() => 
    selectedCategory 
      ? sellerData?.gear.filter(item => item.category === selectedCategory)
      : sellerData?.gear,
  [selectedCategory, sellerData]);

  const avgRating = useMemo(() => {
    if (!sellerData?.gear.length) return '0.0';
    const total = sellerData.gear.reduce((sum, item) => sum + (item.rating || 0), 0);
    return (total / sellerData.gear.length).toFixed(1);
  }, [sellerData]);

  if (loading) return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-slate-900 dark:text-[#059467] animate-spin" />
        <p className="font-bold text-[#059467] animate-pulse uppercase tracking-widest text-xs">Syncing Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col selection:bg-[#059467] selection:text-white">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-[#059467] font-bold mb-8 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Discovery</span>
        </button>

        {/* Profile Identity Card */}
        <section className="bg-white dark:bg-[#1a2c26] rounded-[2rem] p-6 md:p-10 shadow-xl shadow-emerald-900/5 border border-white/50 dark:border-white/5 mb-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#059467]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 ring-4 ring-white dark:ring-white/10">
                <img 
                  src={sellerData?.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerData?.user.name || '')}&background=059467&color=fff&size=200`} 
                  className="w-full h-full object-cover" 
                  alt="Profile"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#1a2c26] p-2 rounded-2xl shadow-lg">
                <BadgeCheck className="w-6 h-6 text-[#059467]" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-1">
                  {sellerData?.user.name}
                </h1>
                <p className="text-[#059467] font-black text-sm uppercase tracking-[0.2em]">@{sellerData?.user.username}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl text-sm font-bold">
                  <MapPin size={16} className="text-[#059467]" />
                  {getCityName(sellerData?.user.location || 'Kathmandu, Nepal')}
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl text-sm font-bold">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  {avgRating} Seller Rating
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
                {sellerData?.user.bio || "No bio provided. This seller prefers to let their gear do the talking."}
              </p>

              {!isOwnProfile && (
                <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                  <button
                    onClick={() => router.push(`/messages?user=${sellerData?.user._id}`)}
                    className="flex items-center gap-2 px-8 py-3.5 bg-[#059467] text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:bg-[#06ac77] transition-all active:scale-95"
                  >
                    <Mail size={18} /> Send Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Dynamic Dashboard Content */}
        {isOwnProfile ? (
          <div className="space-y-10">
            {/* Owner Tab Switcher */}
            <div className="flex p-1.5 bg-white dark:bg-[#1a2c26] rounded-2xl w-fit shadow-sm border border-slate-100 dark:border-white/5">
              {(['gear', 'rentals'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? 'bg-[#059467] text-white shadow-lg' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#059467]'
                  }`}
                >
                  {tab === 'gear' ? 'Inventory' : 'Active Rentals'}
                </button>
              ))}
            </div>

            {activeTab === 'rentals' ? (
              <div className="animate-slideUp">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <TrendingUp className="text-[#059467]" /> Rental Operations
                  </h2>
                </div>
                {rentals.length > 0 ? (
                  <div className="grid gap-4">
                    {rentals.map((rental) => (
                      <div 
                        key={rental._id}
                        onClick={() => router.push(`/bookings/${rental._id}`)}
                        className="group flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-[#1a2c26] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:shadow-xl"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                          <img src={rental.gear?.images?.[0]} className="w-full h-full object-cover" alt="Gear" />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-1">
                          <h4 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-[#059467] transition-colors">{rental.gear?.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-500 font-bold uppercase tracking-wider">Rented by {rental.renter?.name}</p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <span className="text-xs font-black px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full uppercase tracking-tighter">
                              Status: {rental.status}
                            </span>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                              <Calendar size={12} /> {new Date(rental.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-[#059467]">{formatNPR(rental.totalPrice)}</p>
                          <ChevronRight className="ml-auto text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-white dark:bg-[#1a2c26] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active rentals found</h3>
                    <p className="text-slate-600 dark:text-slate-500">Listed gear waiting for its next adventure.</p>
                  </div>
                )}
              </div>
            ) : (
              <InventoryGrid 
                gear={filteredGear || []} 
                isOwn={true} 
                categories={categories} 
                selectedCat={selectedCategory} 
                setCat={setSelectedCategory} 
                router={router}
              />
            )}
          </div>
        ) : (
          <InventoryGrid 
            gear={filteredGear || []} 
            isOwn={false} 
            categories={categories} 
            selectedCat={selectedCategory} 
            setCat={setSelectedCategory} 
            router={router}
          />
        )}
      </main>
      
      <Footer />
      
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

/* Sub-component for Gear Grid to keep the main component clean */
function InventoryGrid({ gear, isOwn, categories, selectedCat, setCat, router }: any) {
  return (
    <div className="animate-slideUp">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="text-[#059467]" /> {isOwn ? 'Your Inventory' : 'Available Gear'}
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">{gear.length} Items Listed</p>
        </div>
        
        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat('')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              !selectedCat ? 'bg-[#059467] text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-[#1a2c26] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Items
          </button>
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setCat(cat)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                selectedCat === cat ? 'bg-[#059467] text-white shadow-lg' : 'bg-white dark:bg-[#1a2c26] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {gear.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {gear.map((item: any) => (
            <div 
              key={item._id}
              onClick={() => router.push(`/gear/${item._id}`)}
              className="group bg-white dark:bg-[#1a2c26] rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="relative aspect-square overflow-hidden m-4 rounded-[2rem]">
                <img src={item.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20">
                  <p className="text-[#059467] font-black text-sm">{formatNPR(item.pricePerDay)}<span className="text-[10px] text-slate-400">/day</span></p>
                </div>
                {isOwn && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push(`/gear/${item._id}/edit`); }}
                    className="absolute bottom-4 right-4 p-4 bg-white/90 backdrop-blur-md text-[#059467] rounded-2xl shadow-xl hover:bg-[#059467] hover:text-white transition-all transform hover:scale-110"
                  >
                    <Edit size={20} />
                  </button>
                )}
              </div>
              <div className="p-8 pt-2 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight group-hover:text-[#059467] transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-700">{item.rating || 4.5}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <MapPin size={14} className="text-emerald-500" />
                  {getCityName(item.location)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white dark:bg-[#1a2c26] rounded-[3rem] border border-slate-100 dark:border-white/5">
          <Package size={64} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Inventory is empty</h3>
          <p className="text-slate-600 dark:text-slate-400">No gear matching this category was found.</p>
        </div>
      )}
    </div>
  );
}