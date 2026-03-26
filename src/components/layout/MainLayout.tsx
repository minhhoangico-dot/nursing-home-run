import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getModuleTitleByPath } from '../../constants/modules';
import { useAuthStore } from '../../stores/authStore';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const title = getModuleTitleByPath(location.pathname);

  const handleMenuOpen = () => setMobileMenuOpen(true);
  const handleMenuClose = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200 lg:hidden"
          onClick={handleMenuClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`
          no-print fixed z-50 flex h-full flex-col transition-transform duration-300 ease-in-out lg:relative
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar onClose={handleMenuClose} />
      </div>

      <main className="flex w-full flex-1 flex-col overflow-hidden">
        <div className="no-print">
          <Header title={title} onMenuClick={handleMenuOpen} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 print:overflow-visible print:p-0 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
