import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Users, BedDouble,
  CreditCard, Package, Settings as SettingsIcon, LogOut,
  Printer, BarChart3, AlertTriangle, CalendarDays, Pill, BookOpen, Utensils, UserCheck, Wrench, Smile,
  ClipboardList, Droplets, Syringe, Scale
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE', 'CAREGIVER'] },
    { id: 'shift_handover', label: 'Giao ca', path: '/shift-handover', icon: ClipboardList, roles: ['ADMIN', 'SUPERVISOR'] },
    { id: 'visitors', label: 'Khách thăm', path: '/visitors', icon: UserCheck, roles: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE', 'CAREGIVER'] },
    // { id: 'diabetes', label: 'Đường huyết', path: '/diabetes-monitoring', icon: Droplets, roles: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE'] },
    { id: 'daily_monitoring', label: 'Theo dõi ngày', path: '/daily-monitoring', icon: ClipboardList, roles: ['ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE'] },
    { id: 'procedures', label: 'Thủ thuật', path: '/procedures', icon: Syringe, roles: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE'] },
    { id: 'nutrition', label: 'Dinh dưỡng', path: '/nutrition', icon: Utensils, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'SUPERVISOR', 'CAREGIVER'] },
    { id: 'residents', label: 'Danh sách NCT', path: '/residents', icon: Users, roles: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE'] },
    { id: 'rooms', label: 'Sơ đồ phòng', path: '/rooms', icon: BedDouble, roles: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE'] },
    { id: 'maintenance', label: 'Bảo trì', path: '/maintenance', icon: Wrench, roles: ['ADMIN', 'SUPERVISOR', 'ACCOUNTANT', 'DOCTOR'] },
    { id: 'incidents', label: 'Sự cố & An toàn', path: '/incidents', icon: AlertTriangle, roles: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE', 'CAREGIVER'] },
    { id: 'forms', label: 'In biểu mẫu', path: '/forms', icon: Printer, roles: ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE'] },
    { id: 'finance', label: 'Tài chính', path: '/finance', icon: CreditCard, roles: ['ADMIN', 'ACCOUNTANT', 'DOCTOR'] },
    { id: 'inventory', label: 'Kho & Vật tư', path: '/inventory', icon: Package, roles: ['ADMIN', 'ACCOUNTANT', 'SUPERVISOR', 'DOCTOR'] },
    { id: 'settings', label: 'Cài đặt', path: '/settings', icon: SettingsIcon, roles: ['ADMIN', 'ACCOUNTANT', 'SUPERVISOR'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  const roleLabels: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    DOCTOR: 'Bác sĩ',
    SUPERVISOR: 'Trưởng tầng',
    ACCOUNTANT: 'Kế toán',
    NURSE: 'Điều dưỡng',
    CAREGIVER: 'Hộ lý'
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-teal-600 p-2 rounded">
          <Activity className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg">FDC System</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredMenu.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
              : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{roleLabels[user.role] || user.role}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded">
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </div>
  );
};