'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../hooks/useToast';
import { adminAPI, userAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  Users,
  MapPin,
  Package,
  Loader2,
  Search,
  Trash2,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LayoutDashboard,
  FileText,
  Plus,
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  MoreVertical,
  Calendar,
  Settings
} from 'lucide-react';

type Tab = 'overview' | 'users' | 'trips' | 'gear' | 'pages';

export default function AdminPage() {
  const router = useRouter();
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

  // Check admin status
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const user = await userAPI.getProfile();
      if (!user || !user.isAdmin) {
        router.push('/dashboard');
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
    if (isAdmin && activeTab === 'users') {
      loadUsers();
    }
  }, [isAdmin, activeTab, usersPage, usersSearch]);

  useEffect(() => {
    if (isAdmin && activeTab === 'trips') {
      loadTrips();
    }
  }, [isAdmin, activeTab, tripsPage, tripsSearch]);

  useEffect(() => {
    if (isAdmin && activeTab === 'gear') {
      loadGear();
    }
  }, [isAdmin, activeTab, gearPage, gearSearch]);

  useEffect(() => {
    if (isAdmin && activeTab === 'pages') {
      loadPages();
    }
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b1713]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#059467]" />
          <p className="text-slate-500 font-bold animate-pulse">Authenticating Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1713]">
        <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 bg-white dark:bg-[#11241e] lg:min-h-[calc(100vh-80px)] border-b lg:border-r border-slate-200 dark:border-white/5 sticky top-20 z-30">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2 bg-[#059467]/10 rounded-lg">
                  <Shield className="w-6 h-6 text-[#059467]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Console</h2>
              </div>
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {[
                  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                  { id: 'users', icon: Users, label: 'Users' },
                  { id: 'trips', icon: MapPin, label: 'Trips' },
                  { id: 'gear', icon: Package, label: 'Gear' },
                  { id: 'pages', icon: FileText, label: 'Pages' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal ${
                      activeTab === item.id
                        ? 'bg-[#059467] text-white shadow-lg shadow-[#059467]/20 translate-x-1'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : ''}`} />
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <p className="font-medium">Admin Mode Active</p>
                </div>
              </div>
              {activeTab === 'pages' && (
                <button
                  onClick={handleCreatePage}
                  className="flex items-center justify-center gap-2 bg-[#059467] hover:bg-[#047a55] text-white px-6 py-4 rounded-2xl font-black transition-all shadow-xl shadow-[#059467]/20 hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  New Page
                </button>
              )}
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm font-bold text-red-600">{error}</p>
              </div>
            )}

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Trips', value: stats.totalTrips, icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Total Gear', value: stats.totalGear, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Available Gear', value: stats.activeGear, icon: Shield, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#11241e] rounded-[2rem] p-8 shadow-sm border border-slate-200 dark:border-white/5 group hover:border-[#059467]/30 transition-all">
                      <div className={`p-3 rounded-2xl ${stat.bg} w-fit mb-6 group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                        {stat.value.toLocaleString()}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                {/* Visual Placeholder for Activity Graph */}
                <div className="bg-white dark:bg-[#11241e] rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Platform Activity</h3>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[40, 70, 45, 90, 65, 80, 50, 85, 100, 60, 75, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#059467]/20 hover:bg-[#059467] rounded-t-lg transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {h}% Load
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-slate-100 dark:border-white/5 pt-4 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                    <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
                  </div>
                </div>
              </div>
            )}

            {/* Common Data Table Design for Users, Trips, Gear */}
            {['users', 'trips', 'gear'].includes(activeTab) && (
              <div className="bg-white dark:bg-[#11241e] rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
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
                      className="w-full h-14 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-[#059467] dark:focus:border-[#059467] rounded-2xl pl-14 pr-6 text-base text-slate-900 dark:text-white transition-all outline-none focus:ring-4 focus:ring-[#059467]/10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/[0.02] text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                        {activeTab === 'users' && (
                          <>
                            <th className="px-8 py-5 text-left">Account</th>
                            <th className="px-8 py-5 text-left">Contact</th>
                            <th className="px-8 py-5 text-left">Role</th>
                            <th className="px-8 py-5 text-left">Joined</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                          </>
                        )}
                        {activeTab === 'trips' && (
                          <>
                            <th className="px-8 py-5 text-left">Trip Details</th>
                            <th className="px-8 py-5 text-left">Owner</th>
                            <th className="px-8 py-5 text-left">Timeline</th>
                            <th className="px-8 py-5 text-left">Visibility</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                          </>
                        )}
                        {activeTab === 'gear' && (
                          <>
                            <th className="px-8 py-5 text-left">Gear Item</th>
                            <th className="px-8 py-5 text-left">Owner</th>
                            <th className="px-8 py-5 text-left">Rate</th>
                            <th className="px-8 py-5 text-left">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {activeTab === 'users' && users.map((user) => (
                        <tr key={user._id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-[#059467]">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">@{user.username || 'user'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{user.email}</td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.isAdmin ? 'bg-[#059467]/10 text-[#059467]' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                              {user.isAdmin ? 'Administrator' : 'User'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-8 py-5">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleToggleAdmin(user._id, user.isAdmin)} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 text-slate-500 hover:text-[#059467] transition-all">
                                 {user.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                               </button>
                               <button onClick={() => handleDeleteUser(user._id)} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 text-slate-500 hover:text-red-500 transition-all">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'trips' && trips.map((trip) => (
                        <tr key={trip._id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-5">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{trip.title}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-500 font-bold mt-1">
                                <MapPin className="w-3 h-3 text-[#059467]" /> {trip.destination}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{trip.userId?.name || 'N/A'}</p>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                               <Calendar className="w-3.5 h-3.5" />
                               {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                             </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${trip.isPublic ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                              {trip.isPublic ? 'Public' : 'Private'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button onClick={() => handleDeleteTrip(trip._id)} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'gear' && gear.map((item) => (
                        <tr key={item._id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#059467] mt-1">{item.category}</p>
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-slate-300">{item.owner?.name}</td>
                          <td className="px-8 py-5 font-black text-slate-900 dark:text-white">{item.currency} {item.pricePerDay}</td>
                          <td className="px-8 py-5">
                             <button 
                               onClick={() => handleToggleGearAvailability(item._id, item.available)}
                               className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.available ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}
                             >
                               {item.available ? 'Active' : 'Disabled'}
                             </button>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => handleDeleteGear(item._id)} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Unified Pagination */}
                <div className="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                     Page {activeTab === 'users' ? usersPage : activeTab === 'trips' ? tripsPage : gearPage}
                   </p>
                   <div className="flex gap-3">
                     <button 
                       onClick={() => {
                          if (activeTab === 'users') setUsersPage(p => Math.max(1, p - 1));
                          if (activeTab === 'trips') setTripsPage(p => Math.max(1, p - 1));
                          if (activeTab === 'gear') setGearPage(p => Math.max(1, p - 1));
                       }}
                       className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 hover:bg-[#059467] hover:text-white transition-all disabled:opacity-30"
                     >
                       <ChevronLeft className="w-5 h-5" />
                     </button>
                     <button 
                       onClick={() => {
                          if (activeTab === 'users') setUsersPage(p => p + 1);
                          if (activeTab === 'trips') setTripsPage(p => p + 1);
                          if (activeTab === 'gear') setGearPage(p => p + 1);
                       }}
                       className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 hover:bg-[#059467] hover:text-white transition-all"
                     >
                       <ChevronRight className="w-5 h-5" />
                     </button>
                   </div>
                </div>
              </div>
            )}

            {/* Pages Tab Section */}
            {activeTab === 'pages' && (
              <div className="space-y-8">
                {/* Special Home Page Editor */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-[2.5rem] p-8 border-2 border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Home Page</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Customize hero, features, CTA banner, and testimonials sections</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/pages/home/edit')}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all hover:scale-105"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Home Page
                    </button>
                  </div>
                </div>

                {/* Special About Page Editor */}
                <div className="bg-gradient-to-br from-[#059467]/10 to-emerald-500/5 rounded-[2.5rem] p-8 border-2 border-[#059467]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">About Page</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Fully customizable About page with hero, values, team, and CTA sections</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/pages/about/edit')}
                      className="flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-xl font-bold hover:bg-[#047854] transition-all hover:scale-105"
                    >
                      <Edit className="w-5 h-5" />
                      Edit About Page
                    </button>
                  </div>
                </div>

                {/* Special Contact Page Editor */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-[2.5rem] p-8 border-2 border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Contact Page</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Manage contact information, form topics, map location, and social links</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/pages/contact/edit')}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all hover:scale-105"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Contact Page
                    </button>
                  </div>
                </div>

                {/* Profile Field Options */}
                <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-[2.5rem] p-8 border-2 border-orange-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Profile Field Options</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Manage options for Interests, Vibe (Travel Styles), and Languages Spoken</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/profile-fields')}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all hover:scale-105"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Profile Fields
                    </button>
                  </div>
                </div>

                {/* Site Settings Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-[2.5rem] p-8 shadow-sm border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                          <Settings className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Site Settings</h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Configure service fees, platform name, and other global settings</p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/settings')}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all hover:scale-105"
                    >
                      <Settings className="w-5 h-5" />
                      Manage Settings
                    </button>
                  </div>
                </div>

                {/* Other Pages */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pages.map((page) => (
                  <div key={page._id} className="bg-white dark:bg-[#11241e] rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-white/5 group hover:border-[#059467]/30 transition-all flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="size-12 rounded-2xl bg-[#059467]/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#059467]" />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditPage(page)} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-[#059467]"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePage(page._id)} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{page.title}</h3>
                    <p className="text-sm font-bold text-[#059467] mb-4">/{page.slug}</p>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-8">{page.metaDescription || "No SEO description set for this page."}</p>
                    
                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${page.isPublished ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {page.isPublished ? 'Live' : 'Draft'}
                      </span>
                      <button onClick={() => handleTogglePublish(page)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#059467] transition-colors">
                         {page.isPublished ? 'Unpublish' : 'Publish Now'}
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Design Update */}
      {showPageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#11241e] rounded-[3rem] max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden border border-white/20">
            <div className="p-10 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {editingPage ? 'Refine Page' : 'Architect Page'}
              </h2>
              <p className="text-slate-500 font-medium mt-1">Configure metadata and layout content</p>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Page Blueprint</label>
                  <select
                    value={pageForm.pageType}
                    onChange={(e) => setPageForm({ ...pageForm, pageType: e.target.value as any })}
                    disabled={!!editingPage}
                    className="w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-[#059467]/10"
                  >
                    <option value="home">Home Page</option>
                    <option value="about">About Page</option>
                    <option value="contact">Contact Page</option>
                    <option value="custom">Custom Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Route Slug</label>
                  <input
                    type="text"
                    value={pageForm.slug}
                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                    disabled={!!editingPage}
                    placeholder="e.g. adventure-guide"
                    className="w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-[#059467]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Display Title</label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  placeholder="The Ultimate Expedition"
                  className="w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-[#059467]/10"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Core Content (Markdown/HTML)</label>
                <textarea
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  placeholder="Describe the journey..."
                  rows={6}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-[#059467]/10"
                />
              </div>

              <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem]">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={pageForm.isPublished}
                  onChange={(e) => setPageForm({ ...pageForm, isPublished: e.target.checked })}
                  className="w-6 h-6 rounded-lg border-slate-300 text-[#059467] focus:ring-[#059467] cursor-pointer"
                />
                <label htmlFor="isPublished" className="text-sm font-black text-slate-700 dark:text-slate-300 cursor-pointer">
                  Go live immediately after saving
                </label>
              </div>
            </div>

            <div className="p-10 border-t border-slate-100 dark:border-white/5 flex gap-4">
              <button
                onClick={() => setShowPageModal(false)}
                className="flex-1 h-16 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={handleSavePage}
                className="flex-1 h-16 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#059467]/20 transition-all"
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
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </>
  );
}