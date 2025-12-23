import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export const useToast = () => {
  const addToast = (type: ToastType, title: string, message: string) => {
    const text = title ? `${title}: ${message}` : message;

    switch (type) {
      case 'success':
        toast.success(text);
        break;
      case 'error':
        toast.error(text);
        break;
      case 'warning':
      case 'info':
      default:
        toast(text, { icon: type === 'warning' ? '⚠️' : 'ℹ️' });
        break;
    }
  };
  return { addToast };
};

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
    </BrowserRouter>
  );
};