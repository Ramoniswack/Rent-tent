'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '@/components/Toast';
import ConfirmToast from '@/components/ConfirmToast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ConfirmToastOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showConfirm: (options: ConfirmToastOptions) => void;
  hideToast: (id: string) => void;
  hideConfirm: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmToastOptions | null>(null);

  const showToast = (message: string, type: ToastType = 'success', duration: number = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const showConfirm = (options: ConfirmToastOptions) => {
    setConfirmDialog(options);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const hideConfirm = () => {
    setConfirmDialog(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm, hideToast, hideConfirm }}>
      {children}
      
      {/* Render toasts */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ 
              transform: `translateY(${index * 10}px)`,
              zIndex: 9999 - index 
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => hideToast(toast.id)}
            />
          </div>
        ))}
      </div>

      {/* Render confirmation dialog */}
      {confirmDialog && (
        <ConfirmToast
          {...confirmDialog}
          onConfirm={() => {
            confirmDialog.onConfirm();
            hideConfirm();
          }}
          onCancel={() => {
            confirmDialog.onCancel?.();
            hideConfirm();
          }}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Convenience functions for common toast types
export const toast = {
  success: (message: string, duration?: number) => {
    const context = useContext(ToastContext);
    context?.showToast(message, 'success', duration);
  },
  error: (message: string, duration?: number) => {
    const context = useContext(ToastContext);
    context?.showToast(message, 'error', duration);
  },
  info: (message: string, duration?: number) => {
    const context = useContext(ToastContext);
    context?.showToast(message, 'info', duration);
  },
  warning: (message: string, duration?: number) => {
    const context = useContext(ToastContext);
    context?.showToast(message, 'warning', duration);
  },
  confirm: (options: ConfirmToastOptions) => {
    const context = useContext(ToastContext);
    context?.showConfirm(options);
  }
};