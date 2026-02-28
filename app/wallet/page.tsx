'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Toast from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';
import { formatNPR } from '../../lib/currency';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Package, 
  AlertCircle,
  Loader2,
  Plus,
  History,
  DollarSign
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchWalletData();
    fetchTransactions();
  }, [user, router]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch wallet');

      const data = await response.json();
      setWallet(data);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load wallet', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wallet/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err: any) {
      console.error('Failed to load transactions:', err);
    }
  };

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount);
    
    if (!amount || amount <= 0) {
      setToast({ message: 'Please enter a valid amount', type: 'error' });
      return;
    }

    if (amount < 100) {
      setToast({ message: 'Minimum recharge amount is NPR 100', type: 'error' });
      return;
    }

    try {
      setRecharging(true);
      const token = localStorage.getItem('token');
      
      // Initiate eSewa payment
      const response = await fetch(`${API_BASE_URL}/wallet/esewa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) throw new Error('Failed to initiate payment');

      const data = await response.json();

      // Create and submit form to eSewa
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.paymentUrl;

      Object.keys(data.paymentParams).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data.paymentParams[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to initiate payment', type: 'error' });
      setRecharging(false);
    }
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

  const credits = wallet?.wallet?.credits || 0;
  const commissionRate = wallet?.commissionRate || 10;
  const pendingCommission = wallet?.pendingCommission || 0;
  const activeGearCount = wallet?.activeGearCount || 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1713] pb-20">
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Seller Wallet
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your credits and listing fees
            </p>
          </div>

          {/* Warning if low balance */}
          {credits < pendingCommission && pendingCommission > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                  Low Balance Warning
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Your current balance ({formatNPR(credits)}) is less than your pending commission ({formatNPR(pendingCommission)}). 
                  Please recharge to ensure smooth transactions.
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Current Balance */}
            <div className="bg-gradient-to-br from-[#059467] to-[#047854] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="w-8 h-8" />
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Recharge
                </button>
              </div>
              <p className="text-sm opacity-90 mb-1">Current Balance</p>
              <p className="text-3xl font-bold">{formatNPR(credits)}</p>
            </div>

            {/* Active Listings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-[#059467]" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Listings</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeGearCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Active gear items
              </p>
            </div>

            {/* Pending Commission */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-[#059467]" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending Commission</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatNPR(pendingCommission)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {commissionRate}% on active bookings
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#059467]" />
              How Platform Commission Works
            </h2>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>• Platform charges <strong>{commissionRate}% commission</strong> on each completed booking</p>
              <p>• Commission is automatically deducted from your wallet when a booking is completed</p>
              <p>• No monthly listing fees - you only pay when you earn</p>
              <p>• Keep sufficient balance to cover pending commissions</p>
              <p>• New sellers get <strong>{formatNPR(500)} free trial credits</strong></p>
              <p>• Example: If a booking is {formatNPR(1000)}, commission is {formatNPR(1000 * commissionRate / 100)}</p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-[#059467]" />
              Transaction History
            </h2>
            
            {transactions.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction: any) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {transaction.description}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                        {transaction.esewaDetails?.refId && (
                          <span className="ml-2">• Ref: {transaction.esewaDetails.refId}</span>
                        )}
                        {transaction.metadata?.commissionRate && (
                          <span className="ml-2">• Rate: {transaction.metadata.commissionRate}%</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`font-bold ${
                        transaction.type === 'recharge' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'recharge' ? '+' : '-'}{formatNPR(transaction.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transaction.status === 'completed' && (
                          <span className="text-green-600">✓ Completed</span>
                        )}
                        {transaction.status === 'pending' && (
                          <span className="text-amber-600">⏳ Pending</span>
                        )}
                        {transaction.status === 'failed' && (
                          <span className="text-red-600">✗ Failed</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#059467]" />
              Recharge Wallet
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Amount (NPR)
              </label>
              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="Enter amount (min. 100)"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
              
              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[500, 1000, 2000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setRechargeAmount(amount.toString())}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-[#059467] hover:text-white rounded-lg text-sm font-semibold transition-all"
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💳 You will be redirected to eSewa for secure payment
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRechargeModal(false);
                  setRechargeAmount('');
                }}
                className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRecharge}
                disabled={recharging}
                className="flex-1 px-4 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {recharging ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                ) : (
                  <><DollarSign className="w-4 h-4" /> Pay with eSewa</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
