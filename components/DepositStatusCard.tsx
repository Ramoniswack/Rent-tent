'use client';

import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatNPR } from '../lib/currency';

interface DepositStatusCardProps {
  depositAmount: number;
  depositStatus: 'held' | 'refunded' | 'partially_refunded';
  refundDate?: Date;
  refundAmount?: number;
  deductions?: Array<{
    reason: string;
    amount: number;
  }>;
}

export default function DepositStatusCard({
  depositAmount,
  depositStatus,
  refundDate,
  refundAmount,
  deductions
}: DepositStatusCardProps) {
  const getStatusConfig = () => {
    switch (depositStatus) {
      case 'held':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          label: 'Deposit Held',
          message: 'Refundable upon undamaged return'
        };
      case 'refunded':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          label: 'Deposit Refunded',
          message: refundDate ? `Refunded on ${new Date(refundDate).toLocaleDateString()}` : 'Refund processed'
        };
      case 'partially_refunded':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          label: 'Partially Refunded',
          message: 'Some deductions applied'
        };
      default:
        return {
          icon: Shield,
          color: 'text-gray-600',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          label: 'Security Deposit',
          message: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl p-6 border-2 ${config.border} ${config.bg}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-full ${config.bg}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${config.color}`}>{config.label}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{config.message}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Deposit Amount:</span>
          <span className="font-bold text-lg text-[#0d1c17] dark:text-white">
            {formatNPR(depositAmount)}
          </span>
        </div>

        {depositStatus === 'partially_refunded' && refundAmount !== undefined && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Refunded:</span>
              <span className="font-semibold text-green-600">
                {formatNPR(refundAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Deducted:</span>
              <span className="font-semibold text-red-600">
                {formatNPR(depositAmount - refundAmount)}
              </span>
            </div>
          </>
        )}

        {deductions && deductions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deductions:</p>
            <div className="space-y-2">
              {deductions.map((deduction, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{deduction.reason}</span>
                  <span className="font-semibold text-red-600">-{formatNPR(deduction.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {depositStatus === 'held' && refundDate && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Estimated refund date: <span className="font-semibold">{new Date(refundDate).toLocaleDateString()}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
