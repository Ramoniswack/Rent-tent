'use client';

import { X, MessageCircle, AlertTriangle, Clock, FileText } from 'lucide-react';

interface BookingActionButtonsProps {
  status: string;
  isRenter: boolean;
  onCancel?: () => void;
  onContactOwner?: () => void;
  onReportIssue?: () => void;
  onExtendRental?: () => void;
  onViewRefund?: () => void;
}

export default function BookingActionButtons({
  status,
  isRenter,
  onCancel,
  onContactOwner,
  onReportIssue,
  onExtendRental,
  onViewRefund
}: BookingActionButtonsProps) {
  
  const renderActions = () => {
    switch (status) {
      case 'pending':
        return (
          <>
            {isRenter && onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel Booking
              </button>
            )}
            {onContactOwner && (
              <button
                onClick={onContactOwner}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-full font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact {isRenter ? 'Owner' : 'Renter'}
              </button>
            )}
          </>
        );
      
      case 'confirmed':
        return (
          <>
            {onContactOwner && (
              <button
                onClick={onContactOwner}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-full font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact {isRenter ? 'Owner' : 'Renter'}
              </button>
            )}
          </>
        );
      
      case 'picked_up':
      case 'in_use':
        return (
          <>
            {onReportIssue && (
              <button
                onClick={onReportIssue}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Report Issue
              </button>
            )}
            {isRenter && onExtendRental && (
              <button
                onClick={onExtendRental}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition-colors"
              >
                <Clock className="w-4 h-4" />
                Extend Rental
              </button>
            )}
            {onContactOwner && (
              <button
                onClick={onContactOwner}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-full font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact {isRenter ? 'Owner' : 'Renter'}
              </button>
            )}
          </>
        );
      
      case 'returned':
      case 'inspected':
        return (
          <>
            {isRenter && onViewRefund && (
              <button
                onClick={onViewRefund}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-full font-bold transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Refund Status
              </button>
            )}
            {onContactOwner && (
              <button
                onClick={onContactOwner}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#059467] text-[#059467] hover:bg-[#059467] hover:text-white rounded-full font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact {isRenter ? 'Owner' : 'Renter'}
              </button>
            )}
          </>
        );
      
      case 'completed':
        return (
          <>
            {onContactOwner && (
              <button
                onClick={onContactOwner}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#059467] text-[#059467] hover:bg-[#059467] hover:text-white rounded-full font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact {isRenter ? 'Owner' : 'Renter'}
              </button>
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {renderActions()}
    </div>
  );
}
