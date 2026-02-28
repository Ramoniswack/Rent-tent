'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../hooks/useAuth';
import Toast from '../../../components/Toast';
import {
  TrendingUp, DollarSign, Wallet, Users, Package, Calendar,
  ArrowUp, ArrowDown, Loader2, Download, Shield, LayoutDashboard,
  MapPin, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { formatNPR } from '../../../lib/currency';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Tab = 'overview' | 'users' | 'trips' | 'gear' | 'pages' | 'analytics';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab] = useState<Tab>('analytics');
  const [transactionsPage, setTransactionsPage] = useState(1);
  const transactionsPerPage = 50;
  
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    commissionRevenue: 0,
    walletRecharges: 0,
    totalBookings: 0,
    completedBookings: 0,
    activeBookings: 0,
    totalUsers: 0,
    totalGear: 0,
    revenueGrowth: 0,
    bookingsGrowth: 0,
    recentTransactions: [],
    monthlyRevenue: []
  });

  useEffect(() => {
    if (!user) return; // Wait for user to load
    
    if (!user.isAdmin) {
      router.push('/');
    } else {
      fetchAnalytics();
    }
  }, [user?.isAdmin]); // Only depend on admin status, not the whole user object

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setToast({ message: 'Failed to load analytics data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === 'analytics') return;
    router.push(`/admin?tab=${tab}`);
  };

  const exportReport = () => {
    setToast({ message: 'Exporting revenue report...', type: 'success' });
    // TODO: Implement CSV/PDF export
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1713] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#059467] animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

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
                  Revenue Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Platform revenue, commissions, and financial insights
                </p>
              </div>
              
              <button
                onClick={exportReport}
                className="flex items-center justify-center gap-2 bg-[#059467] hover:bg-[#047854] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-[#059467]/20 hover:-translate-y-0.5 text-sm"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in duration-500">
              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 group transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                  {analytics.revenueGrowth > 0 ? (
                    <div className="flex items-center gap-1 text-emerald-500 text-sm font-semibold">
                      <ArrowUp className="w-4 h-4" />
                      {analytics.revenueGrowth}%
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                      <ArrowDown className="w-4 h-4" />
                      {Math.abs(analytics.revenueGrowth)}%
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  {formatNPR(analytics.totalRevenue)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Revenue</p>
              </div>

              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 group transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  {formatNPR(analytics.commissionRevenue)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Commission Earned</p>
              </div>

              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 group transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                    <Wallet className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  {formatNPR(analytics.walletRecharges)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Wallet Recharges</p>
              </div>

              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 group transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-orange-500" />
                  </div>
                  {analytics.bookingsGrowth > 0 ? (
                    <div className="flex items-center gap-1 text-emerald-500 text-sm font-semibold">
                      <ArrowUp className="w-4 h-4" />
                      {analytics.bookingsGrowth}%
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                      <ArrowDown className="w-4 h-4" />
                      {Math.abs(analytics.bookingsGrowth)}%
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  {analytics.totalBookings}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Bookings</p>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Completed</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics.completedBookings}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Active</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics.activeBookings}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Users</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics.totalUsers}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Package className="w-5 h-5 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Gear Items</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics.totalGear}
                </p>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Monthly Revenue Trend
            </h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.monthlyRevenue.length > 0 ? (
                analytics.monthlyRevenue.map((month: any, i: number) => {
                  const maxRevenue = Math.max(...analytics.monthlyRevenue.map((m: any) => m.revenue));
                  const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative group">
                        <div 
                          className="w-full bg-[#059467]/20 hover:bg-[#059467] rounded-t-lg transition-all cursor-pointer"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        >
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                            {formatNPR(month.revenue)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {month.month}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No revenue data available
                </div>
              )}
            </div>
          </div>

            {/* Recent Transactions */}
            <div className="bg-white/80 dark:bg-[#132a24]/80 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    All Transactions
                  </h2>
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Total: {analytics.recentTransactions.length}
                  </div>
                </div>
              </div>
              
              {analytics.recentTransactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-black/10 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                          <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Date</th>
                          <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Type</th>
                          <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">User</th>
                          <th className="px-6 sm:px-8 py-5 text-left whitespace-nowrap">Description</th>
                          <th className="px-6 sm:px-8 py-5 text-right whitespace-nowrap">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {analytics.recentTransactions
                          .slice((transactionsPage - 1) * transactionsPerPage, transactionsPage * transactionsPerPage)
                          .map((transaction: any, i: number) => (
                          <tr key={i} className="group hover:bg-slate-50/80 dark:hover:bg-black/10 transition-colors">
                            <td className="px-6 sm:px-8 py-5 text-sm font-medium text-slate-900 dark:text-white">
                              {new Date(transaction.date).toLocaleDateString('en-US', { 
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 sm:px-8 py-5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                transaction.type === 'commission' 
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                              }`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-6 sm:px-8 py-5 text-sm font-bold text-slate-700 dark:text-slate-300">
                              {transaction.userName || 'N/A'}
                            </td>
                            <td className="px-6 sm:px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                              {transaction.description || '-'}
                            </td>
                            <td className="px-6 sm:px-8 py-5 text-sm font-black text-right text-slate-900 dark:text-white">
                              {formatNPR(transaction.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="p-6 sm:p-8 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-black/10 mt-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Page {transactionsPage} of {Math.ceil(analytics.recentTransactions.length / transactionsPerPage)}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setTransactionsPage(p => Math.max(1, p - 1))}
                        disabled={transactionsPage === 1}
                        className="p-2.5 bg-white dark:bg-[#132a24] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#059467] hover:border-[#059467] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-[#132a24] disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setTransactionsPage(p => p + 1)}
                        disabled={transactionsPage >= Math.ceil(analytics.recentTransactions.length / transactionsPerPage)}
                        className="p-2.5 bg-white dark:bg-[#132a24] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#059467] hover:border-[#059467] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-[#132a24] disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No transactions yet
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx global>{`
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
