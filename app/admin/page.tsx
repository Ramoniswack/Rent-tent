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
  AlertCircle
} from 'lucide-react';

type Tab = 'overview' | 'users' | 'trips' | 'gear';

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
      // Silently redirect to login if not authenticated
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

  const handleDeleteUser = async (id: string) => {
    showConfirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This will permanently delete all their trips, gear listings, and associated data. This action cannot be undone.',
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
      message: 'Are you sure you want to delete this trip? This will permanently remove the trip and all associated data including itinerary, expenses, and packing lists.',
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
      message: 'Are you sure you want to delete this gear listing? This will permanently remove the listing and all associated bookings and reviews.',
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

  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-[#059467]" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#0d1c17] mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600">
              Manage users, trips, and gear rentals
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-[#059467] text-[#059467]'
                  : 'border-transparent text-slate-600 hover:text-[#059467]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
                activeTab === 'users'
                  ? 'border-[#059467] text-[#059467]'
                  : 'border-transparent text-slate-600 hover:text-[#059467]'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
                activeTab === 'trips'
                  ? 'border-[#059467] text-[#059467]'
                  : 'border-transparent text-slate-600 hover:text-[#059467]'
              }`}
            >
              Trips
            </button>
            <button
              onClick={() => setActiveTab('gear')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
                activeTab === 'gear'
                  ? 'border-[#059467] text-[#059467]'
                  : 'border-transparent text-slate-600 hover:text-[#059467]'
              }`}
            >
              Gear
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-3xl font-black text-[#0d1c17] mb-1">
                  {stats.totalUsers}
                </h3>
                <p className="text-slate-600 text-sm">Total Users</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <MapPin className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-[#0d1c17] mb-1">
                  {stats.totalTrips}
                </h3>
                <p className="text-slate-600 text-sm">Total Trips</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-3xl font-black text-[#0d1c17] mb-1">
                  {stats.totalGear}
                </h3>
                <p className="text-slate-600 text-sm">Total Gear</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-[#059467]" />
                </div>
                <h3 className="text-3xl font-black text-[#0d1c17] mb-1">
                  {stats.activeGear}
                </h3>
                <p className="text-slate-600 text-sm">Active Gear</p>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={usersSearch}
                    onChange={(e) => {
                      setUsersSearch(e.target.value);
                      setUsersPage(1);
                    }}
                    placeholder="Search users..."
                    className="w-full h-12 bg-slate-100 border-none rounded-xl pl-12 pr-4 text-base"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Username</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Admin</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Joined</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-[#0d1c17]">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.username || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {user.isAdmin && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-[#059467]/10 text-[#059467]">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title={user.isAdmin ? 'Remove admin' : 'Make admin'}
                            >
                              {user.isAdmin ? (
                                <ShieldOff className="w-4 h-4 text-orange-500" />
                              ) : (
                                <Shield className="w-4 h-4 text-[#059467]" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersPagination && usersPagination.pages > 1 && (
                <div className="p-6 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Page {usersPagination.page} of {usersPagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                      disabled={usersPage === 1}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setUsersPage(p => Math.min(usersPagination.pages, p + 1))}
                      disabled={usersPage === usersPagination.pages}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={tripsSearch}
                    onChange={(e) => {
                      setTripsSearch(e.target.value);
                      setTripsPage(1);
                    }}
                    placeholder="Search trips..."
                    className="w-full h-12 bg-slate-100 border-none rounded-xl pl-12 pr-4 text-base"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Destination</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Owner</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Dates</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {trips.map((trip) => (
                      <tr key={trip._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-[#0d1c17]">
                          {trip.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {trip.destination}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {trip.userId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            trip.isPublic 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {trip.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteTrip(trip._id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete trip"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {tripsPagination && tripsPagination.pages > 1 && (
                <div className="p-6 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Page {tripsPagination.page} of {tripsPagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTripsPage(p => Math.max(1, p - 1))}
                      disabled={tripsPage === 1}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setTripsPage(p => Math.min(tripsPagination.pages, p + 1))}
                      disabled={tripsPage === tripsPagination.pages}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gear Tab */}
          {activeTab === 'gear' && (
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={gearSearch}
                    onChange={(e) => {
                      setGearSearch(e.target.value);
                      setGearPage(1);
                    }}
                    placeholder="Search gear..."
                    className="w-full h-12 bg-slate-100 border-none rounded-xl pl-12 pr-4 text-base"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Owner</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Price/Day</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {gear.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-[#0d1c17]">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.owner?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.currency} {item.pricePerDay}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleGearAvailability(item._id, item.available)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                              item.available 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } transition-colors`}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteGear(item._id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete gear"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {gearPagination && gearPagination.pages > 1 && (
                <div className="p-6 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Page {gearPagination.page} of {gearPagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGearPage(p => Math.max(1, p - 1))}
                      disabled={gearPage === 1}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setGearPage(p => Math.min(gearPagination.pages, p + 1))}
                      disabled={gearPage === gearPagination.pages}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
