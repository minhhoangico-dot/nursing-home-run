import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen?: boolean; // Optional if conditionally rendered by parent
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  fullScreenMobile?: boolean; // New: full screen on mobile devices
}

export const Modal = ({
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
  fullScreenMobile = false
}: ModalProps) => {
  return (
    <div className={`fixed inset-0 bg-black/50 z-50 animate-fade-in
      ${fullScreenMobile
        ? 'flex items-end md:items-center md:justify-center md:p-4'
        : 'flex items-center justify-center p-4'
      }`}
    >
      <div className={`bg-white shadow-xl w-full flex flex-col
        ${fullScreenMobile
          ? `h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-xl ${maxWidth} animate-slide-up md:animate-none`
          : `rounded-xl max-h-[90vh] ${maxWidth}`
        }
      `}>
        {/* Header with larger close button for touch */}
        <div className={`p-4 md:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50
          ${fullScreenMobile ? 'rounded-none md:rounded-t-xl safe-area-top' : 'rounded-t-xl'}
        `}>
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors touch-target flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5 md:w-5 md:h-5" />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className={`p-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-2
            ${fullScreenMobile ? 'rounded-none md:rounded-b-xl safe-area-bottom' : 'rounded-b-xl'}
          `}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};