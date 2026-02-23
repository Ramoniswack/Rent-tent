'use client';

import { AlertCircle, Shield, XCircle, Clock } from 'lucide-react';
import { formatNPR } from '../lib/currency';

interface RentalTermsCardProps {
  lateFeePerDay?: number;
  protectionPlan?: {
    active: boolean;
    coverage?: number;
  };
  cancellationDeadline?: Date;
  cancellationFee?: number;
}

export default function RentalTermsCard({
  lateFeePerDay = 50,
  protectionPlan,
  cancellationDeadline,
  cancellationFee
}: RentalTermsCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-[#059467]" />
        <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white">Terms & Policies</h2>
      </div>

      <div className="space-y-4">
        {/* Late Fee Policy */}
        <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-orange-900 dark:text-orange-200">Late Return Policy</p>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Late returns are subject to a <span className="font-bold">{formatNPR(lateFeePerDay)}/day</span> penalty
            </p>
          </div>
        </div>

        {/* Protection Plan */}
        {protectionPlan && (
          <div className={`flex items-start gap-3 p-3 rounded-lg ${
            protectionPlan.active 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-gray-50 dark:bg-gray-900/20'
          }`}>
            <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              protectionPlan.active ? 'text-green-600' : 'text-gray-400'
            }`} />
            <div>
              <p className={`font-semibold text-sm ${
                protectionPlan.active 
                  ? 'text-green-900 dark:text-green-200' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                Protection Plan: {protectionPlan.active ? 'Active' : 'Not Active'}
              </p>
              {protectionPlan.active && protectionPlan.coverage && (
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Coverage up to <span className="font-bold">{formatNPR(protectionPlan.coverage)}</span>
                </p>
              )}
              {!protectionPlan.active && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  No protection coverage for this rental
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cancellation Policy */}
        {cancellationDeadline && (
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-red-900 dark:text-red-200">Cancellation Policy</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Free cancellation until <span className="font-bold">{new Date(cancellationDeadline).toLocaleDateString()}</span>
              </p>
              {cancellationFee && (
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Cancellation fee after deadline: <span className="font-bold">{formatNPR(cancellationFee)}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* General Terms */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By proceeding with this rental, you agree to our terms of service and rental agreement. 
            Damage to equipment may result in additional charges.
          </p>
        </div>
      </div>
    </div>
  );
}
