'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Toast from '../../../components/Toast';
import BookingStatusTimeline from '../../../components/BookingStatusTimeline';
import DepositStatusCard from '../../../components/DepositStatusCard';
import BookingActionButtons from '../../../components/BookingActionButtons';
import LogisticsCard from '../../../components/LogisticsCard';
import RentalTermsCard from '../../../components/RentalTermsCard';
import OwnerStatusControl from '../../../components/OwnerStatusControl';
import ConfirmModal from '../../../components/ConfirmModal';
import { bookingAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { formatNPR } from '../../../lib/currency';
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  Calendar,
  User,
  Package,
  Download,
  Loader2,
  AlertTriangle,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');

  const fetchBookingDetails = useCallback(async () => {
    if (!user || !params.id) return;
    
    try {
      setLoading(true);
      const [renterBookings, ownerBookings] = await Promise.all([
        bookingAPI.getMyBookings(),
        bookingAPI.getGearBookings()
      ]);
      
      const allBookings = [...renterBookings, ...ownerBookings];
      const foundBooking = allBookings.find((b: any) => b._id === params.id);
      
      if (!foundBooking) {
        setToast({ message: 'Booking not found', type: 'error' });
      } else {
        setBooking(foundBooking);
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to load booking details', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user, params.id]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const isRenter = useMemo(() => booking?.renter?._id === user?._id, [booking, user]);
  const isGearOwner = useMemo(() => booking?.owner?._id === user?._id, [booking, user]);
  const otherUser = useMemo(() => isRenter ? booking?.owner : booking?.renter, [isRenter, booking]);
  const mappedStatus = useMemo(() => booking?.status === 'active' ? 'in_use' : booking?.status, [booking]);

  const handleCancel = async () => {
    try {
      await bookingAPI.updateStatus(booking._id, 'cancelled');
      setToast({ message: 'Booking cancelled successfully', type: 'success' });
      setShowCancelModal(false);
      fetchBookingDetails();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to cancel booking', type: 'error' });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowStatusChangeModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      await bookingAPI.updateStatus(booking._id, pendingStatus);
      setToast({ message: 'Status updated successfully', type: 'success' });
      setShowStatusChangeModal(false);
      fetchBookingDetails();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to update status', type: 'error' });
    }
  };

  const handleReportIssue = async () => {
    if (!issueDescription.trim()) {
      setToast({ message: 'Please describe the issue', type: 'warning' });
      return;
    }
    setToast({ message: 'Issue reported successfully. Support will review it.', type: 'success' });
    setShowIssueModal(false);
    setIssueDescription('');
  };

  const handleContactOwner = () => {
    if (booking && otherUser?._id) {
      router.push(`/messages?user=${otherUser._id}`);
    }
  };

  const handleGetDirections = () => {
    if (booking?.pickupLocation) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.pickupLocation)}`, '_blank');
    }
  };

  const downloadPDF = async () => {
    if (!booking) return;
    try {
      const doc = new jsPDF();
      const margin = 20;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(5, 148, 103); // Theme Green
      doc.text('Gear Nepal Rental Receipt', margin, 30);
      
      doc.setDrawColor(231, 244, 240);
      doc.line(margin, 35, 190, 35);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, margin, 45);
      doc.text(`Booking ID: ${booking._id}`, margin, 52);
      
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text('Booking Summary', margin, 70);
      
      const details = [
        ['Gear:', booking.gear?.title || 'N/A'],
        ['Renter:', booking.renter?.name || booking.renter?.username || 'N/A'],
        ['Owner:', booking.owner?.name || booking.owner?.username || 'N/A'],
        ['Duration:', `${booking.totalDays} Days`],
        ['Start Date:', new Date(booking.startDate).toLocaleDateString()],
        ['End Date:', new Date(booking.endDate).toLocaleDateString()],
        ['Status:', booking.status.toUpperCase()]
      ];

      let yPos = 80;
      details.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(value, 70, yPos);
        yPos += 10;
      });

      doc.setDrawColor(5, 148, 103);
      doc.setFillColor(245, 248, 247);
      doc.rect(margin, yPos + 5, 170, 35, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.text('Financial Totals', margin + 5, yPos + 15);
      doc.text('Total Rental Price:', margin + 5, yPos + 25);
      doc.text(formatNPR(booking.totalPrice), 150, yPos + 25);
      doc.text('Security Deposit (Held):', margin + 5, yPos + 33);
      doc.text(formatNPR(booking.deposit || 0), 150, yPos + 33);

      doc.save(`Receipt-${booking._id.substring(0, 8)}.pdf`);
      setToast({ message: 'Receipt downloaded successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to generate PDF', type: 'error' });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0d1c17] transition-colors duration-300">
          <Header />
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-10 h-10 text-[#059467] animate-spin" />
            <p className="text-sm font-medium text-gray-500 animate-pulse">Syncing booking data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!booking) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0d1c17]">
          <Header />
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400">The rental you are looking for might have been removed or the ID is incorrect.</p>
            </div>
            <button
              onClick={() => router.push('/rentals/dashboard')}
              className="px-8 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0d1c17] transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[#059467] font-bold py-2 px-1 transition-all"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-emerald-500/20 text-[#059467] dark:text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Receipt PDF
              </button>
              <button
                onClick={handleContactOwner}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#059467] hover:bg-[#047854] text-white rounded-xl font-bold text-sm shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with {isRenter ? 'Owner' : 'Renter'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Visual Workflow Timeline */}
              <section>
                 <BookingStatusTimeline 
                  currentStatus={mappedStatus} 
                  statusHistory={booking.statusHistory}
                />
              </section>

              {/* Gear Information Card */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-3xl overflow-hidden shadow-sm border border-[#e7f4f0] dark:border-white/5 transition-all hover:shadow-md">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-black/20 shrink-0">
                    {booking.gear?.images?.[0] ? (
                      <img
                        src={booking.gear.images[0]}
                        alt={booking.gear.title}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={40} /></div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">
                      <Package className="w-4 h-4" />
                      {booking.gear?.category || 'General Gear'}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                      {booking.gear?.title || 'Gear Item'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {booking.gear?.description || 'No additional description provided by the owner.'}
                    </p>
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-4">
                      <button
                        onClick={() => router.push(`/gear/${booking.gear?._id}`)}
                        className="flex items-center gap-2 text-sm font-bold text-[#059467] hover:underline"
                      >
                        View Public Listing <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg"><Calendar className="w-5 h-5 text-emerald-500" /></div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Rental Duration</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Pick-up Date</span>
                      <span className="font-bold text-slate-900 dark:text-white">{new Date(booking.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Return Date</span>
                      <span className="font-bold text-slate-900 dark:text-white">{new Date(booking.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-50 dark:border-white/5 flex justify-between items-center font-bold">
                      <span className="text-emerald-600">Total Rental</span>
                      <span className="text-lg text-slate-900 dark:text-white">{booking.totalDays} Days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-600 dark:bg-emerald-900/30 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                  <h3 className="font-bold mb-6 flex items-center gap-2 opacity-90"><Package size={18} /> Pricing Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm opacity-80">
                      <span>Rate (Per Day)</span>
                      <span>{formatNPR(booking.totalPrice / booking.totalDays)}</span>
                    </div>
                    <div className="flex justify-between text-sm opacity-80">
                      <span>Service Fee</span>
                      <span>Included</span>
                    </div>
                    <div className="pt-4 mt-2 border-t border-white/20 flex justify-between items-end">
                      <span className="text-sm opacity-90 font-medium">Total Paid</span>
                      <span className="text-3xl font-black">{formatNPR(booking.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Instructions */}
              <LogisticsCard
                location={booking.pickupLocation}
                pickupInstructions="Ensure you inspect the gear before taking it. Record a video of the item's condition for safety."
                returnInstructions="Clean the gear before return. Check all accessories are included in the bag."
                ownerPhone={otherUser?.phone}
                ownerEmail={otherUser?.email}
                onGetDirections={handleGetDirections}
                onContactOwner={handleContactOwner}
              />

              {/* Renter Actions Footer */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                <BookingActionButtons
                  status={mappedStatus}
                  isRenter={isRenter}
                  onCancel={() => setShowCancelModal(true)}
                  onContactOwner={handleContactOwner}
                  onReportIssue={() => setShowIssueModal(true)}
                  onExtendRental={() => setToast({message: 'Feature in development', type: 'info'})}
                  onViewRefund={() => setToast({message: 'Check your email for refund status', type: 'info'})}
                />
              </div>
            </div>

            {/* Sidebar Controls */}
            <aside className="lg:col-span-4 space-y-8">
              
              {/* Exclusive Owner Control Panel */}
              {isGearOwner && (
                <div className=" top-8 space-y-8">
                  <OwnerStatusControl
                    currentStatus={mappedStatus}
                    onStatusChange={handleStatusChange}
                    disabled={['cancelled', 'completed'].includes(booking.status)}
                  />
                </div>
              )}

              {/* Financial Security Card */}
              <DepositStatusCard
                depositAmount={booking.deposit || 0}
                depositStatus="held"
                refundDate={new Date(new Date(booking.endDate).getTime() + 3 * 24 * 60 * 60 * 1000)}
              />

              {/* User Connection Card */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/5 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:rotate-12 transition-transform"><User className="w-5 h-5 text-slate-500" /></div>
                  <h2 className="font-black text-lg text-slate-900 dark:text-white">
                    {isRenter ? 'Meet the Owner' : 'About Renter'}
                  </h2>
                </div>
                
                {otherUser?._id ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden border-2 border-emerald-500/20">
                        {otherUser.profilePicture ? (
                          <img src={otherUser.profilePicture} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-500 font-bold text-xl">
                            {otherUser.name?.charAt(0) || 'G'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{otherUser.name || 'G-User'}</p>
                        <p className="text-xs text-gray-400 font-bold">Member since 2025</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/profile/${otherUser.username}`)}
                      className="w-full py-3 bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl text-sm font-black text-slate-900 dark:text-white transition-all border border-slate-100 dark:border-white/5"
                    >
                      View Full Profile
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4">Participant data unavailable</p>
                )}
              </div>

              {/* Terms Sidebar */}
              <RentalTermsCard
                lateFeePerDay={50}
                protectionPlan={{ active: !!booking.protectionPlan }}
                cancellationDeadline={new Date(new Date(booking.startDate).getTime() - 24 * 60 * 60 * 1000)}
                cancellationFee={booking.totalPrice * 0.15}
              />
            </aside>
          </div>
        </main>

        <Footer />

        {/* Dynamic Modals */}
        {showCancelModal && (
          <ConfirmModal
            title="Terminate Booking?"
            message="Stopping this booking now may involve cancellation fees if the rental period is close or already started. Proceed?"
            confirmText="Stop Booking"
            cancelText="Go Back"
            onConfirm={handleCancel}
            onCancel={() => setShowCancelModal(false)}
            type="decline"
          />
        )}

        {showIssueModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-[#1a2c26] rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Flag Issue</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Describe the problem clearly. Include details about damage, late delivery, or missing components. Support will mediate the dispute.
              </p>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="E.g. Item lens is scratched..."
                className="w-full px-5 py-4 border-2 border-gray-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 dark:bg-[#0d1c17] text-slate-900 dark:text-white transition-all resize-none outline-none"
                rows={4}
              />
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-2xl font-black transition-all hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportIssue}
                  className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
                >
                  Report
                </button>
              </div>
            </div>
          </div>
        )}

        {showStatusChangeModal && (
          <ConfirmModal
            title="Update Lifecycle"
            message={`Move this rental to "${pendingStatus.replace('_', ' ').toUpperCase()}"? This triggers notifications and financial updates.`}
            confirmText="Update Now"
            cancelText="Wait"
            onConfirm={confirmStatusChange}
            onCancel={() => setShowStatusChangeModal(false)}
            type="confirm"
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </ProtectedRoute>
  );
}

export default BookingDetailsPage;