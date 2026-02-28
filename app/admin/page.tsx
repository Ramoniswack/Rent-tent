'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../hooks/useToast';
import { adminAPI, userAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  Users, MapPin, Package, Loader2, Search, Trash2, Shield, 
  ShieldOff, ChevronLeft, ChevronRight, AlertCircle, LayoutDashboard, 
  FileText, Plus, Edit, ExternalLink, Calendar, Settings, TrendingUp
} from 'lucide-react';

type Tab = 'overview' | 'users' | 'trips' | 'gear' | 'pages' | 'analytics';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showConfirm, showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  // Overview stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalGear: 0,
    activeGear: 0
  });

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState<any>(null);
  const [usersSearch, setUsersSearch] = useState('');

  // Trips
  const [trips, setTrips] = useState<any[]>([]);
  const [tripsPage, setTripsPage] = useState(1);
  const [tripsPagination, setTripsPagination] = useState<any>(null);
  const [tripsSearch, setTripsSearch] = useState('');

  // Gear
  const [gear, setGear] = useState<any[]>([]);
  const [gearPage, setGearPage] = useState(1);
  const [gearPagination, setGearPagination] = useState<any>(null);
  const [gearSearch, setGearSearch] = useState('');

  // Pages
  const [pages, setPages] = useState<any[]>([]);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [pageForm, setPageForm] = useState({
    slug: '',
    title: '',
    content: '',
    metaDescription: '',
    isPublished: true,
    pageType: 'custom' as 'home' | 'about' | 'contact' | 'custom'
  });

  // Check admin status and read tab from URL
  useEffect(() => {
    checkAdminStatus();
    const tabParam = searchParams.get('tab') as Tab;
    if (tabParam && ['overview', 'users', 'trips', 'gear', 'pages', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const checkAdminStatus = async () => {
    try {
      const user = await userAPI.getProfile();
      if (!user || !user.isAdmin) {
        router.push('/');
        return;
      }
      setIsAdmin(true);
      loadStats();
    } catch (err: any) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === 'analytics') {
      router.push('/admin/analytics');
      return;
    }
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers(usersPage, 20, usersSearch);
      setUsers(data.users);
      setUsersPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getTrips(tripsPage, 20, tripsSearch);
      setTrips(data.trips);
      setTripsPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadGear = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getGear(gearPage, 20, gearSearch);
      setGear(data.gear);
      setGearPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPages();
      setPages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'users') loadUsers();
  }, [isAdmin, activeTab, usersPage, usersSearch]);

  useEffect(() => {
    if (isAdmin && activeTab === 'trips') loadTrips();
  }, [isAdmin, activeTab, tripsPage, tripsSearch]);

  useEffect(() => {
    if (isAdmin && activeTab === 'gear') loadGear();
  }, [isAdmin, activeTab, gearPage, gearSearch]);

  useEffect(() => {
    if (isAdmin && activeTab === 'pages') loadPages();
  }, [isAdmin, activeTab]);

  const handleDeleteUser = async (id: string) => {
    showConfirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This will permanently delete all their trips, gear listings, and associated data.',
      confirmText: 'Delete User',
      cancelText: 'Cancel',
      type: 'error',
      onConfirm: async () => {
        try {
          await adminAPI.deleteUser(id);
          loadUsers();
          loadStats();
          showToast('User deleted successfully', 'success');
        } catch (err: any) {
          showToast(err.message || 'Failed to delete user', 'error');
        }
      }
    });
  };

  const handleToggleAdmin = async (id: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateUser(id, { isAdmin: !currentStatus });
      loadUsers();
      showToast(`User ${!currentStatus ? 'promoted to' : 'removed from'} admin successfully`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update user admin status', 'error');
    }
  };

  const handleDeleteTrip = async (id: string) => {
    showConfirm({
      title: 'Delete Trip',
      message: 'Are you sure you want to delete this trip?',
      confirmText: 'Delete Trip',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        try {
          await adminAPI.deleteTrip(id);
          loadTrips();
          loadStats();
          showToast('Trip deleted successfully', 'success');
        } catch (err: any) {
          showToast(err.message || 'Failed to delete trip', 'error');
        }
      }
    });
  };

  const handleDeleteGear = async (id: string) => {
    showConfirm({
      title: 'Delete Gear Listing',
      message: 'Are you sure you want to delete this gear listing?',
      confirmText: 'Delete Gear',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        try {
          await adminAPI.deleteGear(id);
          loadGear();
          loadStats();
          showToast('Gear listing deleted successfully', 'success');
        } catch (err: any) {
          showToast(err.message || 'Failed to delete gear listing', 'error');
        }
      }
    });
  };

  const handleToggleGearAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateGear(id, { available: !currentStatus });
      loadGear();
      showToast(`Gear listing ${!currentStatus ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update gear availability', 'error');
    }
  };

  const handleCreatePage = () => {
    setEditingPage(null);
    setPageForm({
      slug: '',
      title: '',
      content: '',
      metaDescription: '',
      isPublished: true,
      pageType: 'custom'
    });
    setShowPageModal(true);
  };

  const handleEditPage = (page: any) => {
    setEditingPage(page);
    setPageForm({
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaDescription: page.metaDescription || '',
      isPublished: page.isPublished,
      pageType: page.pageType
    });
    setShowPageModal(true);
  };

  const handleSavePage = async () => {
    try {
      if (editingPage) {
        await adminAPI.updatePage(editingPage._id, pageForm);
        showToast('Page updated successfully', 'success');
      } else {
        await adminAPI.createPage(pageForm);
        showToast('Page created successfully', 'success');
      }
      setShowPageModal(false);
      loadPages();
    } catch (err: any) {
      showToast(err.message || 'Failed to save page', 'error');
    }
  };

  const handleDeletePage = async (id: string) => {
    showConfirm({
      title: 'Delete Page',
      message: 'Are you sure you want to delete this page?',
      confirmText: 'Delete Page',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        try {
          await adminAPI.deletePage(id);
          loadPages();
          showToast('Page deleted successfully', 'success');
        } catch (err: any) {
          showToast(err.message || 'Failed to delete page', 'error');
        }
      }
    });
  };

  const handleTogglePublish = async (page: any) => {
    try {
      await adminAPI.updatePage(page._id, { isPublished: !page.isPublished });
      loadPages();
      showToast(`Page ${!page.isPublished ? 'published' : 'unpublished'} successfully`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update page', 'error');
    }
  };

  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d0b] flex flex-col relative overflow-hidden">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
            <div className="w-16 h-16 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10">
              <Loader2 className="w-8 h-8 text-[#059467] animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authenticating Admin</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Verifying your credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d0b] relative overflow-hidden pb-16">
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto relative z-10 pt-4 px-4 sm:px-6 lg:px-8 gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2.5 bg-[#059467]/10 dark:bg-[#059467]/20 rounded-xl">
                  <Shield className="w-6 h-6 text-[#059467]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Console</h2>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Workspace</p>
                </div>
              </div>
              
              <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                {[
                  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                  { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
                  { id: 'users', icon: Users, label: 'Users' },
                  { id: 'trips', icon: MapPin, label: 'Trips' },
                  { id: 'gear', icon: Package, label: 'Gear' },
                  { id: 'pages', icon: FileText, label: 'Pages' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id as Tab)}
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
          <main className="flex-1 w-full min-w-0 pb-12">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059467] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#059467]"></span>
                  </span>
                  <p className="text-xs font-bold text-[#059467] uppercase tracking-wider">Admin Mode Active</p>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
              </div>
              
              {activeTab === 'pages' && (
                <button
                  onClick={handleCreatePage}
                  className="flex items-center justify-center gap-2 bg-[#059467] hover:bg-[#047854] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-[#059467]/20 hover:-translate-y-0.5 text-sm"
                >
                  <Plus className="w-5 h-5" />
                  New Custom Page
                </button>
              )}
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Analytics Tab - Redirect to dedicated page */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                  <div className="w-16 h-16 bg-white dark:bg-[#132a24] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10">
                    <Loader2 className="w-8 h-8 text-[#059467] animate-spin" />
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Redirecting to Analytics...</p>
              </div>
            )}

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Trips', value: stats.totalTrips, icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Total Gear', value: stats.totalGear, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Available Gear', value: stats.activeGear, icon: Shield, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 group transition-all hover:-translate-y-1">
                      <div className={`p-3 rounded-2xl ${stat.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                        {stat.value.toLocaleString()}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                {/* Visual Placeholder for Activity Graph */}
                <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Platform Activity</h3>
                  <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
                    {[40, 70, 45, 90, 65, 80, 50, 85, 100, 60, 75, 55].map((h, i) => (
                      <div key={i} className="w-full bg-[#059467]/20 hover:bg-[#059467] rounded-t-lg transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                          {h}% Load
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-slate-200/50 dark:border-slate-700/50 pt-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
                  </div>
                </div>
              </div>
            )}

            {/* Common Data Table Design for Users, Trips, Gear */}
            {['users', 'trips', 'gear'].includes(activeTab) && (
              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden flex flex-col animate-in fade-in duration-500">
                <div className="p-6 sm:p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="relative group max-w-xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#059467] transition-colors w-5 h-5" />
                    <input
                      type="text"
                      value={activeTab === 'users' ? usersSearch : activeTab === 'trips' ? tripsSearch : gearSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeTab === 'users') { setUsersSearch(val); setUsersPage(1); }
                        if (activeTab === 'trips') { setTripsSearch(val); setTripsPage(1); }
                        if (activeTab === 'gear') { setGearSearch(val); setGearPage(1); }
                      }}
                      placeholder={`Search ${activeTab}...`}
                      className="w-full h-14 bg-slate-50/50 dark:bg-[#0b1713]/50 border border-slate-200 dark:border-slate-700 focus:border-[#059467] dark:focus:border-[#059467] rounded-2xl pl-14 pr-6 text-sm font-medium text-slate-900 dark:text-white transition-all outline-none focus:ring-4 focus:ring-[#059467]/10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-black/10 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                        {activeTab === 'users' && (
                          <>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Account</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Contact</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Role</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Joined</th>
                            <th className="px-6 sm:px-8 py-5 text-right whitespace-nowrap">Actions</th>
                          </>
                        )}
                        {activeTab === 'trips' && (
                          <>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Trip Details</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Owner</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Timeline</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Visibility</th>
                            <th className="px-6 sm:px-8 py-5 text-right whitespace-nowrap">Actions</th>
                          </>
                        )}
                        {activeTab === 'gear' && (
                          <>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Gear Item</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Owner</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Rate</th>
                            <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Status</th>
                            <th className="px-6 sm:px-8 py-5 text-right whitespace-nowrap">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {activeTab === 'users' && users.map((user) => (
                        <tr key={user._id} className="group hover:bg-slate-50/80 dark:hover:bg-black/10 transition-colors">
                          <td className="px-6 sm:px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#059467]/10 flex items-center justify-center font-black text-[#059467] shrink-0">
                                {user.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <button 
                                  onClick={() => router.push(`/profile/${user.username || user._id}`)}
                                  className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#059467] dark:hover:text-[#059467] transition-colors text-left truncate block w-full"
                                >
                                  {user.name}
                                </button>
                                <p className="text-xs text-slate-500 font-medium truncate">@{user.username || 'user'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 sm:px-8 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{user.email}</td>
                          <td className="px-6 sm:px-8 py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.isAdmin ? 'bg-[#059467]/10 text-[#059467]' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                              {user.isAdmin ? 'Administrator' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 sm:px-8 py-5 text-sm font-medium text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 sm:px-8 py-5">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => router.push(`/profile/${user.username || user._id}`)}
                                className="p-2 bg-white dark:bg-[#132a24] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#059467] dark:hover:text-[#059467] transition-all"
                                title="View Profile"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleToggleAdmin(user._id, user.isAdmin)} className="p-2 bg-white dark:bg-[#132a24] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#059467] dark:hover:text-[#059467] transition-all">
                                {user.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                              </button>
                              <button onClick={() => handleDeleteUser(user._id)} className="p-2 bg-white dark:bg-[#132a24] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'trips' && trips.map((trip) => (
                        <tr key={trip._id} className="group hover:bg-slate-50/80 dark:hover:bg-black/10 transition-colors">
                          <td className="px-6 sm:px-8 py-5">
                            <div>
                              <button 
                                onClick={() => router.push(trip.isPublic ? `/trips/public/${trip._id}` : `/trips/${trip._id}`)}
                                className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#059467] dark:hover:text-[#059467] transition-colors text-left"
                              >
                                {trip.title}
                              </button>
                              <div className="flex items-center gap-1 text-xs text-slate-500 font-bold mt-1">
                                <MapPin className="w-3 h-3 text-[#059467]" /> {trip.destination}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 sm:px-8 py-5">
                            <button 
                              onClick={() => trip.userId?.username && router.push(`/profile/${trip.userId.username}`)}
                              className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-[#059467] dark:hover:text-[#059467] transition-colors"
                            >
                              {trip.userId?.name || 'N/A'}
                            </button>
                          </td>
                          <td className="px-6 sm:px-8 py-5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <Calendar className="w-3.5 h-3.5 text-[#059467]" />
                              {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 sm:px-8 py-5">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${trip.isPublic ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                              {trip.isPublic ? 'Public' : 'Private'}
                            </span>
                          </td>
                          <td className="px-6 sm:px-8 py-5">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => router.push(trip.isPublic ? `/trips/public/${trip._id}` : `/trips/${trip._id}`)}
                                className="p-2 bg-white dark:bg-[#132a24] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#059467] dark:hover:text-[#059467] transition-all"
                                title="View Trip"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteTrip(trip._id)} className="p-2 bg-white dark:bg-[#132a24] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'gear' && gear.map((item) => (
                        <tr key={item._id} className="group hover:bg-slate-50/80 dark:hover:bg-black/10 transition-colors">
                          <td className="px-6 sm:px-8 py-5">
                            <button 
                              onClick={() => router.push(`/gear/${item._id}`)}
                              className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#059467] dark:hover:text-[#059467] transition-colors text-left"
                            >
                              {item.title}
                            </button>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#059467] mt-1">{item.category}</p>
                          </td>
                          <td className="px-6 sm:px-8 py-5">
                            <button 
                              onClick={() => item.owner?.username && router.push(`/profile/${item.owner.username}`)}
                              className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-[#059467] dark:hover:text-[#059467] transition-colors"
                            >
                              {item.owner?.name}
                            </button>
                          </td>
                          <td className="px-6 sm:px-8 py-5 font-black text-sm text-slate-900 dark:text-white">{item.currency} {item.pricePerDay}</td>
                          <td className="px-6 sm:px-8 py-5">
                            <button 
                              onClick={() => handleToggleGearAvailability(item._id, item.available)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${item.available ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400'}`}
                            >
                              {item.available ? 'Active' : 'Disabled'}
                            </button>
                          </td>
                          <td className="px-6 sm:px-8 py-5">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => router.push(`/gear/${item._id}`)}
                                className="p-2 bg-white dark:bg-[#132a24] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#059467] dark:hover:text-[#059467] transition-all"
                                title="View Gear"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteGear(item._id)} className="p-2 bg-white dark:bg-[#132a24] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Unified Pagination */}
                <div className="p-6 sm:p-8 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-black/10 mt-auto">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Page {activeTab === 'users' ? usersPage : activeTab === 'trips' ? tripsPage : gearPage}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (activeTab === 'users') setUsersPage(p => Math.max(1, p - 1));
                        if (activeTab === 'trips') setTripsPage(p => Math.max(1, p - 1));
                        if (activeTab === 'gear') setGearPage(p => Math.max(1, p - 1));
                      }}
                      className="p-2.5 bg-white dark:bg-[#132a24] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#059467] hover:border-[#059467] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-[#132a24] disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (activeTab === 'users') setUsersPage(p => p + 1);
                        if (activeTab === 'trips') setTripsPage(p => p + 1);
                        if (activeTab === 'gear') setGearPage(p => p + 1);
                      }}
                      className="p-2.5 bg-white dark:bg-[#132a24] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#059467] hover:border-[#059467] hover:text-white transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pages Tab Section */}
            {activeTab === 'pages' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                
                {/* System Pages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Page Editor */}
                  <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-purple-500/20" />
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6">
                        <LayoutDashboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Home Page</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8">Customize hero, features, CTA banner, and testimonials sections</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/pages/home/edit')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Home Page
                    </button>
                  </div>

                  {/* About Page Editor */}
                  <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#059467]/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-[#059467]/20" />
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-[#059467]/10 flex items-center justify-center mb-6">
                        <Users className="w-6 h-6 text-[#059467]" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">About Page</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8">Fully customizable About page with hero, values, team, and CTA sections</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/pages/about/edit')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit About Page
                    </button>
                  </div>

                  {/* Contact Page Editor */}
                  <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-blue-500/20" />
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6">
                        <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Contact Page</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8">Manage contact information, form topics, map location, and social links</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/pages/contact/edit')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Contact Page
                    </button>
                  </div>

                  {/* Profile Field Options */}
                  <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-orange-500/20" />
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-6">
                        <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Profile Field Options</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8">Manage options for Interests, Vibe (Travel Styles), and Languages Spoken</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/profile-fields')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Profile Fields
                    </button>
                  </div>

                  {/* Booking Settings */}
                  <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-purple-500/20" />
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6">
                        <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Booking Settings</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8">Configure commission rates, booking policies, and payment settings</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/bookings/settings')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Booking Settings
                    </button>
                  </div>
                </div>

                {/* Site Settings Banner */}
                <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Site Settings</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium pl-14">Configure service fees, platform name, and other global settings</p>
                  </div>
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="shrink-0 flex items-center justify-center gap-2 px-8 py-4 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm relative z-10"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Global Settings
                  </button>
                </div>

                {/* Custom Pages Grid */}
                {pages.length > 0 && (
                  <>
                    <div className="pt-8 pb-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">Custom Pages</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((page) => (
                      <div key={page._id} className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 group hover:border-[#059467]/30 transition-all flex flex-col h-full">
                        <div className="flex items-start justify-between mb-5">
                          <div className="size-10 rounded-xl bg-[#059467]/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#059467]" />
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => router.push(`/${page.slug}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#059467] transition-colors" title="View Page">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditPage(page)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#059467] transition-colors" title="Edit Page">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeletePage(page._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Delete Page">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => router.push(`/${page.slug}`)} className="text-left w-full">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 hover:text-[#059467] transition-colors truncate">{page.title}</h3>
                        </button>
                        <button onClick={() => router.push(`/${page.slug}`)} className="text-xs font-bold text-[#059467] mb-3 hover:underline text-left block w-full truncate">
                          /{page.slug}
                        </button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6 flex-1">
                          {page.metaDescription || "No SEO description set for this page."}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${page.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                            {page.isPublished ? 'Live' : 'Draft'}
                          </span>
                          <button onClick={() => handleTogglePublish(page)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#059467] transition-colors">
                            {page.isPublished ? 'Unpublish' : 'Publish Now'}
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modern Glass Modal Update */}
      {showPageModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-[#060d0b]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-[#132a24]/95 backdrop-blur-2xl rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 flex flex-col">
            <div className="p-8 border-b border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {editingPage ? 'Refine Page' : 'Architect Page'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Configure metadata and layout content</p>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Page Blueprint</label>
                  <select
                    value={pageForm.pageType}
                    onChange={(e) => setPageForm({ ...pageForm, pageType: e.target.value as any })}
                    disabled={!!editingPage}
                    className="w-full h-12 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#059467]/50 focus:border-[#059467] disabled:opacity-50"
                  >
                    <option value="home">Home Page</option>
                    <option value="about">About Page</option>
                    <option value="contact">Contact Page</option>
                    <option value="custom">Custom Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Route Slug</label>
                  <input
                    type="text"
                    value={pageForm.slug}
                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                    disabled={!!editingPage}
                    placeholder="e.g. adventure-guide"
                    className="w-full h-12 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#059467]/50 focus:border-[#059467] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Display Title</label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  placeholder="The Ultimate Expedition"
                  className="w-full h-12 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#059467]/50 focus:border-[#059467]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Core Content (Markdown/HTML)</label>
                <textarea
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  placeholder="Describe the journey..."
                  rows={5}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#059467]/50 focus:border-[#059467] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={pageForm.isPublished}
                  onChange={(e) => setPageForm({ ...pageForm, isPublished: e.target.checked })}
                  className="w-5 h-5 rounded-md border-slate-300 text-[#059467] focus:ring-[#059467] cursor-pointer"
                />
                <label htmlFor="isPublished" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Go live immediately after saving
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 flex gap-3 bg-slate-50/30 dark:bg-black/5">
              <button
                onClick={() => setShowPageModal(false)}
                className="flex-1 h-12 bg-white dark:bg-[#132a24] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={handleSavePage}
                className="flex-1 h-12 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-bold text-sm shadow-md shadow-[#059467]/20 transition-all"
              >
                {editingPage ? 'Save Revision' : 'Confirm Page'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        /* Custom sleek scrollbar for modals/tables */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}