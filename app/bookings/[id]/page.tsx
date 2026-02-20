'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Toast from '../../../components/Toast';
import { bookingAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { formatNPR } from '../../../lib/currency';
import { getCityName } from '../../../lib/location';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Package,
  Clock,
  FileText,
  Download,
  QrCode,
  Loader2,
  Mail,
  Phone
} from 'lucide-react';

function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBookingDetails();
  }, [user, params.id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      // Fetch from both endpoints and find the matching booking
      const [myBookings, gearBookings] = await Promise.all([
        bookingAPI.getMyBookings(),
        bookingAPI.getGearBookings()
      ]);
      
      const allBookings = [...myBookings, ...gearBookings];
      const foundBooking = allBookings.find(b => b._id === params.id);
      
      if (!foundBooking) {
        setToast({ message: 'Booking not found', type: 'error' });
        setTimeout(() => router.push('/rentals/dashboard'), 2000);
        return;
      }
      
      setBooking(foundBooking);
      
      // Generate QR code
      setTimeout(() => {
        if (qrCanvasRef.current) {
          const bookingData = {
            id: foundBooking._id,
            gear: foundBooking.gear.title,
            dates: `${new Date(foundBooking.startDate).toLocaleDateString()} - ${new Date(foundBooking.endDate).toLocaleDateString()}`,
            amount: foundBooking.totalPrice,
            status: foundBooking.status
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
      }, 100);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      setToast({ message: 'Failed to load booking details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleDownloadPDF = async () => {
    if (!booking) return;

    try {
      const doc = new jsPDF();
      const gear = booking.gear;
      const isOwner = gear.owner._id === user?._id || gear.owner === user?._id;
      const otherUser = isOwner ? booking.renter : booking.owner;
      
      // Header
      doc.setFillColor(5, 148, 103);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RENTAL RECEIPT', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Booking ID: ${booking._id}`, 105, 30, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      let yPos = 55;
      
      // Status Badge
      const badge = getStatusBadge(booking.status);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Status: ${badge.label.toUpperCase()}`, 20, yPos);
      yPos += 15;
      
      // Item Details Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ITEM DETAILS', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Item: ${gear.title}`, 20, yPos);
      yPos += 6;
      doc.text(`Category: ${gear.category}`, 20, yPos);
      yPos += 6;
      doc.text(`Condition: ${gear.condition}`, 20, yPos);
      yPos += 12;
      
      // Rental Period Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RENTAL PERIOD', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Start Date: ${formatDate(booking.startDate)}`, 20, yPos);
      yPos += 6;
      doc.text(`End Date: ${formatDate(booking.endDate)}`, 20, yPos);
      yPos += 6;
      doc.text(`Duration: ${booking.totalDays} days`, 20, yPos);
      yPos += 12;
      
      // Parties Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PARTIES', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${isOwner ? 'Renter' : 'Owner'}: ${otherUser?.name || 'Unknown'}`, 20, yPos);
      yPos += 6;
      doc.text(`Email: ${otherUser?.email || 'N/A'}`, 20, yPos);
      yPos += 12;
      
      // Payment Details Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Rental Rate: ${formatNPR((booking.totalPrice / booking.totalDays))}/day`, 20, yPos);
      yPos += 6;
      doc.text(`Total Days: ${booking.totalDays}`, 20, yPos);
      yPos += 6;
      doc.text(`Subtotal: ${formatNPR(booking.totalPrice)}`, 20, yPos);
      yPos += 6;
      doc.text(`Security Deposit: ${formatNPR(booking.deposit)}`, 20, yPos);
      yPos += 8;
      
      // Total line
      doc.setDrawColor(5, 148, 103);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 6;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL: ${formatNPR((booking.totalPrice + booking.deposit))}`, 20, yPos);
      yPos += 12;
      
      // Pickup Location
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PICKUP LOCATION', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const locationLines = doc.splitTextToSize(getCityName(booking.pickupLocation), 170);
      doc.text(locationLines, 20, yPos);
      yPos += (locationLines.length * 6) + 10;
      
      // QR Code
      if (qrCanvasRef.current) {
        const qrImage = qrCanvasRef.current.toDataURL('image/png');
        doc.addImage(qrImage, 'PNG', 155, yPos, 35, 35);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for using our rental service!', 105, 280, { align: 'center' });
      doc.text('For support, contact: support@rentalservice.com', 105, 285, { align: 'center' });
      
      // Save PDF
      doc.save(`receipt-${booking._id}.pdf`);
      setToast({ message: 'Receipt downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('PDF generation error:', error);
      setToast({ message: 'Failed to generate PDF', type: 'error' });
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

  if (!booking) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#0d1c17] dark:text-white mb-2">Booking Not Found</h2>
            <button 
              onClick={() => router.push('/rentals/dashboard')}
              className="text-[#059467] hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  const gear = booking.gear;
  const isOwner = gear.owner._id === user?._id || gear.owner === user?._id;
  const otherUser = isOwner ? booking.renter : booking.owner;
  const badge = getStatusBadge(booking.status);

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
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 md:py-10 lg:px-20">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#059467] hover:text-[#047854] font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 mb-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#0d1c17] dark:text-white mb-2">
                  Booking Details
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-xs font-bold uppercase tracking-wider`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-[#0d1c17]/50 dark:text-white/50">
                    ID: {booking._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#059467] text-white font-bold text-sm hover:bg-[#047854] transition-colors shadow-lg shadow-[#059467]/20"
              >
                <Download className="w-4 h-4" />
                Download Receipt (PDF)
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gear Details */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Item Details</h2>
                </div>
                <div className="flex gap-4">
                  {gear.images?.[0] && (
                    <img
                      src={gear.images[0]}
                      alt={gear.title}
                      className="w-32 h-32 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white mb-2">{gear.title}</h3>
                    <p className="text-sm text-[#0d1c17]/70 dark:text-white/70 mb-3">
                      {gear.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-[#f5f8f7] dark:bg-white/5 rounded-full text-xs font-medium text-[#0d1c17] dark:text-white">
                        {gear.category}
                      </span>
                      <span className="px-3 py-1 bg-[#f5f8f7] dark:bg-white/5 rounded-full text-xs font-medium text-[#0d1c17] dark:text-white">
                        {gear.condition}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Rental Period</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#0d1c17]/50 dark:text-white/50 mb-1">Start Date</p>
                    <p className="font-semibold text-[#0d1c17] dark:text-white">{formatDate(booking.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#0d1c17]/50 dark:text-white/50 mb-1">End Date</p>
                    <p className="font-semibold text-[#0d1c17] dark:text-white">{formatDate(booking.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#0d1c17]/50 dark:text-white/50 mb-1">Duration</p>
                    <p className="font-bold text-[#059467]">{booking.totalDays} days</p>
                  </div>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Pickup Location</h2>
                </div>
                <p className="text-[#0d1c17] dark:text-white">{booking.pickupLocation}</p>
              </div>

              {/* Other Party Info */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">
                    {isOwner ? 'Renter' : 'Owner'} Information
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  {otherUser?.profilePicture && (
                    <img
                      src={otherUser.profilePicture}
                      alt={otherUser.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold text-lg text-[#0d1c17] dark:text-white">{otherUser?.name || 'Unknown'}</p>
                    <div className="flex items-center gap-2 text-sm text-[#0d1c17]/70 dark:text-white/70 mt-1">
                      <Mail className="w-4 h-4" />
                      <span>{otherUser?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment & QR */}
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Payment</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Rate/day:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">
                      {formatNPR((booking.totalPrice / booking.totalDays))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Days:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">{booking.totalDays}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Subtotal:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">{formatNPR(booking.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0d1c17]/70 dark:text-white/70">Deposit:</span>
                    <span className="font-semibold text-[#0d1c17] dark:text-white">{formatNPR(booking.deposit)}</span>
                  </div>
                  <div className="pt-3 border-t-2 border-[#059467]/20">
                    <div className="flex justify-between">
                      <span className="font-bold text-[#0d1c17] dark:text-white">Total:</span>
                      <span className="font-black text-2xl text-[#059467]">
                        {formatNPR((booking.totalPrice + booking.deposit))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Booking Ticket</h2>
                </div>
                <div className="flex flex-col items-center">
                  <canvas ref={qrCanvasRef} className="mb-3" />
                  <p className="text-xs text-center text-[#0d1c17]/70 dark:text-white/70">
                    Scan for quick verification
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#059467]" />
                  <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Timestamps</h2>
                </div>
                <div className="space-y-2 text-xs text-[#0d1c17]/70 dark:text-white/70">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(booking.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span>{new Date(booking.updatedAt).toLocaleString()}</span>
                  </div>
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

export default function ProtectedBookingDetailsPage() {
  return (
    <ProtectedRoute>
      <BookingDetailsPage />
    </ProtectedRoute>
  );
}
