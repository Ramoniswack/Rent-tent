'use client';

import { useState, useEffect } from 'react';
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
  AlertTriangle
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

  useEffect(() => {
    // Only fetch if user is loaded
    if (user && params.id) {
      fetchBookingDetails();
    }
  }, [user, params.id]);

  // Fetch booking details
  const fetchBookingDetails = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Fetch both renter and owner bookings to find this specific booking
      const [renterBookings, ownerBookings] = await Promise.all([
        bookingAPI.getMyBookings(),
        bookingAPI.getGearBookings()
      ]);
      
      // Find the booking by ID
      const allBookings = [...renterBookings, ...ownerBookings];
      const foundBooking = allBookings.find((b: any) => b._id === params.id);
      
      if (!foundBooking) {
        console.error('Booking not found in fetched data');
        setToast({ message: 'Booking not found', type: 'error' });
        setLoading(false);
        return;
      }
      
      console.log('Found booking:', foundBooking);
      setBooking(foundBooking);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      setToast({ message: error.message || 'Failed to load booking details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel booking
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

  // Handle status change (owner only)
  const handleStatusChange = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowStatusChangeModal(true);
  };

  // Confirm status change
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

  // Handle report issue
  const handleReportIssue = async () => {
    if (!issueDescription.trim()) {
      setToast({ message: 'Please describe the issue', type: 'warning' });
      return;
    }
    
    try {
      // For now, just show a success message
      // In production, this would call an API endpoint
      setToast({ message: 'Issue reported successfully. Owner will be notified.', type: 'success' });
      setShowIssueModal(false);
      setIssueDescription('');
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to report issue', type: 'error' });
    }
  };

  // Handle extend rental
  const handleExtendRental = () => {
    setToast({ message: 'Extension request feature coming soon', type: 'info' });
  };

  // Handle contact owner
  const handleContactOwner = () => {
    if (booking) {
      const otherUser = isRenter ? booking.owner : booking.renter;
      router.push(`/messages?user=${otherUser._id}`);
    }
  };

  // Handle get directions
  const handleGetDirections = () => {
    if (booking?.pickupLocation) {
      const encodedLocation = encodeURIComponent(booking.pickupLocation);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
    }
  };

  // Handle view refund
  const handleViewRefund = () => {
    setToast({ message: 'Refund details will be sent to your email', type: 'info' });
  };

  // Download PDF receipt
  const downloadPDF = async () => {
    if (!booking) return;
    
    try {
      const doc = new jsPDF();
      
      // Get user names with better fallbacks
      const renterName = booking.renter?.name || booking.renter?.username || 'N/A';
      const ownerName = booking.owner?.name || booking.owner?.username || 'N/A';
      
      // Header
      doc.setFontSize(20);
      doc.text('Rental Booking Receipt', 20, 20);
      
      // Booking details
      doc.setFontSize(12);
      doc.text(`Booking ID: ${booking._id}`, 20, 40);
      doc.text(`Gear: ${booking.gear?.title || 'N/A'}`, 20, 50);
      doc.text(`Renter: ${renterName}`, 20, 60);
      doc.text(`Owner: ${ownerName}`, 20, 70);
      doc.text(`Start Date: ${new Date(booking.startDate).toLocaleDateString()}`, 20, 80);
      doc.text(`End Date: ${new Date(booking.endDate).toLocaleDateString()}`, 20, 90);
      doc.text(`Total Days: ${booking.totalDays}`, 20, 100);
      doc.text(`Total Price: ${formatNPR(booking.totalPrice)}`, 20, 110);
      doc.text(`Deposit: ${formatNPR(booking.deposit || 0)}`, 20, 120);
      doc.text(`Status: ${booking.status}`, 20, 130);
      doc.text(`Pickup Location: ${booking.pickupLocation}`, 20, 140);
      
      doc.save(`booking-${booking._id}.pdf`);
      setToast({ message: 'Receipt downloaded successfully', type: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({ message: 'Failed to generate PDF', type: 'error' });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0d1c17]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-[#059467] animate-spin" />
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <p className="text-gray-500 dark:text-gray-400">Booking not found</p>
            <button
              onClick={() => router.push('/rentals/dashboard')}
              className="px-4 py-2 bg-[#059467] hover:bg-[#047854] text-white rounded-full font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isRenter = booking.renter?._id === user?._id;
  const isGearOwner = booking.owner?._id === user?._id;
  const otherUser = isRenter ? booking.owner : booking.renter;
  
  // Debug logging
  console.log('Booking Debug:', {
    userId: user?._id,
    renterId: booking.renter?._id,
    ownerId: booking.owner?._id,
    renterData: booking.renter,
    ownerData: booking.owner,
    isRenter,
    isGearOwner,
    otherUser,
    hasGear: !!booking.gear
  });
  
  // Map old status to new status system
  const mappedStatus = booking.status === 'active' ? 'in_use' : booking.status;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0d1c17]">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#059467] hover:text-[#047854] mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Timeline */}
              <BookingStatusTimeline 
                currentStatus={mappedStatus} 
                statusHistory={booking.statusHistory}
              />

              {/* Gear Details */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Gear Information</h2>
                </div>
                
                <div className="flex gap-4">
                  {booking.gear?.images?.[0] && (
                    <img
                      src={booking.gear.images[0]}
                      alt={booking.gear.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#0d1c17] dark:text-white mb-1">
                      {booking.gear?.title || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {booking.gear?.category || 'N/A'}
                    </p>
                    <button
                      onClick={() => router.push(`/gear/${booking.gear?._id}`)}
                      className="text-sm text-[#059467] hover:text-[#047854] font-medium"
                    >
                      View Gear Details →
                    </button>
                  </div>
                </div>
              </div>

              {/* Rental Details */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Rental Period</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                    <p className="font-semibold text-[#0d1c17] dark:text-white">
                      {new Date(booking.startDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                    <p className="font-semibold text-[#0d1c17] dark:text-white">
                      {new Date(booking.endDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Days</p>
                    <p className="font-semibold text-[#0d1c17] dark:text-white">
                      {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Price</p>
                    <p className="font-bold text-xl text-[#059467]">
                      {formatNPR(booking.totalPrice)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logistics */}
              <LogisticsCard
                location={booking.pickupLocation}
                pickupInstructions="Please bring a valid ID for verification. Pickup available between 9 AM - 6 PM."
                returnInstructions="Return the gear in the same condition. Late returns are subject to additional charges."
                ownerPhone={otherUser?.phone}
                ownerEmail={otherUser?.email}
                onGetDirections={handleGetDirections}
                onContactOwner={handleContactOwner}
              />

              {/* Action Buttons */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <BookingActionButtons
                  status={mappedStatus}
                  isRenter={isRenter}
                  onCancel={() => setShowCancelModal(true)}
                  onContactOwner={handleContactOwner}
                  onReportIssue={() => setShowIssueModal(true)}
                  onExtendRental={handleExtendRental}
                  onViewRefund={handleViewRefund}
                />
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Owner Status Control - Only visible to gear owner (product lister) */}
              {isGearOwner && (
                <OwnerStatusControl
                  currentStatus={mappedStatus}
                  onStatusChange={handleStatusChange}
                  disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                />
              )}

              {/* Deposit Status */}
              <DepositStatusCard
                depositAmount={booking.deposit || 0}
                depositStatus="held"
                refundDate={new Date(new Date(booking.endDate).getTime() + 3 * 24 * 60 * 60 * 1000)}
              />

              {/* Rental Terms */}
              <RentalTermsCard
                lateFeePerDay={50}
                protectionPlan={{ active: false }}
                cancellationDeadline={new Date(new Date(booking.startDate).getTime() - 24 * 60 * 60 * 1000)}
                cancellationFee={booking.totalPrice * 0.1}
              />

              {/* Contact Card */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-lg font-bold text-[#0d1c17] dark:text-white">
                    {isRenter ? 'Owner' : 'Renter'} Details
                  </h2>
                </div>
                {otherUser && otherUser._id ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      {otherUser.profilePicture && (
                        <img
                          src={otherUser.profilePicture}
                          alt={otherUser.name || otherUser.username || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-[#0d1c17] dark:text-white">
                          {otherUser.name || otherUser.username || 'Unknown User'}
                        </p>
                        {otherUser.username && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{otherUser.username}
                          </p>
                        )}
                      </div>
                    </div>
                    {otherUser.username && (
                      <button
                        onClick={() => router.push(`/profile/${otherUser.username}`)}
                        className="w-full px-4 py-2 bg-[#f5f8f7] dark:bg-white/5 hover:bg-[#e7f4f0] dark:hover:bg-white/10 rounded-lg text-sm font-medium text-[#0d1c17] dark:text-white transition-colors"
                      >
                        View Profile
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    User information not available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details Section - Moved to bottom */}
          <div className="mt-6 bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0d1c17] dark:text-white mb-2">
                  Booking Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Booking ID: <span className="font-mono text-sm">{booking._id}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-[#059467] hover:bg-[#047854] text-white rounded-full font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />

        {/* Cancel Modal */}
        {showCancelModal && (
          <ConfirmModal
            title="Cancel Booking"
            message="Are you sure you want to cancel this booking? This action cannot be undone."
            confirmText="Yes, Cancel"
            cancelText="No, Keep It"
            onConfirm={handleCancel}
            onCancel={() => setShowCancelModal(false)}
            type="decline"
          />
        )}

        {/* Issue Report Modal */}
        {showIssueModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white">Report Issue</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Describe the issue you're experiencing with this rental.
              </p>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#059467] focus:border-transparent bg-white dark:bg-[#0d1c17] text-[#0d1c17] dark:text-white resize-none"
                rows={4}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportIssue}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Confirmation Modal */}
        {showStatusChangeModal && (
          <ConfirmModal
            title="Update Rental Status"
            message={`Are you sure you want to change the status to "${pendingStatus.replace('_', ' ').toUpperCase()}"? The renter will be notified of this change.`}
            confirmText="Yes, Update Status"
            cancelText="Cancel"
            onConfirm={confirmStatusChange}
            onCancel={() => setShowStatusChangeModal(false)}
            type="confirm"
          />
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

export default BookingDetailsPage;
