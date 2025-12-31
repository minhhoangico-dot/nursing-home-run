import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../stores/authStore';

export const MainLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const getTitle = (pathname: string) => {
    // if (pathname.includes('/dashboard')) return 'Tổng quan';
    if (pathname.includes('/activities')) return 'Hoạt động & Sự kiện';
    if (pathname.includes('/handover')) return 'Sổ giao ban & Trực nhật';
    if (pathname.includes('/schedule')) return 'Lịch trực & Phân công';
    if (pathname.includes('/medication')) return 'Cấp phát thuốc';
    if (pathname.includes('/nutrition')) return 'Quản lý Dinh dưỡng & Suất ăn';
    if (pathname.includes('/visitors')) return 'Quản lý Khách thăm';
    if (pathname.includes('/residents')) return 'Danh sách NCT';
    if (pathname.includes('/rooms')) return 'Sơ đồ phòng';
    if (pathname.includes('/maintenance')) return 'Bảo trì & Cơ sở vật chất';
    if (pathname.includes('/incidents')) return 'Sự cố & An toàn';
    if (pathname.includes('/forms')) return 'In biểu mẫu';
    if (pathname.includes('/finance')) return 'Tài chính';
    if (pathname.includes('/inventory')) return 'Kho & Vật tư';
    if (pathname.includes('/reports')) return 'Báo cáo';
    if (pathname.includes('/settings')) return 'Cài đặt';
    return 'Chi tiết';
  };

  const title = getTitle(location.pathname);

  const handleMenuOpen = () => setMobileMenuOpen(true);
  const handleMenuClose = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={handleMenuClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - hidden on mobile by default, slides in when menu is open */}
      <div className={`
        no-print h-full flex flex-col
        fixed lg:relative z-50
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={handleMenuClose} />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="no-print">
          <Header title={title} onMenuClick={handleMenuOpen} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <Outlet />
        </div>
      </main>
    </div>
  );
};