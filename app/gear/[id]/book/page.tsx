'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import Toast from '../../../../components/Toast';
import { gearAPI, bookingAPI } from '../../../../services/api';
import { useAuth } from '../../../../hooks/useAuth';
import { formatNPR } from '../../../../lib/currency';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Shield,
  Receipt,
  CreditCard,
  Lock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Sparkles,
  Truck,
  Headphones
} from 'lucide-react';

export default function BookGearPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [gear, setGear] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookedDates, setBookedDates] = useState<{start: Date, end: Date}[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  const [bookingFeatures, setBookingFeatures] = useState<Array<{icon: string, title: string, description: string}>>([]);
  const [serviceFeePercentage, setServiceFeePercentage] = useState(5);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchGear();
    fetchBookingFeatures();
    fetchServiceFee();
  }, [user, params.id]);

  const fetchServiceFee = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/site-settings/serviceFeePercentage`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.value !== undefined) {
          setServiceFeePercentage(data.value);
        }
      }
    } catch (error) {
      console.error('Error fetching service fee:', error);
      // Fallback to default 5%
    }
  };

  const fetchBookingFeatures = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/profile-field-options`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.bookingFeatures && Array.isArray(data.bookingFeatures)) {
          setBookingFeatures(data.bookingFeatures);
        }
      }
    } catch (error) {
      console.error('Error fetching booking features:', error);
      // Fallback to default features
      setBookingFeatures([
        {
          icon: 'Sparkles',
          title: 'Deep Cleaned',
          description: 'Every item is professionally sanitized and inspected after each use to ensure peak performance.'
        },
        {
          icon: 'Truck',
          title: 'Free Pickup',
          description: 'Pick up from our central hubs or have it delivered to your trailhead for a small fee.'
        },
        {
          icon: 'Headphones',
          title: '24/7 Adventure Support',
          description: 'Stuck in the wild? Our gear experts are available via satellite phone/chat to help you out.'
        }
      ]);
    }
  };

  const fetchGear = async () => {
    try {
      setLoading(true);
      const data = await gearAPI.getById(params.id as string);
      setGear(data);
      
      // Check if user is trying to book their own gear - redirect silently
      if (user && data.owner && (data.owner._id === user._id || data.owner === user._id)) {
        router.push(`/gear/${params.id}`);
        return;
      }

      // Fetch unavailable dates
      await fetchUnavailableDates(params.id as string);
    } catch (error) {
      console.error('Error fetching gear:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnavailableDates = async (gearId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gear/${gearId}/unavailable-dates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const dates = data.map((range: any) => ({
          start: new Date(range.startDate),
          end: new Date(range.endDate)
        }));
        setBookedDates(dates);
      }
    } catch (error) {
      console.error('Error fetching unavailable dates:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Sparkles, Truck, Headphones, Shield, Package: Receipt
    };
    return icons[iconName] || Sparkles;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateBooked = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    
    return bookedDates.some(range => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return date >= start && date <= end;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    // Prevent selecting past dates
    if (isPastDate(day)) {
      setToast({ message: 'Cannot select past dates', type: 'warning' });
      return;
    }

    // Prevent selecting booked dates
    if (isDateBooked(day)) {
      setToast({ message: 'This date is already booked', type: 'warning' });
      return;
    }
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate > startDate) {
      // Check if any date in the range is booked
      const tempDate = new Date(startDate);
      let hasBookedDate = false;
      while (tempDate <= clickedDate) {
        const checkDay = tempDate.getDate();
        const checkMonth = tempDate.getMonth();
        const checkYear = tempDate.getFullYear();
        if (checkMonth === currentMonth.getMonth() && checkYear === currentMonth.getFullYear()) {
          if (isDateBooked(checkDay)) {
            hasBookedDate = true;
            break;
          }
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      
      if (hasBookedDate) {
        setToast({ message: 'Selected range contains booked dates', type: 'warning' });
        return;
      }
      
      setEndDate(clickedDate);
    } else {
      setStartDate(clickedDate);
      setEndDate(null);
    }
  };

  const isDateInRange = (day: number) => {
    if (!startDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (endDate) {
      return date >= startDate && date <= endDate;
    }
    return date.getTime() === startDate.getTime();
  };

  const isStartDate = (day: number) => {
    if (!startDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.getTime() === startDate.getTime();
  };

  const isEndDate = (day: number) => {
    if (!endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.getTime() === endDate.getTime();
  };

  const getRentalDays = () => {
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const days = getRentalDays();
    if (days === 0 || !gear) return { rental: 0, deposit: 0, serviceFee: 0, total: 0 };
    
    const rental = days * gear.pricePerDay;
    const deposit = gear.deposit || 0;
    const serviceFee = rental * (serviceFeePercentage / 100);
    const total = rental + deposit + serviceFee;
    
    return { rental, deposit, serviceFee, total, days };
  };

  const setQuickDuration = (days: number) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    
    // Check if any date in the range is booked
    let hasBookedDate = false;
    const tempDate = new Date(start);
    while (tempDate <= end) {
      const checkDay = tempDate.getDate();
      if (isDateBooked(checkDay)) {
        hasBookedDate = true;
        break;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    if (hasBookedDate) {
      setToast({ message: 'Selected range contains booked dates. Please select dates manually.', type: 'warning' });
      return;
    }
    
    setStartDate(start);
    setEndDate(end);
  };

  const handleBooking = async () => {
    if (!startDate || !endDate || !agreedToTerms) {
      setToast({ message: 'Please select dates and agree to terms', type: 'warning' });
      return;
    }

    const days = getRentalDays();
    if (days < (gear.minimumRentalDays || 1)) {
      setToast({ message: `Minimum rental period is ${gear.minimumRentalDays || 1} days`, type: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const newBooking = await bookingAPI.create({
        gearId: gear._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupLocation: gear.location,
        notes: ''
      });
      
      setToast({ message: 'Booking request submitted successfully!', type: 'success' });
      setTimeout(() => {
        router.push(`/bookings/${newBooking._id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Booking error:', error);
      setToast({ message: error.message || 'Failed to create booking', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
          <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
            {/* Back Button Skeleton */}
            <div className="mb-6 animate-pulse">
              <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Title Skeleton */}
            <div className="mb-8 animate-pulse">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-64 mb-2" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-96" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column - Gear Info & Calendar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Gear Card Skeleton */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
                    </div>
                  </div>
                </div>

                {/* Calendar Skeleton */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 animate-pulse">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
                    <div className="flex gap-2">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    ))}
                  </div>
                </div>

                {/* Quick Duration Buttons Skeleton */}
                <div className="flex gap-3 overflow-x-auto pb-2 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-24 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
                  ))}
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 sticky top-24 space-y-6 animate-pulse">
                  <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-lg w-40" />
                  
                  {/* Summary Items */}
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between mb-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                    </div>
                  </div>

                  {/* Checkbox Skeleton */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    </div>
                  </div>

                  {/* Button Skeleton */}
                  <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="w-5 h-5 text-[#059467] animate-spin" />
                <p className="text-[#0d1c17] dark:text-white font-bold text-sm uppercase tracking-widest">
                  Loading Booking Page
                </p>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Preparing rental calendar...
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  if (!gear) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#0d1c17] dark:text-white mb-2">Gear Not Found</h2>
            <button onClick={() => router.push('/gear')} className="text-[#059467] hover:underline">
              Browse all gear
            </button>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const pricing = calculateTotal();
  const minDays = gear.minimumRentalDays || 1;

  return (
    <>
      <Header />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] pb-20 md:pb-0">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-10 lg:px-20">
          {/* Breadcrumbs */}
          <nav className="mb-6 md:mb-8 flex items-center gap-2 text-xs sm:text-sm font-medium text-[#059467]/70 overflow-x-auto">
            <button onClick={() => router.push('/')} className="hover:underline whitespace-nowrap">Home</button>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <button onClick={() => router.push('/gear')} className="hover:underline whitespace-nowrap">Gear Rental</button>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-[#0d1c17] dark:text-white truncate">{gear.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-6 md:gap-12 lg:grid-cols-12">
            {/* Left Column: Calendar & Selection */}
            <div className="lg:col-span-7">
              <div className="mb-4 md:mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tighter text-[#0d1c17] dark:text-white">
                  {gear.title}
                </h1>
                <p className="mt-2 text-sm sm:text-base md:text-lg text-[#059467]/80 line-clamp-2">
                  {gear.description?.substring(0, 80)}...
                </p>
              </div>

              <div className="rounded-xl md:rounded-2xl bg-white dark:bg-[#1a2c26] p-4 sm:p-6 md:p-8 shadow-sm border border-[#059467]/5">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#0d1c17] dark:text-white">Select Rental Period</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#059467]/5 hover:bg-[#059467]/10 text-[#059467]"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#059467]/5 hover:bg-[#059467]/10 text-[#059467]"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Selector Pills */}
                <div className="mb-6 md:mb-8 flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => setQuickDuration(3)}
                    className="flex h-8 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-[#059467]/20 bg-[#059467]/5 px-3 sm:px-5 text-xs sm:text-sm font-semibold text-[#059467] transition-all hover:border-[#059467] hover:bg-[#059467] hover:text-white"
                  >
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    3 Days
                  </button>
                  <button
                    onClick={() => setQuickDuration(7)}
                    className="flex h-8 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-[#059467]/20 bg-[#059467]/5 px-3 sm:px-5 text-xs sm:text-sm font-semibold text-[#059467] transition-all hover:border-[#059467] hover:bg-[#059467] hover:text-white"
                  >
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    1 Week
                  </button>
                  <button
                    onClick={() => setQuickDuration(14)}
                    className="flex h-8 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-[#059467]/20 bg-[#059467]/5 px-3 sm:px-5 text-xs sm:text-sm font-semibold text-[#059467] transition-all hover:border-[#059467] hover:bg-[#059467] hover:text-white"
                  >
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    2 Weeks
                  </button>
                </div>

                {/* Calendar */}
                <div className="mb-3 md:mb-4 text-center text-sm sm:text-base font-bold text-[#0d1c17] dark:text-white">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#059467]/40">
                  <div>Su</div>
                  <div>Mo</div>
                  <div>Tu</div>
                  <div>We</div>
                  <div>Th</div>
                  <div>Fr</div>
                  <div>Sa</div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10 sm:h-12" />
                  ))}
                  
                  {/* Days of month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const inRange = isDateInRange(day);
                    const isStart = isStartDate(day);
                    const isEnd = isEndDate(day);
                    const isPast = isPastDate(day);
                    const isBooked = isDateBooked(day);
                    const isDisabled = isPast || isBooked;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        disabled={isDisabled}
                        title={isPast ? 'Past date' : isBooked ? 'Already booked' : ''}
                        className={`flex h-10 sm:h-12 items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                          isDisabled
                            ? 'bg-[#fee2e2] dark:bg-red-900/20 text-[#ef4444]/50 dark:text-red-400/50 cursor-not-allowed line-through'
                            : isStart || isEnd
                            ? 'bg-[#059467] text-white shadow-lg ' + (isStart ? 'rounded-l-full' : '') + (isEnd ? 'rounded-r-full' : '')
                            : inRange
                            ? 'bg-[#059467]/20 text-[#059467]'
                            : 'text-[#0d1c17] dark:text-white hover:bg-[#059467]/10'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 border-t border-[#059467]/5 pt-4 md:pt-6 text-xs sm:text-sm font-medium text-[#0d1c17] dark:text-white">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#059467]" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#fee2e2] border border-red-200" />
                    <span>Booked/Past</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#059467]/10" />
                    <span>Available</span>
                  </div>
                </div>
              </div>

              {/* Product Preview */}
              <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                {gear.images?.slice(0, 2).map((img: string, i: number) => (
                  <img
                    key={i}
                    className="h-32 sm:h-40 md:h-48 w-full rounded-xl md:rounded-2xl object-cover"
                    src={img}
                    alt={`${gear.title} view ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Price Calculator Card */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-[#1a2c26] p-5 sm:p-6 md:p-8 shadow-2xl border border-[#059467]/10">
                <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-[#0d1c17] dark:text-white">Price Details</h2>
                  <div className="flex items-center gap-1 text-[#059467]">
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Secure Booking</span>
                  </div>
                </div>

                {/* Validation Warning */}
                {(pricing.days || 0) > 0 && (pricing.days || 0) < minDays && (
                  <div className="mb-4 md:mb-6 flex items-center gap-2 sm:gap-3 rounded-full bg-[#f59e0b]/10 p-2 sm:p-3 pr-4 sm:pr-6 text-xs sm:text-sm font-semibold text-[#f59e0b]">
                    <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-white">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span>Minimum rental for this gear is {minDays} days.</span>
                  </div>
                )}

                {/* Breakdown List */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[#0d1c17]/70 dark:text-white/70">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#059467]/60 flex-shrink-0" />
                      <span className="line-clamp-2">Rental Rate ({formatNPR(gear.pricePerDay)}/day × {pricing.days} days)</span>
                    </div>
                    <span className="font-bold text-[#0d1c17] dark:text-white ml-2">{formatNPR(pricing.rental)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[#0d1c17]/70 dark:text-white/70">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-[#059467]/60 flex-shrink-0" />
                      <span>Security Deposit (Refundable)</span>
                    </div>
                    <span className="font-bold text-[#0d1c17] dark:text-white ml-2">{formatNPR(pricing.deposit)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[#0d1c17]/70 dark:text-white/70 pb-4 sm:pb-6 border-b border-dashed border-[#059467]/20">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-[#059467]/60 flex-shrink-0" />
                      <span>Service Fee ({serviceFeePercentage}%)</span>
                    </div>
                    <span className="font-bold text-[#0d1c17] dark:text-white ml-2">{formatNPR(pricing.serviceFee)}</span>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-2 sm:pt-4">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#059467]">TOTAL AMOUNT</p>
                      <p className="text-[10px] sm:text-xs text-[#0d1c17]/50 dark:text-white/50">Inc. all taxes and fees</p>
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0d1c17] dark:text-white">
                      {formatNPR(pricing.total)}
                    </div>
                  </div>
                </div>

                {/* T&C Checkbox */}
                <div className="mt-6 md:mt-10 flex items-start gap-2 sm:gap-3">
                  <div className="flex h-5 sm:h-6 items-center">
                    <input
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="h-4 w-4 sm:h-5 sm:w-5 rounded border-[#059467]/20 text-[#059467] focus:ring-[#059467]/20"
                      id="terms"
                      type="checkbox"
                    />
                  </div>
                  <label className="text-[10px] sm:text-xs font-medium text-[#0d1c17]/60 dark:text-white/60" htmlFor="terms">
                    I agree to the <a className="text-[#059467] hover:underline" href="#">Rental Terms & Conditions</a> and understand the cancellation policy for this item.
                  </label>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleBooking}
                  disabled={!startDate || !endDate || !agreedToTerms || (pricing.days || 0) < minDays || submitting}
                  className="mt-6 md:mt-8 flex w-full items-center justify-center gap-2 sm:gap-3 rounded-full bg-[#059467] py-3.5 sm:py-4 md:py-5 text-base sm:text-lg font-black text-white shadow-lg transition-all hover:bg-[#047854] hover:shadow-[#059467]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Book Now
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </button>

                <div className="mt-4 md:mt-6 flex items-center justify-center gap-3 sm:gap-4 opacity-50 text-[#0d1c17] dark:text-white">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <section className="mt-12 md:mt-20 border-t border-[#059467]/10 pt-10 md:pt-16">
            <div className="grid grid-cols-1 gap-8 sm:gap-10 md:gap-12 md:grid-cols-3">
              {bookingFeatures.map((feature, index) => {
                const IconComponent = getIconComponent(feature.icon);
                return (
                  <div key={index} className="flex flex-col items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#059467]/10 text-[#059467]">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-[#0d1c17] dark:text-white">{feature.title}</h4>
                    <p className="text-xs sm:text-sm text-[#0d1c17]/60 dark:text-white/60">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
