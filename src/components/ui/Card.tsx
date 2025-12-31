import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card = ({ children, className = '', title, footer, noPadding = false }: CardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm md:text-base">{title}</h3>
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 md:p-6'}>{children}</div>
      {footer && <div className="px-4 md:px-6 py-3 md:py-4 bg-slate-50 border-t border-slate-100">{footer}</div>}
    </div>
  );
};