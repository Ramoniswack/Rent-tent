'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { gearAPI, bookingAPI } from '../../../../services/api';
import { useAuth } from '../../../../hooks/useAuth';
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchGear();
  }, [user, params.id]);

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
    } catch (error) {
      console.error('Error fetching gear:', error);
    } finally {
      setLoading(false);
    }
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

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate > startDate) {
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
    const serviceFee = rental * 0.05;
    const total = rental + deposit + serviceFee;
    
    return { rental, deposit, serviceFee, total, days };
  };

  const setQuickDuration = (days: number) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    
    setStartDate(start);
    setEndDate(end);
  };

  const handleBooking = async () => {
    if (!startDate || !endDate || !agreedToTerms) {
      alert('Please select dates and agree to terms');
      return;
    }

    const days = getRentalDays();
    if (days < (gear.minimumRentalDays || 1)) {
      alert(`Minimum rental period is ${gear.minimumRentalDays || 1} days`);
      return;
    }

    try {
      setSubmitting(true);
      await bookingAPI.create({
        gearId: gear._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupLocation: gear.location,
        notes: ''
      });
      
      alert('Booking request submitted successfully!');
      router.push('/rentals/dashboard');
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
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
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`flex h-10 sm:h-12 items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                          isStart || isEnd
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
                    <span>Unavailable</span>
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
                      <span className="line-clamp-2">Rental Rate (${gear.pricePerDay}/day × {pricing.days} days)</span>
                    </div>
                    <span className="font-bold text-[#0d1c17] dark:text-white ml-2">${pricing.rental.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[#0d1c17]/70 dark:text-white/70">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-[#059467]/60 flex-shrink-0" />
                      <span>Security Deposit (Refundable)</span>
                    </div>
                    <span className="font-bold text-[#0d1c17] dark:text-white ml-2">${pricing.deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[#0d1c17]/70 dark:text-white/70 pb-4 sm:pb-6 border-b border-dashed border-[#059467]/20">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-[#059467]/60 flex-shrink-0" />
                      <span>Service Fee (5%)</span>
                    </div>
                    <span className="font-bold text-[#0d1c17] dark:text-white ml-2">${pricing.serviceFee.toFixed(2)}</span>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-2 sm:pt-4">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#059467]">TOTAL AMOUNT</p>
                      <p className="text-[10px] sm:text-xs text-[#0d1c17]/50 dark:text-white/50">Inc. all taxes and fees</p>
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0d1c17] dark:text-white">
                      ${pricing.total.toFixed(2)}
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
              <div className="flex flex-col items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#059467]/10 text-[#059467]">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[#0d1c17] dark:text-white">Deep Cleaned</h4>
                <p className="text-xs sm:text-sm text-[#0d1c17]/60 dark:text-white/60">
                  Every item is professionally sanitized and inspected after each use to ensure peak performance.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#059467]/10 text-[#059467]">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[#0d1c17] dark:text-white">Free Pickup</h4>
                <p className="text-xs sm:text-sm text-[#0d1c17]/60 dark:text-white/60">
                  Pick up from our central hubs or have it delivered to your trailhead for a small fee.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#059467]/10 text-[#059467]">
                  <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[#0d1c17] dark:text-white">24/7 Adventure Support</h4>
                <p className="text-xs sm:text-sm text-[#0d1c17]/60 dark:text-white/60">
                  Stuck in the wild? Our gear experts are available via satellite phone/chat to help you out.
                </p>
              </div>
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
