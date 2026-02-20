'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { gearAPI, bookingAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import {
  Heart,
  Star,
  MapPin,
  BadgeCheck,
  Info,
  Share2,
  ShieldCheck,
  Loader2,
  MessageCircle,
  Send,
  X,
  ExternalLink,
  User as UserIcon
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

  useEffect(() => {
    const fetchGearDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const id = params.id as string;
        
        // Fetch gear details
        const data = await gearAPI.getById(id);
        console.log('Gear data received:', data);
        console.log('Owner data:', data.owner);
        setGearItem(data);

        // Fetch reviews (non-blocking)
        try {
          const reviewsData = await gearAPI.getReviews(id);
          setReviews(reviewsData);
        } catch (err) {
          // Silently fail - reviews are optional
          setReviews([]);
        }

        // Fetch user's bookings for this gear if logged in (non-blocking)
        if (user) {
          try {
            console.log('Fetching bookings for user:', user);
            const bookingsData = await bookingAPI.getMyBookings();
            console.log('All bookings:', bookingsData);
            
            // Safely filter bookings for this specific gear
            const gearBookings = (bookingsData || []).filter((booking: any) => {
              const isMatchingGear = booking?.gear?._id === id;
              const isCompleted = booking?.status === 'completed';
              const hasNoReview = !booking?.rating;
              
              console.log('Checking booking:', {
                bookingId: booking?._id,
                gearId: booking?.gear?._id,
                currentGearId: id,
                status: booking?.status,
                hasRating: !!booking?.rating,
                isMatchingGear,
                isCompleted,
                hasNoReview,
                willInclude: isMatchingGear && isCompleted && hasNoReview
              });
              
              return isMatchingGear && isCompleted && hasNoReview;
            });
            
            console.log('Filtered gear bookings (completed, no review):', gearBookings);
            setUserBookings(gearBookings);
          } catch (err) {
            console.error('Error fetching bookings:', err);
            // Silently fail - bookings are optional
            setUserBookings([]);
          }
        }
      } catch (err: any) {
        console.error('Error fetching gear:', err);
        setError(err.message || 'Failed to load gear details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGearDetails();
    }
  }, [params.id, user]);

  // Handle review submission
  const handleSubmitReview = async (bookingId: string) => {
    if (!reviewForm.review.trim()) {
      alert('Please write a review');
      return;
    }

    try {
      setSubmittingReview(true);
      await bookingAPI.addReview(bookingId, reviewForm.rating, reviewForm.review.trim());
      
      // Refresh reviews and bookings
      const reviewsData = await gearAPI.getReviews(params.id as string);
      setReviews(reviewsData);
      
      const bookingsData = await bookingAPI.getMyBookings();
      const gearBookings = bookingsData.filter((booking: any) => 
        booking.gear._id === params.id && 
        booking.status === 'completed' && 
        !booking.rating
      );
      setUserBookings(gearBookings);
      
      // Reset form
      setReviewForm({ rating: 5, review: '' });
      setShowReviewForm(false);
      
      alert('Review submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
            <p className="text-[#0d1c17]/60 dark:text-white/60">Loading gear details...</p>
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
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-[#0d1c17] dark:text-white mb-2">
                Gear Not Found
              </h2>
              <p className="text-[#0d1c17]/60 dark:text-white/60 mb-6">
                {error || 'The gear item you are looking for does not exist or has been removed.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/gear')}
                className="px-6 py-3 bg-[#059467] text-white rounded-full font-medium hover:bg-[#047854] transition-colors"
              >
                Browse All Gear
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-[#0d1c17] dark:text-white rounded-full font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Go Back
              </button>
            </div>
            <p className="text-xs text-[#0d1c17]/40 dark:text-white/40 mt-6">
              Need help? Contact support or browse our available gear.
            </p>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  // Format data from backend
  const images = gearItem.images && gearItem.images.length > 0 
    ? gearItem.images 
    : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'];
  
  const specs = gearItem.specifications || {};
  const owner = gearItem.owner || {};
  const reviewCount = reviews.length || 0;
  const avgRating = gearItem.rating || 0;
  
  // Check if current user is the owner
  const isOwner = user && owner && (owner._id === user._id || owner === user._id);

  // Generate fallback profile picture if none exists
  const ownerProfilePic = owner.profilePicture || 
    (owner.name 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.name)}&background=059467&color=fff&size=200`
      : 'https://ui-avatars.com/api/?name=User&background=059467&color=fff&size=200');

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 mb-6 px-2">
            <button
              onClick={() => router.push('/gear')}
              className="text-[#059467]/70 hover:text-[#059467] text-sm font-medium transition-colors"
            >
              Gear
            </button>
            <span className="text-[#059467]/40 text-sm font-medium">/</span>
            <button
              onClick={() => router.push(`/gear?category=${gearItem.category}`)}
              className="text-[#059467]/70 hover:text-[#059467] text-sm font-medium transition-colors"
            >
              {gearItem.category}
            </button>
            <span className="text-[#059467]/40 text-sm font-medium">/</span>
            <span className="text-[#0d1c17] dark:text-white text-sm font-medium">
              {gearItem.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Gallery & Details */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
              {/* Gallery Section */}
              <div className="flex flex-col gap-4">
                <div className="w-full aspect-[4/3] rounded-[40px] overflow-hidden bg-gray-100 dark:bg-white/5 relative group">
                  <img
                    alt={gearItem.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={images[selectedImage]}
                  />
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute top-4 right-4 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-[#059467] hover:scale-110 transition-transform shadow-lg"
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-[#059467]' : ''}`} />
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 size-[80px] rounded-2xl overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-[#059467] p-0.5'
                          : 'border-transparent hover:border-[#059467]/50'
                      }`}
                    >
                      <img
                        alt={`${gearItem.title} view ${index + 1}`}
                        className={`w-full h-full object-cover ${
                          selectedImage === index ? 'rounded-[14px]' : ''
                        }`}
                        src={image}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Section */}
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#0d1c17] dark:text-white mb-4">
                    About this gear
                  </h3>
                  <p className="text-base text-[#0d1c17]/80 dark:text-white/80 leading-relaxed max-w-prose">
                    {gearItem.description}
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 p-6 bg-white dark:bg-white/5 rounded-2xl border border-[#e7f4f0] dark:border-white/5 shadow-sm">
                  {specs.brand && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#059467]/70">
                        Brand
                      </span>
                      <span className="font-medium text-[#0d1c17] dark:text-white">
                        {specs.brand}
                      </span>
                    </div>
                  )}
                  {specs.model && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#059467]/70">
                        Model
                      </span>
                      <span className="font-medium text-[#0d1c17] dark:text-white">
                        {specs.model}
                      </span>
                    </div>
                  )}
                  {specs.size && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#059467]/70">
                        Size
                      </span>
                      <span className="font-medium text-[#0d1c17] dark:text-white">
                        {specs.size}
                      </span>
                    </div>
                  )}
                  {specs.weight && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#059467]/70">
                        Weight
                      </span>
                      <span className="font-medium text-[#0d1c17] dark:text-white">
                        {specs.weight}
                      </span>
                    </div>
                  )}
                  {specs.color && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#059467]/70">
                        Color
                      </span>
                      <span className="font-medium text-[#0d1c17] dark:text-white">
                        {specs.color}
                      </span>
                    </div>
                  )}
                  {/* Support legacy fields if they exist */}
                  {specs.material && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#059467]/70">
                        Material
                      </span>
                      <span className="font-medium text-[#0d1c17] dark:text-white">
                        {specs.material}
                      </span>
                    </div>
                  )}
                  {specs.fit && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#059467]/70">
                        Fit
                      </span>
                      <span className="font-medium text-[#0d1c17] dark:text-white">
                        {specs.fit}
                      </span>
                    </div>
                  )}
                  {specs.features && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#059467]/70">
                        Features
                      </span>
                      <span className="font-medium text-[#0d1c17] dark:text-white">
                        {specs.features}
                      </span>
                    </div>
                  )}
                  {(!specs || Object.keys(specs).filter(key => specs[key]).length === 0) && (
                    <div className="col-span-2 text-center py-4 text-[#0d1c17]/60 dark:text-white/60">
                      No specifications available
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div id="reviews-section" className="flex flex-col gap-6 pt-8 mt-8 border-t-4 border-[#059467]/20 dark:border-[#059467]/30 bg-gradient-to-b from-[#e7f4f0]/30 to-transparent dark:from-[#059467]/5 dark:to-transparent -mx-6 px-6 pb-6 rounded-3xl">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-7 h-7 text-[#059467]" />
                  <h3 className="text-2xl font-bold text-[#0d1c17] dark:text-white">
                    Reviews & Ratings
                  </h3>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-end gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-5xl font-bold text-[#0d1c17] dark:text-white">
                        {avgRating.toFixed(1)}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex text-[#f59e0b]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(avgRating)
                                  ? 'fill-[#f59e0b]'
                                  : i < avgRating
                                  ? 'fill-[#f59e0b] opacity-50'
                                  : ''
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-[#059467]/80 font-medium">
                          {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Write Review Button */}
                  {user && !showReviewForm && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          if (userBookings.length === 0) {
                            alert('You need to complete a rental of this gear before you can write a review. Book this gear and complete your rental to leave feedback!');
                            return;
                          }
                          setShowReviewForm(true);
                        }}
                        disabled={userBookings.length === 0}
                        className={`px-4 py-2 ${
                          userBookings.length === 0 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-[#059467] hover:bg-[#047854]'
                        } text-white rounded-full font-medium text-sm transition-colors flex items-center gap-2 shadow-lg`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Write Review
                      </button>
                      {userBookings.length === 0 && (
                        <p className="text-xs text-[#0d1c17]/60 dark:text-white/60 text-center">
                          Complete a rental to review
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!user && (
                    <button
                      onClick={() => router.push('/login')}
                      className="px-4 py-2 bg-[#059467] hover:bg-[#047854] text-white rounded-full font-medium text-sm transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Login to Review
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && userBookings.length > 0 && (
                  <div className="bg-white dark:bg-white/5 p-6 rounded-[24px] shadow-lg border-2 border-[#059467]/20 dark:border-[#059467]/30">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-[#0d1c17] dark:text-white">
                        Write Your Review
                      </h4>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewForm({ rating: 5, review: '' });
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-[#0d1c17]/60 dark:text-white/60" />
                      </button>
                    </div>

                    {/* Rating Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-[#0d1c17] dark:text-white mb-2">
                        Your Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= reviewForm.rating
                                  ? 'fill-[#f59e0b] text-[#f59e0b]'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-medium text-[#0d1c17] dark:text-white self-center">
                          {reviewForm.rating} {reviewForm.rating === 1 ? 'Star' : 'Stars'}
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-[#0d1c17] dark:text-white mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={reviewForm.review}
                        onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                        placeholder="Share your experience with this gear..."
                        rows={4}
                        className="w-full px-4 py-3 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-[#0d1c17] dark:text-white placeholder:text-slate-400 resize-none"
                      />
                      <p className="text-xs text-[#0d1c17]/60 dark:text-white/60 mt-1">
                        Minimum 10 characters
                      </p>
                    </div>

                    {/* Booking Selection */}
                    {userBookings.length > 1 && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-[#0d1c17] dark:text-white mb-2">
                          Select Booking
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-[#f5f8f7] dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#059467] text-[#0d1c17] dark:text-white"
                          onChange={(e) => {
                            const bookingId = e.target.value;
                            // Store selected booking ID for submission
                            (document.getElementById('selectedBookingId') as any).value = bookingId;
                          }}
                        >
                          {userBookings.map((booking: any) => (
                            <option key={booking._id} value={booking._id}>
                              Rental from {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                            </option>
                          ))}
                        </select>
                        <input type="hidden" id="selectedBookingId" value={userBookings[0]?._id} />
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const bookingId = userBookings.length === 1 
                            ? userBookings[0]._id 
                            : (document.getElementById('selectedBookingId') as any)?.value;
                          handleSubmitReview(bookingId);
                        }}
                        disabled={submittingReview || reviewForm.review.trim().length < 10}
                        className="flex-1 px-6 py-3 bg-[#059467] hover:bg-[#047854] disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Review
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewForm({ rating: 5, review: '' });
                        }}
                        disabled={submittingReview}
                        className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 text-[#0d1c17] dark:text-white rounded-full font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Reviews */}
                {reviews.length > 0 ? (
                  <div className="grid gap-4">
                    {reviews.map((review: any) => (
                      <div
                        key={review._id}
                        className="bg-white dark:bg-white/5 p-6 rounded-[24px] shadow-sm border border-[#e7f4f0] dark:border-white/5"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-10 rounded-full bg-cover bg-center"
                              style={{ 
                                backgroundImage: `url(${review.renter?.profilePicture || 'https://i.pravatar.cc/100?img=1'})` 
                              }}
                            />
                            <div>
                              <p className="font-bold text-sm text-[#0d1c17] dark:text-white">
                                {review.renter?.name || 'Anonymous'}
                              </p>
                              <p className="text-xs text-[#059467]/60">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-[#f59e0b]">
                            {[...Array(review.rating)].map((_: any, i: number) => (
                              <Star key={i} className="w-4 h-4 fill-[#f59e0b]" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-[#0d1c17]/80 dark:text-white/80 leading-relaxed">
                          {review.review}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white dark:bg-white/5 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-700">
                    <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-[#0d1c17]/60 dark:text-white/60 font-medium">
                      No reviews yet
                    </p>
                    <p className="text-sm text-[#0d1c17]/40 dark:text-white/40 mt-1">
                      Be the first to review this gear!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Transaction Layer (Sticky) */}
            <div className="lg:col-span-5 xl:col-span-4 relative">
              <div className="sticky top-24 flex flex-col gap-6">
                {/* Main Card */}
                <div className="bg-white dark:bg-white/5 rounded-[2rem] p-6 shadow-xl shadow-black/5 border border-[#e7f4f0] dark:border-white/5">
                  {/* Header Info */}
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-between items-start gap-4">
                      <h1 className="text-2xl md:text-3xl font-bold text-[#0d1c17] dark:text-white leading-tight">
                        {gearItem.title}
                      </h1>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#059467]">
                        ${gearItem.pricePerDay}
                      </span>
                      <span className="text-lg text-[#0d1c17]/60 dark:text-white/60">
                        per day
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f5f9] dark:bg-white/10 text-xs font-bold text-[#0d1c17] dark:text-white">
                        <BadgeCheck className="w-4 h-4 text-[#059467]" />
                        {gearItem.condition}
                      </span>
                      <button
                        onClick={() => {
                          const location = encodeURIComponent(gearItem.location);
                          const coords = gearItem.coordinates;
                          const url = coords?.lat && coords?.lng
                            ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
                            : `https://www.google.com/maps/search/?api=1&query=${location}`;
                          window.open(url, '_blank');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-transparent border border-[#e7f4f0] dark:border-white/10 text-xs font-medium text-[#0d1c17]/70 dark:text-white/70 hover:border-[#059467] hover:text-[#059467] hover:bg-[#059467]/5 transition-all group"
                        title="Open in Google Maps"
                      >
                        <MapPin className="w-4 h-4 text-[#059467] group-hover:animate-bounce" />
                        {gearItem.location}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>

                  {/* Owner Profile */}
                  <div className="flex items-center justify-between p-4 bg-[#f8fcfb] dark:bg-white/5 rounded-2xl mb-6 hover:bg-[#e7f4f0] dark:hover:bg-white/10 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (owner.username) {
                        router.push(`/profile/${owner.username}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="size-14 rounded-full ring-2 ring-[#059467]/20 group-hover:ring-[#059467] transition-all overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#059467] to-[#047854] shadow-md"
                          title={`View ${owner.name || owner.username || 'Owner'}'s profile`}
                        >
                          {ownerProfilePic ? (
                            <img
                              src={ownerProfilePic}
                              alt={owner.name || owner.username || 'Owner'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const displayName = owner.name || owner.username || 'Owner';
                                  parent.innerHTML = `<span class="text-white font-bold text-xl">${displayName.charAt(0).toUpperCase()}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-white font-bold text-xl">
                              {((owner.name || owner.username || 'O').charAt(0).toUpperCase())}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#2a2a2a] rounded-full p-0.5 shadow-sm">
                          <BadgeCheck className="w-4 h-4 text-[#059467]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#0d1c17] dark:text-white mb-0.5">
                          {owner.name || owner.username || 'Gear Owner'}
                        </p>
                        {owner.username && owner.name && (
                          <p className="text-xs text-[#0d1c17]/50 dark:text-white/50 mb-1">
                            @{owner.username}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                            <span className="text-xs text-[#0d1c17]/60 dark:text-white/60 font-medium">
                              {gearItem.totalRentals || 0} {gearItem.totalRentals === 1 ? 'rental' : 'rentals'}
                            </span>
                          </div>
                          {owner.location && (
                            <>
                              <span className="text-[#0d1c17]/20 dark:text-white/20">•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#059467]/60" />
                                <span className="text-xs text-[#0d1c17]/60 dark:text-white/60">
                                  {owner.location}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (owner.username) {
                          router.push(`/profile/${owner.username}`);
                        } else {
                          alert('Owner profile not available');
                        }
                      }}
                      disabled={!owner.username}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#059467] hover:bg-[#059467]/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed group-hover:gap-2 transition-all"
                    >
                      <UserIcon className="w-4 h-4" />
                      View Profile
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>

                  {/* Rental Details Table */}
                  <div className="flex flex-col gap-3 mb-8">
                    <div className="flex justify-between items-center py-2 border-b border-[#e7f4f0] dark:border-white/5">
                      <span className="text-sm text-[#0d1c17]/60 dark:text-white/60">
                        Min. Rental
                      </span>
                      <span className="text-sm font-medium text-[#0d1c17] dark:text-white">
                        {gearItem.minimumRentalDays || 1} {gearItem.minimumRentalDays === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#e7f4f0] dark:border-white/5">
                      <span className="text-sm text-[#0d1c17]/60 dark:text-white/60">
                        Security Deposit
                      </span>
                      <span className="text-sm font-medium text-[#0d1c17] dark:text-white">
                        ${gearItem.deposit || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[#0d1c17]/60 dark:text-white/60">
                          Currency
                        </span>
                        <Info className="w-3.5 h-3.5 text-[#059467]/60 cursor-help" />
                      </div>
                      <span className="text-sm font-medium text-[#0d1c17] dark:text-white">
                        {gearItem.currency || 'USD'}
                      </span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-3">
                    {isOwner ? (
                      <div className="w-full h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-base flex items-center justify-center cursor-not-allowed">
                        Your Listing
                      </div>
                    ) : (
                      <button 
                        onClick={() => router.push(`/gear/${gearItem._id}/book`)}
                        className="w-full h-12 rounded-full bg-[#059467] hover:bg-[#059467]/90 text-white font-bold text-base shadow-lg shadow-[#059467]/20 transition-all active:scale-[0.98]"
                      >
                        Book Now
                      </button>
                    )}
                    <button className="w-full h-12 rounded-full border border-[#059467] text-[#059467] font-bold text-sm hover:bg-[#059467]/5 transition-colors">
                      Contact Owner
                    </button>
                    <button 
                      onClick={() => {
                        const reviewSection = document.getElementById('reviews-section');
                        reviewSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="w-full h-10 rounded-full text-[#0d1c17]/60 dark:text-white/60 hover:text-[#059467] font-medium text-sm flex items-center justify-center gap-2 group border border-transparent hover:border-[#059467]/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      View {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                    </button>
                    <button className="w-full h-10 rounded-full text-[#0d1c17]/60 dark:text-white/60 hover:text-[#059467] font-medium text-sm flex items-center justify-center gap-2 mt-2 group">
                      <Share2 className="w-4 h-4 group-hover:animate-pulse" />
                      Share Gear
                    </button>
                  </div>
                </div>

                {/* Protection Badge */}
                <div className="flex items-center justify-center gap-2 text-[#059467]/80 opacity-80">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    100% NomadNotes Protection Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
