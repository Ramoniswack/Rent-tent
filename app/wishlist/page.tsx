'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Toast from '../../components/Toast';
import { wishlistAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatNPR } from '../../lib/currency';
import { getCityName } from '../../lib/location';
import { Heart, MapPin, Star, Loader2, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const data = await wishlistAPI.getWishlist();
        setWishlist(data);
      } catch (err: any) {
        setToast({ message: err.message || 'Failed to load wishlist', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, router]);

  const handleRemoveFromWishlist = async (gearId: string) => {
    try {
      await wishlistAPI.removeFromWishlist(gearId);
      setWishlist(wishlist.filter(item => item._id !== gearId));
      setToast({ message: 'Removed from wishlist', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to remove from wishlist', type: 'error' });
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
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              My Wishlist
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Start adding gear you love to your wishlist
              </p>
              <button
                onClick={() => router.push('/gear')}
                className="px-6 py-3 bg-[#059467] text-white rounded-full font-semibold hover:bg-[#047854] transition-all"
              >
                Browse Gear
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-lg transition-all group"
                >
                  <div className="relative aspect-square">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => router.push(`/gear/${item._id}`)}
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(item._id)}
                      className="absolute top-3 right-3 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full hover:scale-110 transition-all shadow-lg z-10"
                    >
                      <Heart className="w-5 h-5 fill-[#059467] text-[#059467]" />
                    </button>
                    {item.available ? (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-[#059467] text-white text-xs font-bold rounded-full">
                        Available
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 text-white text-xs font-bold rounded-full">
                        Unavailable
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 cursor-pointer hover:text-[#059467] transition-colors"
                      onClick={() => router.push(`/gear/${item._id}`)}
                    >
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{getCityName(item.location)}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#059467]">
                          {formatNPR(item.pricePerDay, false)}
                        </span>
                        <span className="text-sm text-slate-500">/day</span>
                      </div>
                      {item.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {item.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/gear/${item._id}`)}
                      className="w-full py-2.5 bg-[#059467] text-white rounded-full font-semibold hover:bg-[#047854] transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
