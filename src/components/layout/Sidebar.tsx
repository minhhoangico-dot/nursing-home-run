import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BedDouble,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Pill,
  Printer,
  Settings as SettingsIcon,
  Syringe,
  UserCheck,
  Users,
  Utensils,
  Wrench,
  X,
} from 'lucide-react';
import { MODULE_REGISTRY } from '@/src/constants/moduleRegistry';
import { useFacilityBranding } from '@/src/hooks/useFacilityBranding';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import { useAuthStore } from '@/src/stores/authStore';
import type { ModuleKey } from '@/src/types/appSettings';
import { fallbackFacilityLogo } from '@/src/utils/facilityBranding';
import { getRoleModuleAccess } from '@/src/utils/modulePermissions';

interface SidebarProps {
  onClose?: () => void;
}

interface MenuItem {
  key: ModuleKey;
  label: string;
  icon: LucideIcon;
}

interface DashboardMenuItem {
  key: 'dashboard';
  label: string;
  icon: LucideIcon;
  path: string;
}

const MENU_ITEMS: Array<MenuItem | DashboardMenuItem> = [
  { key: 'dashboard', label: 'Hôm nay', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'visitors', label: 'Khách thăm', icon: UserCheck },
  { key: 'dailyMonitoring', label: 'Theo dõi ngày', icon: ClipboardList },
  { key: 'medications', label: 'Thuốc', icon: Pill },
  { key: 'procedures', label: 'Thủ thuật', icon: Syringe },
  { key: 'nutrition', label: 'Dinh dưỡng', icon: Utensils },
  { key: 'residents', label: 'Danh sách NCT', icon: Users },
  { key: 'rooms', label: 'Sơ đồ phòng', icon: BedDouble },
  { key: 'maintenance', label: 'Bảo trì', icon: Wrench },
  { key: 'incidents', label: 'Sự cố & An toàn', icon: AlertTriangle },
  { key: 'forms', label: 'In biểu mẫu', icon: Printer },
  { key: 'finance', label: 'Tài chính', icon: CreditCard },
  { key: 'settings', label: 'Cài đặt', icon: SettingsIcon },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  DOCTOR: 'Bác sĩ',
  SUPERVISOR: 'Trưởng tầng',
  ACCOUNTANT: 'Kế toán',
  NURSE: 'Điều dưỡng',
  CAREGIVER: 'Hộ lý',
};

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const { permissions } = useAppSettingsStore();
  const branding = useFacilityBranding();

  if (!user) return null;

  const filteredMenu = MENU_ITEMS.filter((item) => {
    if (item.key === 'dashboard') {
      return true;
    }

    if (!MODULE_REGISTRY[item.key].nav) {
      return false;
    }

    return getRoleModuleAccess(user.role, permissions, item.key).visible;
  });

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
      <div className="p-4 lg:p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
            <img
              src={branding.logoSrc}
              alt={`Logo ${branding.name}`}
              className="h-full w-full object-contain p-1.5"
              onError={(event) => fallbackFacilityLogo(event.currentTarget)}
            />
          </div>
          <div className="min-w-0">
            <span className="block font-bold text-sm leading-tight truncate">{branding.name}</span>
            <span className="block text-[11px] text-slate-400">Trang chủ</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 lg:px-4 py-4 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.key}
            to={item.key === 'dashboard' ? item.path : MODULE_REGISTRY[item.key].path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3.5 lg:py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{ROLE_LABELS[user.role] || user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </div>
  );
};
