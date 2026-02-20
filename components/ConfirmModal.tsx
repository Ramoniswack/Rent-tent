'use client';

import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'decline';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'confirm',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1a2c26] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[#0d1c17]/40 dark:text-white/40 hover:text-[#0d1c17] dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
          type === 'confirm' 
            ? 'bg-[#059467]/10 text-[#059467]' 
            : 'bg-[#ef4444]/10 text-[#ef4444]'
        }`}>
          {type === 'confirm' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#0d1c17]/70 dark:text-white/70 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-full border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17] dark:text-white font-medium text-sm hover:bg-[#f8fcfb] dark:hover:bg-white/5 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-full font-bold text-sm text-white transition-colors shadow-lg ${
              type === 'confirm'
                ? 'bg-[#059467] hover:bg-[#047854] shadow-[#059467]/20'
                : 'bg-[#ef4444] hover:bg-[#dc2626] shadow-[#ef4444]/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
