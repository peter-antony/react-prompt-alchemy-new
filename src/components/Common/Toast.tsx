import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isError?: boolean;
  open: boolean;
  onClose: () => void;
  duration?: number; // ms, optional
}

const Toast: React.FC<ToastProps> = ({
  message,
  isError = false,
  open,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      className={`
        fixed top-6 left-1/2 transform -translate-x-1/2 z-50
        flex items-center justify-center gap-2 px-5 py-3 rounded-lg shadow-lg
        ${isError ? 'bg-red-100 border border-red-400' : 'bg-green-100 border border-green-400'}
        w-auto max-w-[90vw]
      `}
      role="alert"
    >
      <span>
        {isError ? (
          <AlertCircle className="text-red-500 w-5 h-5" />
        ) : (
          <CheckCircle className="text-green-600 w-5 h-5" />
        )}
      </span>
      <span className={`flex-1 text-sm ${isError ? 'text-red-800' : 'text-green-800'} text-center`}>
        {message}
      </span>
    </div>
  );
};

export default Toast; 