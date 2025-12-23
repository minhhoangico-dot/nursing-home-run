import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../stores/authStore';

export const MainLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const getTitle = (pathname: string) => {
    if (pathname.includes('/dashboard')) return 'Tổng quan';
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="no-print h-full flex flex-col">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="no-print">
          <Header title={title} />
        </div>
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
          <Outlet />
        </div>
      </main>
    </div>
  );
};