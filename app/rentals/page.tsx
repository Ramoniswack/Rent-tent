'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  Search,
  Bell,
  MessageCircle,
  Calendar,
  User,
  MessageSquare,
  Star,
  Archive,
  ArrowRight
} from 'lucide-react';

type RentalStatus = 'pending' | 'accepted' | 'completed' | 'declined';

interface Rental {
  id: string;
  requestNumber: string;
  title: string;
  image: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  days: number;
  renterName: string;
  earnings: number;
}

export default function MyRentalsPage() {
  const [activeTab, setActiveTab] = useState<'rentals' | 'requests'>('rentals');
  const [activeFilter, setActiveFilter] = useState<'all' | RentalStatus>('all');

  const rentals: Rental[] = [
    {
      id: '1',
      requestNumber: 'R-2940',
      title: 'Sony Alpha a7 III Mirrorless Digital Camera Body',
      image: 'https://images.unsplash.com/photo-1606980707986-e660e4d1e3f7?w=800&q=80',
      status: 'pending',
      startDate: 'Oct 24',
      endDate: 'Oct 28',
      days: 4,
      renterName: 'Sarah Jenkins',
      earnings: 140
    },
    {
      id: '2',
      requestNumber: 'R-2938',
      title: 'DJI Mavic 3 Cine Premium Combo',
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
      status: 'accepted',
      startDate: 'Nov 02',
      endDate: 'Nov 05',
      days: 3,
      renterName: 'Mike Ross',
      earnings: 450
    },
    {
      id: '3',
      requestNumber: 'R-2890',
      title: 'Shure SM7B Vocal Dynamic Microphone',
      image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80',
      status: 'completed',
      startDate: 'Oct 10',
      endDate: 'Oct 12',
      days: 2,
      renterName: 'Jessica Pearson',
      earnings: 60
    },
    {
      id: '4',
      requestNumber: 'R-2911',
      title: 'Canon RF 24-70mm f/2.8 L IS USM Lens',
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&q=80',
      status: 'declined',
      startDate: 'Oct 20',
      endDate: 'Oct 21',
      days: 1,
      renterName: 'Louis Litt',
      earnings: 55
    }
  ];

  const getStatusBadge = (status: RentalStatus) => {
    const configs = {
      pending: {
        bg: 'bg-[#fef3c7]',
        text: 'text-[#f59e0b]',
        label: 'Pending',
        dot: true
      },
      accepted: {
        bg: 'bg-[#d1fae5]',
        text: 'text-[#059467]',
        label: 'Accepted',
        dot: true
      },
      completed: {
        bg: 'bg-[#f1f5f9]',
        text: 'text-[#64748b]',
        label: 'Completed',
        dot: false
      },
      declined: {
        bg: 'bg-[#fee2e2]',
        text: 'text-[#ef4444]',
        label: 'Declined',
        dot: false
      }
    };

    const config = configs[status];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text} text-xs font-bold uppercase tracking-wider`}>
        {config.dot && <span className={`size-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`}></span>}
        {config.label}
      </span>
    );
  };

  const filteredRentals = activeFilter === 'all' 
    ? rentals 
    : rentals.filter(r => r.status === activeFilter);

  const pendingCount = rentals.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0f231d] dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-[#0f231d]/60 dark:text-white/60 text-sm md:text-base">
              Manage your gear rentals and requests in one place.
            </p>
          </div>

          {/* Segment Controller */}
          <div className="bg-[#e7f4f0] dark:bg-[#1a2c26] p-1.5 rounded-full flex relative w-full md:w-auto self-start md:self-auto">
            <button
              onClick={() => setActiveTab('rentals')}
              className={`relative z-10 flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 text-center min-w-[140px] ${
                activeTab === 'rentals'
                  ? 'bg-white dark:bg-[#0f231d] text-[#059467] shadow-sm'
                  : 'text-[#0f231d]/70 dark:text-white/70 hover:text-[#0f231d] dark:hover:text-white'
              }`}
            >
              My Rentals
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`relative z-10 flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 min-w-[160px] ${
                activeTab === 'requests'
                  ? 'bg-white dark:bg-[#0f231d] text-[#059467] shadow-sm'
                  : 'text-[#0f231d]/70 dark:text-white/70 hover:text-[#0f231d] dark:hover:text-white'
              }`}
            >
              My Gear Requests
              {pendingCount > 0 && (
                <span className="size-2 bg-[#ef4444] rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
              activeFilter === 'all'
                ? 'bg-[#0f231d] dark:bg-[#059467] text-white'
                : 'bg-white dark:bg-[#1a2c26] border border-[#e7f4f0] dark:border-[#2a453b] text-[#0f231d]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-[#152e26]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-[#0f231d] dark:bg-[#059467] text-white'
                : 'bg-white dark:bg-[#1a2c26] border border-[#e7f4f0] dark:border-[#2a453b] text-[#0f231d]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-[#152e26]'
            }`}
          >
            Pending
            {pendingCount > 0 && (
              <span className="ml-1.5 bg-[#f59e0b] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'accepted'
                ? 'bg-[#0f231d] dark:bg-[#059467] text-white'
                : 'bg-white dark:bg-[#1a2c26] border border-[#e7f4f0] dark:border-[#2a453b] text-[#0f231d]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-[#152e26]'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'completed'
                ? 'bg-[#0f231d] dark:bg-[#059467] text-white'
                : 'bg-white dark:bg-[#1a2c26] border border-[#e7f4f0] dark:border-[#2a453b] text-[#0f231d]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-[#152e26]'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Booking Cards Container */}
        <div className="flex flex-col gap-5">
          {filteredRentals.map((rental) => (
            <article
              key={rental.id}
              className={`bg-white dark:bg-[#1a2c26] rounded-[24px] p-5 shadow-sm border border-[#e7f4f0]/60 dark:border-[#2a453b]/60 hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center group ${
                rental.status === 'completed' ? 'opacity-80 hover:opacity-100' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className={`shrink-0 relative w-full md:w-[120px] aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 ${
                rental.status === 'declined' ? 'grayscale group-hover:grayscale-0' : ''
              } ${rental.status === 'completed' ? 'grayscale-[0.5] group-hover:grayscale-0' : ''} transition-all`}>
                <img
                  alt={rental.title}
                  className={`w-full h-full object-cover ${
                    rental.status === 'pending' || rental.status === 'accepted'
                      ? 'group-hover:scale-105 transition-transform duration-500'
                      : ''
                  }`}
                  src={rental.image}
                />
                {rental.status === 'declined' && (
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-2 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {getStatusBadge(rental.status)}
                  <span className="text-xs text-[#0f231d]/50 dark:text-white/50 font-medium">
                    Request #{rental.requestNumber}
                  </span>
                </div>
                <h3 className={`text-[18px] font-bold leading-tight truncate ${
                  rental.status === 'declined'
                    ? 'text-[#0f231d]/80 dark:text-white/80'
                    : 'text-[#0f231d] dark:text-white'
                }`}>
                  {rental.title}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-sm text-[#0f231d]/60 dark:text-white/60 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {rental.startDate} - {rental.endDate} ({rental.days} Days)
                    </span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>
                      {rental.status === 'pending' ? 'Request from: ' : 'Renter: '}
                      <span className="text-[#0f231d] dark:text-white font-medium">
                        {rental.renterName}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Side */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-2 pl-0 md:pl-4 md:border-l md:border-[#f0f7f5] dark:md:border-[#2a453b] min-w-[160px]">
                <div className={`text-right ${rental.status === 'declined' ? 'opacity-50' : ''}`}>
                  <p className="text-xs text-[#0f231d]/50 dark:text-white/50 font-medium mb-0.5 uppercase tracking-wide">
                    {rental.status === 'completed' ? 'Earned' : rental.status === 'declined' ? 'Potential' : 'Total Earnings'}
                  </p>
                  <p className={`text-[20px] font-bold text-[#0f231d] dark:text-white ${
                    rental.status === 'declined' ? 'line-through decoration-[#ef4444]' : ''
                  }`}>
                    ${rental.earnings.toFixed(2)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full md:w-auto">
                  {rental.status === 'pending' && (
                    <>
                      <button className="flex-1 md:flex-none h-10 px-4 rounded-full border border-gray-200 dark:border-[#2a453b] text-[#0f231d]/70 dark:text-white/70 font-bold text-sm hover:bg-gray-50 dark:hover:bg-[#152e26] transition-colors flex items-center justify-center">
                        Decline
                      </button>
                      <button className="flex-1 md:flex-none h-10 px-5 rounded-full bg-[#059467] text-white font-bold text-sm hover:bg-[#047a55] transition-colors shadow-lg shadow-[#059467]/20 flex items-center justify-center gap-1">
                        Accept
                      </button>
                    </>
                  )}
                  {rental.status === 'accepted' && (
                    <button className="flex-1 md:flex-none h-10 px-5 rounded-full bg-white dark:bg-[#0f231d] border border-[#e7f4f0] dark:border-[#2a453b] text-[#0f231d] dark:text-white font-bold text-sm hover:bg-[#f8fcfb] dark:hover:bg-[#152e26] transition-colors flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  )}
                  {rental.status === 'completed' && (
                    <button className="flex-1 md:flex-none h-10 px-5 rounded-full bg-[#e7f4f0] dark:bg-[#1a2c26] text-[#059467] font-bold text-sm hover:bg-[#dbece6] dark:hover:bg-[#152e26] transition-colors flex items-center justify-center gap-1">
                      <Star className="w-4 h-4" />
                      Leave Review
                    </button>
                  )}
                  {rental.status === 'declined' && (
                    <button className="flex-1 md:flex-none h-10 px-4 rounded-full text-[#0f231d]/40 dark:text-white/40 font-medium text-sm hover:text-[#0f231d] dark:hover:text-white transition-colors flex items-center justify-center">
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State / Footer Call to action */}
        <div className="mt-12 text-center pb-12">
          <p className="text-[#0f231d]/50 dark:text-white/50 text-sm mb-4">
            You've reached the end of your rentals list.
          </p>
          <button className="inline-flex items-center gap-2 text-[#059467] font-bold hover:underline cursor-pointer">
            <span>View archived rentals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
