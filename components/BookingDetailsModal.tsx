'use client';

import { X, Calendar, MapPin, User, DollarSign, Package, Clock, FileText, Download, QrCode } from 'lucide-react';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface BookingDetailsModalProps {
  booking: any;
  isOwner: boolean;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, isOwner, onClose }: BookingDetailsModalProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const gear = booking.gear;
  const otherUser = isOwner ? booking.renter : booking.owner;

  useEffect(() => {
    // Generate QR code
    if (qrCanvasRef.current) {
      const bookingData = {
        id: booking._id,
        gear: gear.title,
        dates: `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`,
        amount: booking.totalPrice,
        status: booking.status
      };
      
      QRCode.toCanvas(
        qrCanvasRef.current,
        JSON.stringify(bookingData),
        { width: 200, margin: 2 },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [booking, gear]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-[#fef3c7]', text: 'text-[#f59e0b]', label: 'Pending' },
      confirmed: { bg: 'bg-[#d1fae5]', text: 'text-[#059467]', label: 'Confirmed' },
      active: { bg: 'bg-[#dbeafe]', text: 'text-[#3b82f6]', label: 'Active' },
      completed: { bg: 'bg-[#f1f5f9]', text: 'text-[#64748b]', label: 'Completed' },
      cancelled: { bg: 'bg-[#fee2e2]', text: 'text-[#ef4444]', label: 'Cancelled' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
RENTAL RECEIPT
=====================================
Booking ID: ${booking._id}
Date: ${new Date().toLocaleDateString()}

ITEM DETAILS
-------------------------------------
${gear.title}
Category: ${gear.category}
Condition: ${gear.condition}

RENTAL PERIOD
-------------------------------------
Start: ${formatDate(booking.startDate)}
End: ${formatDate(booking.endDate)}
Duration: ${booking.totalDays} days

PARTIES
-------------------------------------
${isOwner ? 'Renter' : 'Owner'}: ${otherUser?.name || 'Unknown'}
Email: ${otherUser?.email || 'N/A'}

PAYMENT DETAILS
-------------------------------------
Rental Rate: $${(booking.totalPrice / booking.totalDays).toFixed(2)}/day
Total Days: ${booking.totalDays}
Subtotal: $${booking.totalPrice.toFixed(2)}
Deposit: $${booking.deposit.toFixed(2)}
-------------------------------------
TOTAL: $${(booking.totalPrice + booking.deposit).toFixed(2)}

PICKUP LOCATION
-------------------------------------
${booking.pickupLocation}

STATUS: ${booking.status.toUpperCase()}
=====================================
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${booking._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const badge = getStatusBadge(booking.status);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1a2c26] rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#1a2c26] border-b border-[#e7f4f0] dark:border-white/10 p-6 rounded-t-2xl z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#0d1c17] dark:text-white mb-2">
                Booking Details
              </h2>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-xs font-bold uppercase tracking-wider`}>
                  {badge.label}
                </span>
                <span className="text-xs text-[#0d1c17]/50 dark:text-white/50">
                  ID: {booking._id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#0d1c17]/40 dark:text-white/40 hover:text-[#0d1c17] dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Gear Details */}
          <div className="bg-[#f5f8f7] dark:bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-[#059467]" />
              <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">Item Details</h3>
            </div>
            <div className="flex gap-4">
              {gear.images?.[0] && (
                <img
                  src={gear.images[0]}
                  alt={gear.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-bold text-[#0d1c17] dark:text-white mb-1">{gear.title}</h4>
                <p className="text-sm text-[#0d1c17]/70 dark:text-white/70 mb-2 line-clamp-2">
                  {gear.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-white dark:bg-white/10 rounded-full text-[#0d1c17] dark:text-white">
                    {gear.category}
                  </span>
                  <span className="px-2 py-1 bg-white dark:bg-white/10 rounded-full text-[#0d1c17] dark:text-white">
                    {gear.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Rental Period */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-[#059467]" />
                  <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">Rental Period</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Start Date:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">{formatDate(booking.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">End Date:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">{formatDate(booking.endDate)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#e7f4f0] dark:border-white/10">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Duration:</span>
                    <span className="font-bold text-[#059467]">{booking.totalDays} days</span>
                  </div>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-[#059467]" />
                  <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">Pickup Location</h3>
                </div>
                <p className="text-sm text-[#0d1c17] dark:text-white bg-[#f5f8f7] dark:bg-white/5 p-3 rounded-lg">
                  {booking.pickupLocation}
                </p>
              </div>

              {/* Other Party Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-[#059467]" />
                  <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">
                    {isOwner ? 'Renter' : 'Owner'} Information
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    {otherUser?.profilePicture && (
                      <img
                        src={otherUser.profilePicture}
                        alt={otherUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-[#0d1c17] dark:text-white">{otherUser?.name || 'Unknown'}</p>
                      <p className="text-[#0d1c17]/70 dark:text-white/70">{otherUser?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Payment Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-[#059467]" />
                  <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">Payment Details</h3>
                </div>
                <div className="bg-[#f5f8f7] dark:bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Rate per day:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">
                      ${(booking.totalPrice / booking.totalDays).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Number of days:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">{booking.totalDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Subtotal:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">${booking.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Security Deposit:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">${booking.deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-[#059467]/20">
                    <span className="font-bold text-[#0d1c17] dark:text-white">Total Amount:</span>
                    <span className="font-black text-xl text-[#059467]">
                      ${(booking.totalPrice + booking.deposit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Ticket */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-[#059467]" />
                  <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">Booking Ticket</h3>
                </div>
                <div className="bg-[#f5f8f7] dark:bg-white/5 rounded-xl p-4 flex flex-col items-center">
                  <canvas ref={qrCanvasRef} className="mb-3" />
                  <p className="text-xs text-center text-[#0d1c17]/70 dark:text-white/70">
                    Scan this QR code for quick booking verification
                  </p>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-[#059467]" />
                    <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">Notes</h3>
                  </div>
                  <p className="text-sm text-[#0d1c17] dark:text-white bg-[#f5f8f7] dark:bg-white/5 p-3 rounded-lg">
                    {booking.notes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-[#059467]" />
                  <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">Timestamps</h3>
                </div>
                <div className="space-y-2 text-xs text-[#0d1c17]/70 dark:text-white/70">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(booking.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(booking.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-[#1a2c26] border-t border-[#e7f4f0] dark:border-white/10 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#059467] text-white font-bold text-sm hover:bg-[#047854] transition-colors shadow-lg shadow-[#059467]/20"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17] dark:text-white font-medium text-sm hover:bg-[#f8fcfb] dark:hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
