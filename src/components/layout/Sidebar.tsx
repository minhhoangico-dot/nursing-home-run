import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  BedDouble,
  ClipboardList,
  CreditCard,
  LogOut,
  Printer,
  Settings as SettingsIcon,
  Syringe,
  UserCheck,
  Users,
  Utensils,
  Wrench,
  X,
} from 'lucide-react';
import { getSidebarModulesForRole, type ModuleKey } from '../../constants/modules';
import { useAuthStore } from '../../stores/authStore';
import { useRoomConfigStore } from '../../stores/roomConfigStore';
import { fallbackFacilityLogo, getFacilityBranding } from '../../utils/facilityBranding';
import { usePermissionStore } from '../../stores/permissionStore';

interface SidebarProps {
  onClose?: () => void;
}

const MODULE_ICONS: Partial<Record<ModuleKey, LucideIcon>> = {
  residents: Users,
  rooms: BedDouble,
  nutrition: Utensils,
  visitors: UserCheck,
  daily_monitoring: ClipboardList,
  procedures: Syringe,
  incidents: AlertTriangle,
  maintenance: Wrench,
  forms: Printer,
  finance: CreditCard,
  settings: SettingsIcon,
};

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
  const { facility } = useRoomConfigStore();
  const { permissions, isLoading, error, fetchPermissions } = usePermissionStore();

  useEffect(() => {
    if (user && !permissions && !isLoading && !error) {
      fetchPermissions().catch(() => undefined);
    }
  }, [error, fetchPermissions, isLoading, permissions, user]);

  if (!user) return null;
  const branding = getFacilityBranding(facility);

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const visibleModules = permissions ? getSidebarModulesForRole(permissions, user.role) : [];

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center justify-between p-4 text-white lg:p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
            <img
              src={branding.logoSrc}
              alt={`Logo ${branding.name}`}
              className="h-full w-full object-contain p-1.5"
              onError={event => fallbackFacilityLogo(event.currentTarget)}
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

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 lg:px-4">
        {visibleModules.map((module) => {
          const Icon = MODULE_ICONS[module.key] ?? Activity;

          return (
            <NavLink
              key={module.key}
              to={module.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-4 py-3.5 transition-colors lg:py-3 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{module.label}</span>
            </NavLink>
          );
        })}

        {!permissions && isLoading && (
          <div className="px-4 py-3 text-sm text-slate-500">Đang tải menu theo quyền...</div>
        )}

        {!permissions && error && (
          <div className="mx-2 rounded-lg border border-amber-900/40 bg-amber-950/30 px-3 py-3 text-sm text-amber-100">
            Không thể tải menu theo quyền. Vui lòng tải lại.
          </div>
        )}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{ROLE_LABELS[user.role] || user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded p-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </button>
      </div>
    </div>
  );
};
