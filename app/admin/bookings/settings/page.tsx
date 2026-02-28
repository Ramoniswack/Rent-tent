'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import Toast from '../../../../components/Toast';
import { useAuth } from '../../../../hooks/useAuth';
import { Settings, Save, Loader2, Percent, DollarSign, Calendar, Shield } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BookingSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [settings, setSettings] = useState({
    platformCommission: {
      enabled: true,
      rate: 10,
      description: 'Platform commission deducted from each completed booking'
    },
    bookingPolicies: {
      cancellationWindow: 24,
      depositPercentage: 20,
      lateFeePerDay: 50,
      maxBookingDays: 30,
      minBookingDays: 1
    },
    paymentSettings: {
      acceptCash: true,
      acceptOnline: true,
      requireDeposit: true,
      autoRefundDeposit: true
    },
    bookingTexts: {
      pickupInstructions: 'Please arrive 15 minutes before your scheduled pickup time. Bring a valid ID and payment confirmation.',
      returnInstructions: 'Return the item in the same condition as received. Late returns will incur additional fees.',
      termsAndPolicies: 'By booking this item, you agree to our terms of service and rental policies.',
      lateReturnPolicy: 'Late returns are subject to a penalty fee per day as specified in your booking.',
      protectionPlanActive: 'Full coverage for damage, theft, and loss during the rental period.',
      protectionPlanInactive: 'No protection coverage for this rental. You are responsible for any damage or loss.',
      cancellationPolicy: 'Free cancellation until the deadline specified in your booking. Cancellation fee applies after the deadline.',
      cancellationFeeNote: 'Cancellation fee is calculated as a percentage of the total booking amount.'
    }
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.isAdmin) {
      router.push('/');
      return;
    }

    fetchSettings();
  }, [user, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch platform commission settings
      const commissionRes = await fetch(`${API_BASE_URL}/admin/settings/platformCommission`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (commissionRes.ok) {
        const commissionData = await commissionRes.json();
        setSettings(prev => ({
          ...prev,
          platformCommission: commissionData.settingValue || prev.platformCommission
        }));
      }

      // Fetch booking policies
      const policiesRes = await fetch(`${API_BASE_URL}/admin/settings/bookingPolicies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setSettings(prev => ({
          ...prev,
          bookingPolicies: policiesData.settingValue || prev.bookingPolicies
        }));
      }

      // Fetch payment settings
      const paymentRes = await fetch(`${API_BASE_URL}/admin/settings/paymentSettings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        setSettings(prev => ({
          ...prev,
          paymentSettings: paymentData.settingValue || prev.paymentSettings
        }));
      }

      // Fetch booking texts
      const textsRes = await fetch(`${API_BASE_URL}/admin/settings/bookingTexts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (textsRes.ok) {
        const textsData = await textsRes.json();
        setSettings(prev => ({
          ...prev,
          bookingTexts: textsData.settingValue || prev.bookingTexts
        }));
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      // Save platform commission
      await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settingKey: 'platformCommission',
          settingValue: settings.platformCommission,
          description: 'Platform commission configuration'
        })
      });

      // Save booking policies
      await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settingKey: 'bookingPolicies',
          settingValue: settings.bookingPolicies,
          description: 'Booking policies and rules'
        })
      });

      // Save payment settings
      await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settingKey: 'paymentSettings',
          settingValue: settings.paymentSettings,
          description: 'Payment and deposit settings'
        })
      });

      // Save booking texts
      await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settingKey: 'bookingTexts',
          settingValue: settings.bookingTexts,
          description: 'Dynamic text content for booking pages'
        })
      });

      setToast({ message: 'Settings saved successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1713] pb-20">
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <Settings className="w-8 h-8 text-[#059467]" />
              Booking Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Configure platform commission, booking policies, and payment settings
            </p>
          </div>

          {/* Platform Commission */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#059467]" />
              Platform Commission
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platformCommission.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      platformCommission: {
                        ...settings.platformCommission,
                        enabled: e.target.checked
                      }
                    })}
                    className="w-5 h-5 text-[#059467] rounded focus:ring-[#059467]"
                  />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Enable Commission System
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.platformCommission.rate}
                  onChange={(e) => setSettings({
                    ...settings,
                    platformCommission: {
                      ...settings.platformCommission,
                      rate: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Example: 10% means NPR 100 commission on NPR 1,000 booking
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={settings.platformCommission.description}
                  onChange={(e) => setSettings({
                    ...settings,
                    platformCommission: {
                      ...settings.platformCommission,
                      description: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Booking Policies */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#059467]" />
              Booking Policies
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Cancellation Window (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.bookingPolicies.cancellationWindow}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingPolicies: {
                      ...settings.bookingPolicies,
                      cancellationWindow: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Deposit Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.bookingPolicies.depositPercentage}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingPolicies: {
                      ...settings.bookingPolicies,
                      depositPercentage: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Late Fee Per Day (NPR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.bookingPolicies.lateFeePerDay}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingPolicies: {
                      ...settings.bookingPolicies,
                      lateFeePerDay: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Max Booking Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.bookingPolicies.maxBookingDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingPolicies: {
                      ...settings.bookingPolicies,
                      maxBookingDays: parseInt(e.target.value) || 1
                    }
                  })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Min Booking Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.bookingPolicies.minBookingDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingPolicies: {
                      ...settings.bookingPolicies,
                      minBookingDays: parseInt(e.target.value) || 1
                    }
                  })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#059467]" />
              Payment Settings
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentSettings.acceptCash}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentSettings: {
                      ...settings.paymentSettings,
                      acceptCash: e.target.checked
                    }
                  })}
                  className="w-5 h-5 text-[#059467] rounded focus:ring-[#059467]"
                />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Accept Cash Payments
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentSettings.acceptOnline}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentSettings: {
                      ...settings.paymentSettings,
                      acceptOnline: e.target.checked
                    }
                  })}
                  className="w-5 h-5 text-[#059467] rounded focus:ring-[#059467]"
                />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Accept Online Payments
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentSettings.requireDeposit}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentSettings: {
                      ...settings.paymentSettings,
                      requireDeposit: e.target.checked
                    }
                  })}
                  className="w-5 h-5 text-[#059467] rounded focus:ring-[#059467]"
                />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Require Security Deposit
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentSettings.autoRefundDeposit}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentSettings: {
                      ...settings.paymentSettings,
                      autoRefundDeposit: e.target.checked
                    }
                  })}
                  className="w-5 h-5 text-[#059467] rounded focus:ring-[#059467]"
                />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Auto-Refund Deposit After Completion
                </span>
              </label>
            </div>
          </div>

          {/* Booking Texts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#059467]" />
              Booking Page Text Content
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Customize all text content displayed on booking detail pages
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pickup Instructions
                </label>
                <textarea
                  value={settings.bookingTexts.pickupInstructions}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingTexts: {
                      ...settings.bookingTexts,
                      pickupInstructions: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="Instructions for renters when picking up gear..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Return Instructions
                </label>
                <textarea
                  value={settings.bookingTexts.returnInstructions}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingTexts: {
                      ...settings.bookingTexts,
                      returnInstructions: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="Instructions for returning gear..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Terms & Policies
                </label>
                <textarea
                  value={settings.bookingTexts.termsAndPolicies}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingTexts: {
                      ...settings.bookingTexts,
                      termsAndPolicies: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="General terms and policies..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Late Return Policy Text
                </label>
                <textarea
                  value={settings.bookingTexts.lateReturnPolicy}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingTexts: {
                      ...settings.bookingTexts,
                      lateReturnPolicy: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="Late return policy description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Protection Plan Active Message
                </label>
                <textarea
                  value={settings.bookingTexts.protectionPlanActive}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingTexts: {
                      ...settings.bookingTexts,
                      protectionPlanActive: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="Message when protection plan is active..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Protection Plan Inactive Message
                </label>
                <textarea
                  value={settings.bookingTexts.protectionPlanInactive}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingTexts: {
                      ...settings.bookingTexts,
                      protectionPlanInactive: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="Message when protection plan is not active..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Cancellation Policy
                </label>
                <textarea
                  value={settings.bookingTexts.cancellationPolicy}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingTexts: {
                      ...settings.bookingTexts,
                      cancellationPolicy: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="Cancellation policy description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Cancellation Fee Note
                </label>
                <textarea
                  value={settings.bookingTexts.cancellationFeeNote}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingTexts: {
                      ...settings.bookingTexts,
                      cancellationFeeNote: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="Additional note about cancellation fees..."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Settings</>
              )}
            </button>
          </div>
        </main>
      </div>
      <Footer />

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
