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
  ShoppingBag,
  Edit,
  Calendar,
  ChevronRight,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Activity
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

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    pendingRevenue: number;
    completedBookings: number;
    activeBookings: number;
    cancelledBookings: number;
    avgBookingValue: number;
    totalRentalDays: number;
    totalBookings: number;
  };
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    bookingsByStatus: Record<string, number>;
    categoryRevenue: Array<{ category: string; revenue: number }>;
    topGear: Array<{ gear: any; bookings: number; revenue: number }>;
  };
  recentBookings: any[];
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const username = params.username as string;
  
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [rentals, setRentals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'gear' | 'rentals' | 'analytics'>('rentals');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const isOwnProfile = useMemo(() => {
    return currentUser && sellerData?.user && (
      currentUser._id === sellerData.user._id || 
      currentUser.username === sellerData.user.username
    );
  }, [currentUser, sellerData]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const data = await bookingAPI.getAnalytics(dateRange);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [dateRange]);

  const fetchRentals = useCallback(async () => {
    try {
      const bookings = await bookingAPI.getGearBookings();
      setRentals(bookings);
    } catch (err) {
      console.error('Error fetching rentals:', err);
    }
  }, []);

  const fetchSellerGear = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gearAPI.getGearByUser(username);
      setSellerData(data);
      
      if (currentUser && (currentUser._id === data.user._id || currentUser.username === data.user.username)) {
        fetchRentals();
        fetchAnalytics();
      }
    } catch (err: any) {
      console.error(err.message || 'Failed to load seller information');
    } finally {
      setLoading(false);
    }
  }, [username, currentUser, fetchRentals, fetchAnalytics]);

  useEffect(() => {
    if (username) fetchSellerGear();
  }, [fetchSellerGear]);

  useEffect(() => {
    if (isOwnProfile && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [isOwnProfile, activeTab, fetchAnalytics]);

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

  const exportToCSV = () => {
    if (!analytics) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', analytics.summary.totalRevenue],
      ['Pending Revenue', analytics.summary.pendingRevenue],
      ['Completed Bookings', analytics.summary.completedBookings],
      ['Active Bookings', analytics.summary.activeBookings],
      ['Average Booking Value', analytics.summary.avgBookingValue],
      ['Total Rental Days', analytics.summary.totalRentalDays],
      [''],
      ['Monthly Revenue'],
      ['Month', 'Revenue'],
      ...analytics.charts.monthlyRevenue.map(m => [m.month, m.revenue]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d0b] flex flex-col selection:bg-[#059467] selection:text-white relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Header />
      
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8 animate-fadeIn relative z-10">
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
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 lg:sticky lg:top-24">
                <div className="flex items-center gap-3 mb-8 px-2">
                  <div className="p-2.5 bg-[#059467]/10 dark:bg-[#059467]/20 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-[#059467]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Seller</h2>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Dashboard</p>
                  </div>
                </div>
                
                <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                  {[
                    { id: 'rentals', icon: ShoppingBag, label: 'Orders' },
                    { id: 'gear', icon: Package, label: 'Inventory' },
                    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all whitespace-nowrap lg:whitespace-normal font-bold text-sm ${
                        activeTab === item.id
                          ? 'bg-[#059467] text-white shadow-lg shadow-[#059467]/20 scale-[1.02] lg:translate-x-1 lg:scale-100'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {activeTab === 'analytics' ? (
                <AnalyticsDashboard 
                  analytics={analytics}
                  loading={loadingAnalytics}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  onRefresh={fetchAnalytics}
                  onExport={exportToCSV}
                />
              ) : activeTab === 'rentals' ? (
                <RentalsTab rentals={rentals} router={router} />
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

/* Analytics Dashboard Component */
function AnalyticsDashboard({ analytics, loading, dateRange, setDateRange, onRefresh, onExport }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-20 text-center bg-white dark:bg-[#1a2c26] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
        <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No analytics data available</h3>
        <p className="text-slate-600 dark:text-slate-500">Start renting out your gear to see insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slideUp">
      {/* Date Filters & Export */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-[#1a2c26] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#059467]" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f231d] text-slate-900 dark:text-white font-bold text-sm"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f231d] text-slate-900 dark:text-white font-bold text-sm"
            />
          </div>
          <button
            onClick={onRefresh}
            className="px-6 py-2 bg-[#059467] text-white rounded-xl font-bold text-sm hover:bg-[#06ac77] transition-all"
          >
            Apply Filter
          </button>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<DollarSign className="text-emerald-500" />}
          label="Total Revenue"
          value={formatNPR(analytics.summary.totalRevenue)}
          trend="+12%"
          color="emerald"
        />
        <MetricCard
          icon={<TrendingUp className="text-blue-500" />}
          label="Pending Revenue"
          value={formatNPR(analytics.summary.pendingRevenue)}
          color="blue"
        />
        <MetricCard
          icon={<Calendar className="text-purple-500" />}
          label="Completed Bookings"
          value={analytics.summary.completedBookings.toString()}
          color="purple"
        />
        <MetricCard
          icon={<Activity className="text-amber-500" />}
          label="Active Bookings"
          value={analytics.summary.activeBookings.toString()}
          color="amber"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1a2c26] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Avg Booking Value</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{formatNPR(analytics.summary.avgBookingValue)}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2c26] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Rental Days</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{analytics.summary.totalRentalDays}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2c26] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cancellation Rate</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics.summary.totalBookings > 0 
              ? ((analytics.summary.cancelledBookings / analytics.summary.totalBookings) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* 🎉 SURPRISE: Performance Score & Achievements */}
      <div className="bg-gradient-to-br from-[#059467] to-emerald-600 p-8 rounded-3xl text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Performance Score Circle */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 fill-white" />
              Performance Score
            </h3>
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${((analytics.summary.completedBookings / (analytics.summary.totalBookings || 1)) * 100 * 2.51)} 251`}
                  className="animate-in zoom-in duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-black">
                  {Math.round((analytics.summary.completedBookings / (analytics.summary.totalBookings || 1)) * 100)}
                </p>
                <p className="text-sm font-bold opacity-80">Success Rate</p>
              </div>
            </div>
            <p className="mt-4 text-center text-sm opacity-90">
              {analytics.summary.completedBookings} of {analytics.summary.totalBookings} bookings completed successfully
            </p>
          </div>

          {/* Achievement Badges */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black mb-6">🏆 Achievements Unlocked</h3>
            <div className="grid grid-cols-2 gap-4">
              {analytics.summary.completedBookings >= 1 && (
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 animate-in zoom-in duration-500">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="font-black text-sm">First Rental</p>
                  <p className="text-xs opacity-80">Complete your first booking</p>
                </div>
              )}
              {analytics.summary.completedBookings >= 5 && (
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 animate-in zoom-in duration-500" style={{ animationDelay: '100ms' }}>
                  <div className="text-3xl mb-2">🚀</div>
                  <p className="font-black text-sm">Rising Star</p>
                  <p className="text-xs opacity-80">5+ completed rentals</p>
                </div>
              )}
              {analytics.summary.completedBookings >= 10 && (
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 animate-in zoom-in duration-500" style={{ animationDelay: '200ms' }}>
                  <div className="text-3xl mb-2">⭐</div>
                  <p className="font-black text-sm">Pro Seller</p>
                  <p className="text-xs opacity-80">10+ completed rentals</p>
                </div>
              )}
              {analytics.summary.totalRevenue >= 10000 && (
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 animate-in zoom-in duration-500" style={{ animationDelay: '300ms' }}>
                  <div className="text-3xl mb-2">💰</div>
                  <p className="font-black text-sm">Money Maker</p>
                  <p className="text-xs opacity-80">NPR 10K+ earned</p>
                </div>
              )}
              {(analytics.summary.cancelledBookings / (analytics.summary.totalBookings || 1)) < 0.1 && analytics.summary.totalBookings >= 5 && (
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 animate-in zoom-in duration-500" style={{ animationDelay: '400ms' }}>
                  <div className="text-3xl mb-2">🛡️</div>
                  <p className="font-black text-sm">Reliable</p>
                  <p className="text-xs opacity-80">Low cancellation rate</p>
                </div>
              )}
              {analytics.charts.topGear.length >= 3 && (
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 animate-in zoom-in duration-500" style={{ animationDelay: '500ms' }}>
                  <div className="text-3xl mb-2">📦</div>
                  <p className="font-black text-sm">Diverse Inventory</p>
                  <p className="text-xs opacity-80">3+ popular items</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Line Chart */}
        <div className="bg-white dark:bg-[#1a2c26] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-[#059467]" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Revenue Trend</h3>
          </div>
          <div className="relative h-64">
            {/* Line Chart */}
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 50}
                  x2="400"
                  y2={i * 50}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-white/5"
                  strokeWidth="1"
                />
              ))}
              
              {/* Area gradient */}
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059467" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#059467" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Area fill */}
              <path
                d={`M 0 ${200 - (analytics.charts.monthlyRevenue[0]?.revenue || 0) / Math.max(...analytics.charts.monthlyRevenue.map((m: any) => m.revenue)) * 180} ${analytics.charts.monthlyRevenue.map((item: any, idx: number) => {
                  const x = (idx / (analytics.charts.monthlyRevenue.length - 1)) * 400;
                  const y = 200 - (item.revenue / Math.max(...analytics.charts.monthlyRevenue.map((m: any) => m.revenue))) * 180;
                  return `L ${x} ${y}`;
                }).join(' ')} L 400 200 L 0 200 Z`}
                fill="url(#revenueGradient)"
                className="animate-in fade-in duration-1000"
              />
              
              {/* Line */}
              <path
                d={`M 0 ${200 - (analytics.charts.monthlyRevenue[0]?.revenue || 0) / Math.max(...analytics.charts.monthlyRevenue.map((m: any) => m.revenue)) * 180} ${analytics.charts.monthlyRevenue.map((item: any, idx: number) => {
                  const x = (idx / (analytics.charts.monthlyRevenue.length - 1)) * 400;
                  const y = 200 - (item.revenue / Math.max(...analytics.charts.monthlyRevenue.map((m: any) => m.revenue))) * 180;
                  return `L ${x} ${y}`;
                }).join(' ')}`}
                fill="none"
                stroke="#059467"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-in slide-in-from-left duration-1000"
              />
              
              {/* Data points */}
              {analytics.charts.monthlyRevenue.map((item: any, idx: number) => {
                const x = (idx / (analytics.charts.monthlyRevenue.length - 1)) * 400;
                const y = 200 - (item.revenue / Math.max(...analytics.charts.monthlyRevenue.map((m: any) => m.revenue))) * 180;
                return (
                  <g key={idx}>
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#059467"
                      className="animate-in zoom-in duration-500"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="#059467"
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
              {analytics.charts.monthlyRevenue.map((item: any, idx: number) => (
                <span key={idx}>{item.month.split(' ')[0]}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Donut Chart */}
        <div className="bg-white dark:bg-[#1a2c26] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="text-[#059467]" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Booking Distribution</h3>
          </div>
          <div className="flex items-center justify-center h-64">
            {/* Donut Chart */}
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {(() => {
                  const total = (Object.values(analytics.charts.bookingsByStatus) as number[]).reduce((a, b) => a + b, 0);
                  let currentAngle = 0;
                  const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
                  
                  return Object.entries(analytics.charts.bookingsByStatus).map(([status, count]: [string, any], idx) => {
                    const angle = ((count / total) * 360) || 0;
                    const startAngle = currentAngle;
                    currentAngle += angle;
                    
                    const radius = 40;
                    const innerRadius = 28;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (currentAngle * Math.PI) / 180;
                    
                    const x1 = 50 + radius * Math.cos(startRad);
                    const y1 = 50 + radius * Math.sin(startRad);
                    const x2 = 50 + radius * Math.cos(endRad);
                    const y2 = 50 + radius * Math.sin(endRad);
                    
                    const x3 = 50 + innerRadius * Math.cos(endRad);
                    const y3 = 50 + innerRadius * Math.sin(endRad);
                    const x4 = 50 + innerRadius * Math.cos(startRad);
                    const y4 = 50 + innerRadius * Math.sin(startRad);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    return (
                      <path
                        key={status}
                        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                        fill={colors[idx % colors.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer animate-in zoom-in duration-500"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      />
                    );
                  });
                })()}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {(Object.values(analytics.charts.bookingsByStatus) as number[]).reduce((a, b) => a + b, 0)}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
              </div>
            </div>
            
            {/* Legend */}
            <div className="ml-8 space-y-2">
              {Object.entries(analytics.charts.bookingsByStatus).map(([status, count]: [string, any], idx) => {
                const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse" 
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 capitalize">
                      {status}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white ml-auto">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Gear */}
      <div className="bg-white dark:bg-[#1a2c26] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <Star className="text-amber-500 fill-amber-500" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Top Performing Gear</h3>
        </div>
        <div className="space-y-4">
          {analytics.charts.topGear.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <img src={item.gear.images?.[0]} className="w-full h-full object-cover" alt={item.gear.title} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 dark:text-white">{item.gear.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">{item.bookings} bookings</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#059467]">{formatNPR(item.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Revenue */}
      <div className="bg-white dark:bg-[#1a2c26] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <Package className="text-[#059467]" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Revenue by Category</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.charts.categoryRevenue.map((item: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{item.category}</p>
              <p className="text-2xl font-black text-[#059467]">{formatNPR(item.revenue)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend, color }: any) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10',
    blue: 'bg-blue-50 dark:bg-blue-500/10',
    purple: 'bg-purple-50 dark:bg-purple-500/10',
    amber: 'bg-amber-50 dark:bg-amber-500/10'
  };

  return (
    <div className={`${colorClasses[color] || colorClasses.emerald} p-6 rounded-2xl border border-white/50 dark:border-white/5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white dark:bg-[#1a2c26] rounded-xl shadow-sm">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{trend}</span>
        )}
      </div>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-blue-500',
    active: 'bg-emerald-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  };
  return colors[status] || 'bg-slate-500';
}

/* Rentals Tab Component */
function RentalsTab({ rentals, router }: any) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusTabs = [
    { id: 'all', label: 'All Orders', count: rentals.length },
    { id: 'pending', label: 'Pending', count: rentals.filter((r: any) => r.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: rentals.filter((r: any) => r.status === 'confirmed').length },
    { id: 'picked_up', label: 'Picked Up', count: rentals.filter((r: any) => r.status === 'picked_up').length },
    { id: 'returned', label: 'Returned', count: rentals.filter((r: any) => r.status === 'returned').length },
    { id: 'completed', label: 'Completed', count: rentals.filter((r: any) => r.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: rentals.filter((r: any) => r.status === 'cancelled').length },
  ];

  const filteredRentals = statusFilter === 'all' 
    ? rentals 
    : rentals.filter((r: any) => r.status === statusFilter);

  return (
    <div className="animate-slideUp space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <ShoppingBag className="text-[#059467]" /> Orders Management
        </h2>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-2 border border-slate-100 dark:border-white/5 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#059467] text-white shadow-lg shadow-[#059467]/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                statusFilter === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredRentals.length > 0 ? (
        <div className="grid gap-4">
          {filteredRentals.map((rental: any) => (
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
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter ${getStatusBadgeColor(rental.status)}`}>
                    {rental.status.replace('_', ' ')}
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
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {statusFilter === 'all' ? 'No orders found' : `No ${statusFilter.replace('_', ' ')} orders`}
          </h3>
          <p className="text-slate-600 dark:text-slate-500">
            {statusFilter === 'all' 
              ? 'Your gear is ready for its first booking.' 
              : `No orders with ${statusFilter.replace('_', ' ')} status.`}
          </p>
        </div>
      )}
    </div>
  );
}

function getStatusBadgeColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    confirmed: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    picked_up: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    in_use: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    returned: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    completed: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    cancelled: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  };
  return colors[status] || 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400';
}

/* Inventory Grid Component */
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
