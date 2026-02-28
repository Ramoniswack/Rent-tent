'use client';

import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1713] pb-20">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Payment Failed
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Your payment was not completed. This could be due to:
            </p>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-8 text-left">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Payment was cancelled by you</li>
                <li>• Insufficient balance in your eSewa account</li>
                <li>• Session timeout</li>
                <li>• Network connectivity issues</li>
                <li>• Invalid payment details</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/wallet')}
                className="px-6 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-semibold transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/rentals/dashboard')}
                className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
