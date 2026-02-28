'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Toast from '../../../components/Toast';
import { gearAPI, bookingAPI, wishlistAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { formatNPR } from '../../../lib/currency';
import { getCityName } from '../../../lib/location';
import {
  Heart,
  Star,
  MapPin,
  BadgeCheck,
  Info,
  ShieldCheck,
  Loader2,
  MessageCircle,
  Send,
  X,
  ExternalLink,
  Edit,
  ChevronRight,
  Home
} from 'lucide-react';

export default function GearDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [gearItem, setGearItem] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [allUserBookings, setAllUserBookings] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchGearDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const id = params.id as string;
        const data = await gearAPI.getById(id);
        setGearItem(data);

        try {
          const reviewsData = await gearAPI.getReviews(id);
          setReviews(reviewsData);
        } catch (err) {
          setReviews([]);
        }

        if (user) {
          try {
            const bookingsData = await bookingAPI.getMyBookings();
            const allGearBookings = (bookingsData || []).filter((booking: any) => {
              return booking?.gear?._id === id;
            });
            
            setAllUserBookings(allGearBookings);
            
            const gearBookings = allGearBookings.filter((booking: any) => {
              const isCompleted = booking?.status === 'completed';
              const hasNoReview = !booking?.rating;
              return isCompleted && hasNoReview;
            });
            
            setUserBookings(gearBookings);
          } catch (err) {
            setUserBookings([]);
            setAllUserBookings([]);
          }

          // Check if gear is in wishlist
          try {
            const wishlistStatus = await wishlistAPI.checkWishlist(id);
            setIsFavorite(wishlistStatus.inWishlist);
          } catch (err) {
            setIsFavorite(false);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load gear details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGearDetails();
    }
  }, [params.id, user]);

  const handleSubmitReview = async (bookingId: string) => {
    if (!reviewForm.review.trim()) {
      setToast({ message: 'Please write a review', type: 'error' });
      return;
    }

    if (reviewForm.review.trim().length < 10) {
      setToast({ message: 'Review must be at least 10 characters', type: 'error' });
      return;
    }

    try {
      setSubmittingReview(true);
      await bookingAPI.addReview(bookingId, reviewForm.rating, reviewForm.review.trim());
      
      const reviewsData = await gearAPI.getReviews(params.id as string);
      setReviews(reviewsData);
      
      const bookingsData = await bookingAPI.getMyBookings();
      const gearBookings = bookingsData.filter((booking: any) => 
        booking?.gear?._id === params.id && 
        booking?.status === 'completed' && 
        !booking?.rating
      );
      setUserBookings(gearBookings);
      
      setReviewForm({ rating: 5, review: '' });
      setShowReviewForm(false);
      
      setToast({ message: 'Review submitted successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to submit review', type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1713]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">
            <div className="mb-8 animate-pulse flex gap-2">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                <div className="aspect-[4/3] md:aspect-square bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="size-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
                <div className="space-y-4 pt-4">
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 animate-pulse" />
                  <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full animate-pulse" />
                </div>
              </div>
              
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <div className="h-[400px] bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  if (error || !gearItem) {
    return (
      <>
        <Header />
        <div className="min-h-[80vh] bg-slate-50 dark:bg-[#0b1713] flex items-center justify-center px-4">
          <div className="text-center max-w-md bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Gear Not Found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {error || 'The gear item you are looking for does not exist or has been removed from the platform.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/gear')}
                className="px-6 py-3 bg-[#059467] text-white rounded-full font-semibold hover:bg-[#047854] hover:shadow-lg hover:shadow-[#059467]/20 transition-all active:scale-[0.98]"
              >
                Browse All Gear
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  const images = gearItem.images && gearItem.images.length > 0 
    ? gearItem.images 
    : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'];
  
  const specs = gearItem.specifications || {};
  const owner = gearItem.owner || {};
  const reviewCount = reviews.length || 0;
  const avgRating = gearItem.rating || 0;
  
  const isOwner = user && owner && (owner._id === user._id || owner === user._id);
  
  const ownerProfilePic = owner.profilePicture || 
    (owner.name 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.name)}&background=059467&color=fff&size=200`
      : 'https://ui-avatars.com/api/?name=User&background=059467&color=fff&size=200');

  // Helper for specs rendering
  const renderSpec = (label: string, value: string) => {
    if (!value) return null;
    return (
      <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 hover:border-[#059467]/30 transition-colors">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="font-semibold text-slate-900 dark:text-white">
          {value}
        </span>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1713] pb-20">
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          
          {/* Enhanced Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-sm font-medium overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
            <button onClick={() => router.push('/')} className="text-slate-500 hover:text-[#059467] transition-colors flex items-center gap-1.5">
              <Home className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            <button
              onClick={() => router.push('/gear')}
              className="text-slate-500 hover:text-[#059467] transition-colors"
            >
              Gear
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            <button
              onClick={() => router.push(`/gear?category=${gearItem.category}`)}
              className="text-slate-500 hover:text-[#059467] transition-colors"
            >
              {gearItem.category}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            <span className="text-slate-900 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
              {gearItem.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Gallery & Details */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
              
              {/* Refined Gallery Section */}
              <div className="flex flex-col gap-4">
                <div className="w-full aspect-[4/3] md:aspect-square max-h-[600px] rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 relative group border border-slate-100 dark:border-white/5 shadow-sm">
                  <img
                    alt={gearItem.title}
                    className="w-full h-full object-contain p-4 md:p-8 transition-transform duration-700 group-hover:scale-105"
                    src={images[selectedImage]}
                  />
                  {/* Subtle gradient overlay for premium feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <button
                    onClick={async () => {
                      if (!user) {
                        setToast({ message: 'Please login to add to wishlist', type: 'error' });
                        setTimeout(() => router.push('/login'), 1500);
                        return;
                      }

                      try {
                        if (isFavorite) {
                          await wishlistAPI.removeFromWishlist(params.id as string);
                          setIsFavorite(false);
                          setToast({ message: 'Removed from wishlist', type: 'success' });
                        } else {
                          await wishlistAPI.addToWishlist(params.id as string);
                          setIsFavorite(true);
                          setToast({ message: 'Added to wishlist', type: 'success' });
                        }
                      } catch (err: any) {
                        setToast({ message: err.message || 'Failed to update wishlist', type: 'error' });
                      }
                    }}
                    className="absolute top-4 right-4 p-3.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full text-slate-400 hover:text-[#059467] hover:scale-110 transition-all shadow-lg hover:shadow-xl z-10"
                  >
                    <Heart className={`w-6 h-6 transition-colors ${isFavorite ? 'fill-[#059467] text-[#059467]' : ''}`} />
                  </button>
                </div>

                {/* Refined Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 size-20 md:size-24 rounded-2xl overflow-hidden transition-all duration-300 ${
                          selectedImage === index
                            ? 'ring-2 ring-[#059467] ring-offset-2 dark:ring-offset-slate-900 scale-95 opacity-100'
                            : 'ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-[#059467]/50 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="w-full h-full bg-white dark:bg-slate-800 p-2">
                          <img
                            alt={`${gearItem.title} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl"
                            src={image}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="flex flex-col gap-10">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    About this gear
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {gearItem.description}
                  </p>
                </div>

                {/* Enhanced Specs Grid */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Specifications</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {renderSpec('Brand', specs.brand)}
                    {renderSpec('Model', specs.model)}
                    {renderSpec('Size', specs.size)}
                    {renderSpec('Weight', specs.weight)}
                    {renderSpec('Color', specs.color)}
                    {renderSpec('Material', specs.material)}
                    {renderSpec('Fit', specs.fit)}
                    {renderSpec('Features', specs.features)}
                    {(!specs || Object.keys(specs).filter(key => specs[key]).length === 0) && (
                      <div className="col-span-full text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
                        No detailed specifications provided.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div id="reviews-section" className="flex flex-col gap-8 pt-10 mt-6 border-t border-slate-200 dark:border-white/10">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="flex flex-col items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-[#059467] to-[#036245] text-white shadow-lg shadow-[#059467]/20">
                      <span className="text-3xl font-bold leading-none">{avgRating.toFixed(1)}</span>
                      <Star className="w-4 h-4 fill-white mt-1 opacity-90" />
                    </div>
                    <div className="flex flex-col justify-center py-1">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        Reviews
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(avgRating)
                                  ? 'fill-amber-400'
                                  : i < avgRating
                                  ? 'fill-amber-400 opacity-50'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500 font-medium">
                          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {user && !showReviewForm && !isOwner && (
                    <div className="flex flex-col sm:items-end gap-2">
                      <button
                        onClick={() => {
                          if (userBookings.length === 0) {
                            setToast({ 
                              message: 'You need to complete a rental of this gear before you can write a review.', 
                              type: 'error' 
                            });
                            return;
                          }
                          setShowReviewForm(true);
                        }}
                        disabled={userBookings.length === 0}
                        className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
                          userBookings.length === 0 
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 cursor-not-allowed' 
                            : 'bg-white border-2 border-[#059467] text-[#059467] hover:bg-[#059467] hover:text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Write a Review
                      </button>
                      {userBookings.length > 0 && (
                        <p className="text-xs text-[#059467] font-medium text-center sm:text-right">
                          {userBookings.length} eligible rental{userBookings.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!user && (
                    <button
                      onClick={() => router.push('/login')}
                      className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md w-full sm:w-auto"
                    >
                      Login to Review
                    </button>
                  )}
                </div>

                {/* Review Form Container */}
                {showReviewForm && userBookings.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Form code identical to original, just layout tweaks */}
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                        Share your experience
                      </h4>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewForm({ rating: 5, review: '' });
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                          Overall Rating
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="transition-all hover:scale-110 focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 md:w-10 md:h-10 ${
                                  star <= reviewForm.rating
                                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                    : 'text-slate-200 dark:text-slate-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Written Review
                        </label>
                        <textarea
                          value={reviewForm.review}
                          onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                          placeholder="What did you like about this gear? How was the condition?"
                          rows={4}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#059467] focus:border-transparent transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                        />
                      </div>

                      {userBookings.length > 1 && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Select Rental to Review
                          </label>
                          <select
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white"
                            onChange={(e) => {
                              const bookingId = e.target.value;
                              (document.getElementById('selectedBookingId') as any).value = bookingId;
                            }}
                          >
                            {userBookings.map((booking: any) => (
                              <option key={booking._id} value={booking._id}>
                                Rental: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                              </option>
                            ))}
                          </select>
                          <input type="hidden" id="selectedBookingId" value={userBookings[0]?._id} />
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => {
                            const bookingId = userBookings.length === 1 
                              ? userBookings[0]._id 
                              : (document.getElementById('selectedBookingId') as any)?.value;
                            handleSubmitReview(bookingId);
                          }}
                          disabled={submittingReview || reviewForm.review.trim().length < 10}
                          className="flex-1 px-6 py-4 bg-[#059467] hover:bg-[#047854] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          {submittingReview ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                          ) : (
                            <><Send className="w-5 h-5" /> Post Review</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Reviews List */}
                {reviews.length > 0 ? (
                  <div className="grid gap-5">
                    {reviews.map((review: any) => (
                      <div
                        key={review._id}
                        className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="size-12 rounded-full bg-cover bg-center ring-2 ring-slate-100 dark:ring-slate-700"
                              style={{ 
                                backgroundImage: `url(${review.renter?.profilePicture || 'https://i.pravatar.cc/100?img=1'})` 
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {review.renter?.name || 'Anonymous User'}
                              </p>
                              <p className="text-sm text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-3 py-1.5 rounded-full">
                            {[...Array(review.rating)].map((_: any, i: number) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-[4rem]">
                          "{review.review}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      No reviews yet
                    </p>
                    <p className="text-slate-500">
                      Be the first to rent and review this item!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Transaction Sticky Card */}
            <div className="lg:col-span-5 xl:col-span-4 relative">
              <div className="sticky top-28 flex flex-col gap-6">
                
                {/* Main Action Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 shadow-2xl shadow-[#059467]/5 border border-white dark:border-white/10 relative overflow-hidden">
                  {/* Decorative background glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#059467] rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-20 animate-blob" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col gap-5 mb-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 w-fit">
                        <BadgeCheck className="w-4 h-4 text-[#059467]" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {gearItem.condition}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-extrabold text-[#059467] tracking-tight">
                          {formatNPR(gearItem.pricePerDay, false)}
                        </span>
                        <span className="text-lg text-slate-500 font-medium">
                          / day
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const location = encodeURIComponent(gearItem.location);
                          const coords = gearItem.coordinates;
                          const url = coords?.lat && coords?.lng
                            ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
                            : `https://www.google.com/maps/search/?api=1&query=${location}`;
                          window.open(url, '_blank');
                        }}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-[#059467] transition-colors group w-fit"
                      >
                        <MapPin className="w-5 h-5 group-hover:animate-bounce text-[#059467]" />
                        <span className="font-medium underline decoration-slate-200 dark:decoration-slate-700 group-hover:decoration-[#059467] underline-offset-4">
                          {getCityName(gearItem.location)}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Min. Rental</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {gearItem.minimumRentalDays || 1} {gearItem.minimumRentalDays === 1 ? 'Day' : 'Days'}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Deposit</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          ₹{gearItem.deposit || 0}
                        </p>
                      </div>
                    </div>

                    {/* Call to Actions */}
                    <div className="flex flex-col gap-3">
                      {isOwner ? (
                        <button
                          onClick={() => router.push(`/gear/${params.id}/edit`)}
                          className="w-full h-14 rounded-full bg-gradient-to-r from-[#059467] to-[#047854] text-white font-bold text-lg shadow-lg shadow-[#059467]/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                          <Edit className="w-5 h-5" />
                          Edit Listing
                        </button>
                      ) : (
                        <button 
                          onClick={() => router.push(`/gear/${gearItem._id}/book`)}
                          className="w-full h-14 rounded-full bg-gradient-to-r from-[#059467] to-[#047854] text-white font-bold text-lg shadow-lg shadow-[#059467]/30 transition-all hover:-translate-y-1 flex items-center justify-center"
                        >
                          Book Now
                        </button>
                      )}

                      {!isOwner && (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              if (!user) {
                                router.push('/login');
                                return;
                              }
                              const gearName = encodeURIComponent(gearItem.title);
                              router.push(`/messages?userId=${owner._id || owner}&gearName=${gearName}&gearId=${gearItem._id}`);
                            }}
                            className="flex-1 h-12 rounded-full border-2 border-[#059467] text-[#059467] font-bold text-sm hover:bg-[#059467] hover:text-white transition-all flex items-center justify-center gap-2 group"
                          >
                            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Message
                          </button>
                          
                          {user && allUserBookings.length > 0 && (
                            <button 
                              onClick={() => {
                                if (allUserBookings.length === 1) {
                                  router.push(`/bookings/${allUserBookings[0]._id}`);
                                } else {
                                  const mostRecentBooking = allUserBookings.sort((a, b) => 
                                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                  )[0];
                                  router.push(`/bookings/${mostRecentBooking._id}`);
                                }
                              }}
                              className="flex-1 h-12 rounded-full bg-[#059467]/10 text-[#059467] font-bold text-sm hover:bg-[#059467]/20 transition-all flex items-center justify-center gap-2"
                            >
                              My Bookings
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                      <ShieldCheck className="w-5 h-5 text-[#059467]" />
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        100% Protection Guarantee
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Profile Card */}
                <div 
                  className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-white/5 cursor-pointer hover:border-[#059467]/30 hover:shadow-md transition-all group flex items-center gap-4"
                  onClick={() => {
                    if (owner.username) router.push(`/seller/${owner.username}`);
                  }}
                >
                  <div className="relative">
                    <div className="size-16 rounded-full ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-[#059467] transition-all overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#059467] to-[#047854]">
                      {ownerProfilePic ? (
                        <img src={ownerProfilePic} alt={owner.name || 'Owner'} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xl">{(owner.name || 'O').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm">
                      <BadgeCheck className="w-5 h-5 text-[#059467]" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wide">
                      Gear Owner
                    </p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white truncate">
                      {owner.name || owner.username || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {gearItem.totalRentals || 0} rentals
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#059467] group-hover:translate-x-1 transition-all" />
                </div>
                
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
      
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