'use client';

import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmToastProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmToast({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel
}: ConfirmToastProps) {
  const icons = {
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    error: <X className="w-6 h-6 text-red-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />
  };

  const buttonStyles = {
    warning: 'bg-amber-500 hover:bg-amber-600',
    error: 'bg-red-500 hover:bg-red-600',
    info: 'bg-blue-500 hover:bg-blue-600'
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Toast Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {icons[type]}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${buttonStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}