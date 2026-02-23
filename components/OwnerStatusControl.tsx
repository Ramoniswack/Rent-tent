'use client';

import { useState } from 'react';
import { Settings, Check, ChevronDown } from 'lucide-react';

interface OwnerStatusControlProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', description: 'Awaiting confirmation' },
  { value: 'confirmed', label: 'Confirmed', description: 'Booking confirmed' },
  { value: 'picked_up', label: 'Picked Up', description: 'Item collected by renter' },
  { value: 'in_use', label: 'In Use', description: 'Currently being used' },
  { value: 'returned', label: 'Returned', description: 'Item returned by renter' },
  { value: 'inspected', label: 'Inspected', description: 'Quality check completed' },
  { value: 'completed', label: 'Completed', description: 'Rental completed' },
  { value: 'cancelled', label: 'Cancelled', description: 'Booking cancelled' }
];

export default function OwnerStatusControl({ 
  currentStatus, 
  onStatusChange, 
  disabled = false 
}: OwnerStatusControlProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === currentStatus);

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setShowDropdown(false);
    onStatusChange(status);
  };

  return (
    <div className="bg-gradient-to-r from-[#059467]/10 to-[#047854]/10 dark:from-[#059467]/20 dark:to-[#047854]/20 rounded-2xl p-6 border-2 border-[#059467]/30 dark:border-[#059467]/40">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-[#059467]" />
        <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">
          Owner Controls
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Update the rental progress status as the booking moves through different stages.
      </p>

      <div className="relative">
        <label className="block text-sm font-semibold text-[#0d1c17] dark:text-white mb-2">
          Current Status
        </label>
        
        <button
          onClick={() => !disabled && setShowDropdown(!showDropdown)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0d1c17] border-2 border-[#e7f4f0] dark:border-white/10 rounded-lg transition-all ${
            disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-[#059467] dark:hover:border-[#059467] cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#059467]" />
            <div className="text-left">
              <p className="font-semibold text-[#0d1c17] dark:text-white">
                {currentStatusOption?.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentStatusOption?.description}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a2c26] border-2 border-[#e7f4f0] dark:border-white/10 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusSelect(status.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f8f7] dark:hover:bg-white/5 transition-colors ${
                    status.value === currentStatus ? 'bg-[#059467]/10 dark:bg-[#059467]/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status.value === currentStatus ? 'bg-[#059467]' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <div className="text-left">
                      <p className={`font-semibold text-sm ${
                        status.value === currentStatus 
                          ? 'text-[#059467]' 
                          : 'text-[#0d1c17] dark:text-white'
                      }`}>
                        {status.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {status.description}
                      </p>
                    </div>
                  </div>
                  {status.value === currentStatus && (
                    <Check className="w-5 h-5 text-[#059467]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 <span className="font-semibold">Tip:</span> Update the status as the rental progresses. 
          The renter will see the updated progress in real-time.
        </p>
      </div>
    </div>
  );
}
