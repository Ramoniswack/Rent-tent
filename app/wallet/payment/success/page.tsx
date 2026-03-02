'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const data = searchParams.get('data');
      
      if (!data) {
        setError('Payment data not found');
        setVerifying(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wallet/esewa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment verification failed');
      }

      setVerified(true);
      setTransaction(result.transaction);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1713] pb-20">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          
          {verifying && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#059467] animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Verifying Payment
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we verify your payment with eSewa...
              </p>
            </div>
          )}

          {!verifying && verified && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Your wallet has been recharged successfully
              </p>

              {transaction && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-8 text-left">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Transaction Details
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Amount</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        NPR {transaction.amount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Transaction ID</span>
                      <span className="font-mono text-xs text-slate-900 dark:text-white">
                        {transaction.esewaDetails?.transactionUuid}
                      </span>
                    </div>
                    {transaction.esewaDetails?.refId && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Reference ID</span>
                        <span className="font-mono text-xs text-slate-900 dark:text-white">
                          {transaction.esewaDetails.refId}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Status</span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/wallet')}
                  className="px-6 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-semibold transition-all"
                >
                  View Wallet
                </button>
                <button
                  onClick={() => router.push('/rentals/dashboard')}
                  className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {!verifying && error && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                {error}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/wallet')}
                  className="px-6 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-semibold transition-all"
                >
                  Back to Wallet
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1713] pb-20">
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#059467] animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Loading Payment Details
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait...
              </p>
            </div>
          </main>
        </div>
        <Footer />
      </>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
