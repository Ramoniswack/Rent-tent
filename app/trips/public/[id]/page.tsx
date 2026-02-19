'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { tripAPI } from '../../../../services/api';
import { useAuth } from '../../../../hooks/useAuth';
import {
  MapPin,
  Calendar,
  Users,
  Lock,
  Share2,
  CheckCircle,
  ArrowRight,
  Map as MapIcon,
  DollarSign,
  Sun,
  Mountain,
  Loader2
} from 'lucide-react';

export default function PublicTripView() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrip();
  }, [params.id]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const data = await tripAPI.getById(params.id as string);
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getDaysDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!trip) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#0d1c17] dark:text-white mb-2">Trip Not Found</h2>
            <button
              onClick={() => router.push('/trips')}
              className="text-[#059467] hover:underline"
            >
              Browse all trips
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const days = getDaysDuration(trip.startDate, trip.endDate);
  const heroImage = trip.coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
        {/* Hero Section */}
        <div className="relative w-full h-[400px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          {/* Emerald Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#059467]/90 via-[#059467]/40 to-black/30" />
          
          <div className="relative h-full max-w-5xl mx-auto px-4 md:px-10 flex flex-col justify-end pb-16 md:pb-24">
            <div className="flex items-center gap-2 mb-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">
                {trip.destination}
              </span>
            </div>
            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight mb-2 drop-shadow-sm">
              {trip.title}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <Calendar className="w-4 h-4" />
              <span className="text-base font-medium">
                {formatDateRange(trip.startDate, trip.endDate)}
              </span>
              <span className="mx-2">•</span>
              <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold uppercase">
                {trip.status || 'Open'}
              </span>
            </div>
          </div>
        </div>

        {/* Overlapping Content Card */}
        <div className="relative -mt-10 md:-mt-16 z-10 px-0 md:px-6 max-w-5xl mx-auto mb-20">
          <div className="bg-white dark:bg-[#1a2c26] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-xl min-h-[600px] overflow-hidden">
            {/* Sticky Header / Toolbar */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#1a2c26]/95 backdrop-blur border-b border-gray-100 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:px-10 md:py-6 gap-4">
              {/* Owner Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="size-16 rounded-full border-2 border-[#059467] p-0.5">
                    <img
                      alt={trip.creator?.name || 'Trip Creator'}
                      className="w-full h-full rounded-full object-cover"
                      src={trip.creator?.profilePicture || 'https://i.pravatar.cc/100?img=5'}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#f59e0b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border-2 border-white dark:border-[#1a2c26] uppercase tracking-wider">
                    Owner
                  </div>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[#0d1c17] dark:text-white leading-tight">
                    {trip.creator?.name || 'Trip Creator'}
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm text-[#0d1c17]/60 dark:text-white/60 mt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-[#059467]" />
                      Nomad since 2021
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span>14 Successful Trips</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#0d1c17] dark:text-white size-12 rounded-full flex items-center justify-center transition-colors"
                  title="Share Trip"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="flex-1 md:flex-none bg-[#059467] hover:bg-[#047854] text-white h-12 px-6 rounded-full font-bold text-sm md:text-base transition-all shadow-lg shadow-[#059467]/30 flex items-center justify-center gap-2">
                  <span>Request to Join Expedition</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column: Details & Itinerary */}
              <div className="lg:col-span-2 space-y-10">
                {/* Description */}
                <section>
                  <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-4">
                    About this trip
                  </h3>
                  <p className="text-[#0d1c17]/70 dark:text-white/70 leading-relaxed text-base">
                    {trip.description || 'Join us for an unforgettable adventure. This trip is designed for travelers who love exploration and authentic experiences.'}
                  </p>
                </section>

                {/* Itinerary Timeline */}
                <section className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white">Itinerary</h3>
                    <span className="text-xs font-semibold bg-gray-100 dark:bg-white/10 text-[#0d1c17] dark:text-white px-2 py-1 rounded uppercase tracking-wide">
                      {days} Days
                    </span>
                  </div>

                  <div className="space-y-8 relative pl-0">
                    {/* Timeline line */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-white/10" />

                    {/* Day 1: Public */}
                    <div className="relative pl-12">
                      <div className="absolute left-3 top-1 size-5 rounded-full border-[3px] border-white dark:border-[#1a2c26] bg-[#059467] shadow-sm z-10" />
                      <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-[#059467] uppercase tracking-wide">
                            Day 1 • {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <Sun className="w-5 h-5 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-bold text-[#0d1c17] dark:text-white mb-2">
                          Arrival &amp; Welcome
                        </h4>
                        <p className="text-[#0d1c17]/60 dark:text-white/60 text-sm mb-4">
                          Meeting at the destination followed by a group welcome dinner.
                        </p>
                        <div
                          className="h-32 w-full rounded-xl bg-cover bg-center relative overflow-hidden"
                          style={{ backgroundImage: `url(${heroImage})` }}
                        >
                          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {trip.destination}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Day 2: Private/Locked */}
                    <div className="relative pl-12">
                      <div className="absolute left-3 top-1 size-5 rounded-full border-[3px] border-white dark:border-[#1a2c26] bg-gray-300 dark:bg-gray-600 shadow-sm z-10" />
                      <div className="relative group overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                        {/* Blurred Content */}
                        <div className="p-5 filter blur-[6px] select-none opacity-50 bg-gray-50 dark:bg-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                              Day 2 • Hidden
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-[#0d1c17] dark:text-white mb-2">
                            Hidden Valley Hike &amp; Secret Spot
                          </h4>
                          <p className="text-gray-400 text-sm mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                          <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        </div>
                        {/* Lock Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 z-20">
                          <div className="bg-white dark:bg-[#1a2c26] p-3 rounded-full shadow-lg mb-3 text-[#f59e0b]">
                            <Lock className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-bold text-[#0d1c17] dark:text-white">
                            Join trip to see full details
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Day 3: Public */}
                    <div className="relative pl-12">
                      <div className="absolute left-3 top-1 size-5 rounded-full border-[3px] border-white dark:border-[#1a2c26] bg-[#059467] shadow-sm z-10" />
                      <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-[#059467] uppercase tracking-wide">
                            Day 3 • Exploration
                          </span>
                          <Mountain className="w-5 h-5 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-bold text-[#0d1c17] dark:text-white mb-2">
                          Main Activity Day
                        </h4>
                        <p className="text-[#0d1c17]/60 dark:text-white/60 text-sm mb-4">
                          Full day of adventure and exploration at the destination.
                        </p>
                        <div className="flex gap-2 overflow-hidden">
                          <div
                            className="h-24 w-32 rounded-lg bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400)` }}
                          />
                          <div
                            className="h-24 w-32 rounded-lg bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400)` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Remaining Days Summary */}
                    {days > 3 && (
                      <div className="relative pl-12">
                        <div className="absolute left-3 top-1 size-5 rounded-full border-[3px] border-white dark:border-[#1a2c26] bg-gray-300 dark:bg-gray-600 shadow-sm z-10" />
                        <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-center">
                          <p className="text-[#0d1c17]/60 dark:text-white/60 font-medium text-sm">
                            + {days - 3} more days of adventure
                          </p>
                          <button className="mt-2 text-[#059467] font-bold text-sm hover:underline">
                            Request to join to view all
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Sidebar Widgets */}
              <div className="lg:col-span-1 space-y-6">
                {/* Participants Widget */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                  <h3 className="text-base font-bold text-[#0d1c17] dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#059467]" />
                    Who's going?
                  </h3>
                  <div className="flex items-center -space-x-3 overflow-hidden mb-4 pl-2">
                    {[1, 2, 3, 4].map((i) => (
                      <img
                        key={i}
                        alt={`Participant ${i}`}
                        className="inline-block size-10 rounded-full ring-2 ring-white dark:ring-[#1a2c26] object-cover"
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      />
                    ))}
                    <div className="size-10 rounded-full ring-2 ring-white dark:ring-[#1a2c26] bg-[#059467] text-white flex items-center justify-center text-xs font-bold">
                      +4
                    </div>
                  </div>
                  <p className="text-sm text-[#0d1c17]/60 dark:text-white/60">
                    8 spots taken • <span className="text-[#f59e0b] font-semibold">2 spots left</span>
                  </p>
                </div>

                {/* Budget Widget */}
                <div className="bg-gradient-to-br from-[#0f231d] to-[#1a3a32] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 size-24 bg-white/5 rounded-full blur-xl" />
                  <h3 className="text-base font-medium text-white/80 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Est. Total Budget
                  </h3>
                  <p className="text-3xl font-bold mb-4">
                    ${trip.budget || 1200}
                    <span className="text-sm font-normal text-white/60">/person</span>
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Accommodation</span>
                      <span className="font-medium">${Math.floor((trip.budget || 1200) * 0.5)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Activities</span>
                      <span className="font-medium">${Math.floor((trip.budget || 1200) * 0.33)}</span>
                    </div>
                    <div className="relative pt-3 mt-1 border-t border-white/10">
                      {/* Blurred breakdown */}
                      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5 rounded flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white/50" />
                      </div>
                      <div className="flex items-center justify-between text-sm blur-[4px] opacity-60">
                        <span className="text-white/70">Food &amp; Drink</span>
                        <span className="font-medium">${Math.floor((trip.budget || 1200) * 0.17)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Map Widget */}
                <div className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-white/5 h-48 relative group cursor-pointer">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600)` }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <button className="w-full bg-white/90 backdrop-blur text-[#0d1c17] py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-white transition-colors flex items-center justify-center gap-2">
                      <MapIcon className="w-4 h-4 text-[#059467]" />
                      View on Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
