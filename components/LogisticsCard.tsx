'use client';

import { MapPin, Navigation, Phone, Mail, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface LogisticsCardProps {
  location: string;
  pickupInstructions?: string;
  returnInstructions?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  onGetDirections?: () => void;
  onContactOwner?: () => void;
}

export default function LogisticsCard({
  location,
  pickupInstructions,
  returnInstructions,
  ownerPhone,
  ownerEmail,
  onGetDirections,
  onContactOwner
}: LogisticsCardProps) {
  const [showPickupInstructions, setShowPickupInstructions] = useState(false);
  const [showReturnInstructions, setShowReturnInstructions] = useState(false);

  return (
    <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-[#059467]" />
        <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Pickup & Return</h2>
      </div>

      {/* Location */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Location</p>
        <p className="font-semibold text-[#0d1c17] dark:text-white mb-3">{location}</p>
        
        {onGetDirections && (
          <button
            onClick={onGetDirections}
            className="flex items-center gap-2 px-4 py-2 bg-[#059467] hover:bg-[#047854] text-white rounded-full text-sm font-medium transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </button>
        )}
      </div>

      {/* Pickup Instructions */}
      {pickupInstructions && (
        <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowPickupInstructions(!showPickupInstructions)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#059467]" />
              <span className="font-semibold text-[#0d1c17] dark:text-white">Pickup Instructions</span>
            </div>
            {showPickupInstructions ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {showPickupInstructions && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {pickupInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Return Instructions */}
      {returnInstructions && (
        <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowReturnInstructions(!showReturnInstructions)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#059467]" />
              <span className="font-semibold text-[#0d1c17] dark:text-white">Return Instructions</span>
            </div>
            {showReturnInstructions ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {showReturnInstructions && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {returnInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Contact Options */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact Options</p>
        <div className="space-y-2">
          {onContactOwner && (
            <button
              onClick={onContactOwner}
              className="flex items-center gap-2 w-full px-4 py-2 bg-[#f5f8f7] dark:bg-white/5 hover:bg-[#e7f4f0] dark:hover:bg-white/10 rounded-lg text-sm font-medium text-[#0d1c17] dark:text-white transition-colors"
            >
              <Mail className="w-4 h-4 text-[#059467]" />
              Message Owner
            </button>
          )}
          {ownerPhone && (
            <a
              href={`tel:${ownerPhone}`}
              className="flex items-center gap-2 w-full px-4 py-2 bg-[#f5f8f7] dark:bg-white/5 hover:bg-[#e7f4f0] dark:hover:bg-white/10 rounded-lg text-sm font-medium text-[#0d1c17] dark:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-[#059467]" />
              Call Owner
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
