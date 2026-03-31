import React, { useEffect, useRef, useState } from 'react';
import {
  Users,
  CreditCard,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../../../types/index';
import { AddUserModal } from '../components/AddUserModal';
import { ServiceCatalog } from '../../finance/components/ServiceCatalog';
import { FacilityConfig } from '../components/FacilityConfig';
import { ModulePermissionsConfig } from '../components/ModulePermissionsConfig';
import { useToast } from '../../../app/providers';
import { db } from '../../../services/databaseService';
import { useAuthStore } from '../../../stores/authStore';
import { useFinanceStore } from '../../../stores/financeStore';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import type { RoleModulePermissionMatrix } from '@/src/types/appSettings';

type SettingsView = 'menu' | 'users' | 'facility' | 'prices' | 'permissions';

interface SettingsTileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
  onClick: () => void;
}

const SettingsTile = ({
  title,
  description,
  icon,
  accentClass,
  onClick,
}: SettingsTileProps) => (
  <button
    type="button"
    className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors text-left"
    onClick={onClick}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg ${accentClass}`}>{icon}</div>
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <p className="text-sm text-slate-500 mb-4">{description}</p>
    <div className="text-sm font-medium text-teal-600">Mở &rarr;</div>
  </button>
);

export const SettingsPage = () => {
  const [view, setView] = useState<SettingsView>('menu');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { addToast } = useToast();
  const hasShownFallbackWarning = useRef(false);

  const { user, users } = useAuthStore();
  const { servicePrices, updateServicePrice, deleteServicePrice } = useFinanceStore();
  const {
    permissions,
    savePermissions,
    isSaving,
    usedFallbackDefaults,
    lastLoadError,
  } = useAppSettingsStore();

  useEffect(() => {
    if (user?.role !== 'ADMIN' || !usedFallbackDefaults || hasShownFallbackWarning.current) {
      return;
    }

    hasShownFallbackWarning.current = true;
    addToast(
      'warning',
      'Đang dùng cấu hình mặc định',
      lastLoadError
        ? `Không tải được app settings từ máy chủ: ${lastLoadError}`
        : 'App settings chưa có trên máy chủ, hệ thống đang chạy bằng cấu hình mặc định.',
    );
  }, [addToast, lastLoadError, usedFallbackDefaults, user?.role]);

  const handleAddUser = async (nextUser: User) => {
    try {
      await db.users.upsert(nextUser);
      addToast('success', 'Thành công', 'Đã thêm người dùng mới');
    } catch {
      addToast('error', 'Lỗi', 'Thêm người dùng thất bại');
    }

    setShowAddUserModal(false);
  };

  const handleSavePermissions = async (nextValue: RoleModulePermissionMatrix) => {
    try {
      await savePermissions(nextValue);
      addToast('success', 'Đã lưu phân quyền', 'Ma trận module theo role đã được cập nhật.');
    } catch {
      addToast('error', 'Không lưu được', 'Không thể cập nhật phân quyền module.');
    }
  };

  const handleResetPermissions = () => {
    addToast(
      'info',
      'Đã khôi phục mặc định',
      'Nhấn "Lưu thay đổi" để áp dụng lại ma trận phân quyền mặc định.',
    );
  };

  const UserManagement = () => (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h3 className="text-lg font-bold text-slate-800">Quản lý người dùng</h3>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="bg-teal-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-teal-700 shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="hidden md:table w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Họ và tên</th>
              <th className="px-6 py-3">Tên đăng nhập</th>
              <th className="px-6 py-3">Vai trò</th>
              <th className="px-6 py-3">Khu vực</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? users.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{entry.name}</td>
                <td className="px-6 py-4">{entry.username}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.role === 'ADMIN'
                        ? 'bg-slate-800 text-white'
                        : entry.role === 'DOCTOR'
                          ? 'bg-blue-100 text-blue-700'
                          : entry.role === 'SUPERVISOR'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {entry.role === 'ADMIN'
                      ? 'Quản trị viên'
                      : entry.role === 'DOCTOR'
                        ? 'Bác sĩ'
                        : entry.role === 'SUPERVISOR'
                          ? 'Trưởng tầng'
                          : 'Kế toán'}
                  </span>
                </td>
                <td className="px-6 py-4">{entry.floor || '-'}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="text-slate-400 hover:text-teal-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => {}} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500 italic">
                  Chưa có người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="md:hidden divide-y divide-slate-100">
          {users.length > 0 ? users.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-slate-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-slate-800">{entry.name}</p>
                  <p className="text-xs text-slate-500">@{entry.username}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.role === 'ADMIN'
                      ? 'bg-slate-800 text-white'
                      : entry.role === 'DOCTOR'
                        ? 'bg-blue-100 text-blue-700'
                        : entry.role === 'SUPERVISOR'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {entry.role === 'ADMIN'
                    ? 'Admin'
                    : entry.role === 'DOCTOR'
                      ? 'Bác sĩ'
                      : entry.role === 'SUPERVISOR'
                        ? 'Trưởng tầng'
                        : 'Kế toán'}
                </span>
              </div>
              {entry.floor && <p className="text-sm text-slate-500">Khu vực: {entry.floor}</p>}
              <div className="flex justify-end gap-3 mt-3">
                <button className="text-teal-600 text-sm font-medium">Sửa</button>
                <button className="text-red-500 text-sm font-medium">Xóa</button>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-slate-500 italic">Chưa có người dùng nào</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSave={handleAddUser}
        />
      )}

      {view === 'menu' ? (
        <>
          <h2 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <SettingsTile
              title="Quản lý người dùng"
              description="Thêm, xóa, sửa tài khoản nhân viên và phân quyền truy cập."
              icon={<Users className="w-5 h-5" />}
              accentClass="bg-blue-100 text-blue-600"
              onClick={() => setView('users')}
            />

            <SettingsTile
              title="Bảng giá dịch vụ"
              description="Cập nhật đơn giá dịch vụ chăm sóc, ăn uống và phụ phí."
              icon={<CreditCard className="w-5 h-5" />}
              accentClass="bg-teal-100 text-teal-600"
              onClick={() => setView('prices')}
            />

            <SettingsTile
              title="Thông tin đơn vị"
              description="Cập nhật thông tin cơ sở, địa chỉ, mã số thuế và liên hệ."
              icon={<Building className="w-5 h-5" />}
              accentClass="bg-purple-100 text-purple-600"
              onClick={() => setView('facility')}
            />

            {user?.role === 'ADMIN' && (
              <SettingsTile
                title="Phân quyền module"
                description="Ẩn hiện từng module theo role và cấu hình riêng quyền xem hoặc sửa tài chính."
                icon={<ShieldCheck className="w-5 h-5" />}
                accentClass="bg-amber-100 text-amber-600"
                onClick={() => setView('permissions')}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setView('menu')}
            className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại cài đặt
          </button>

          {view === 'users' && <UserManagement />}
          {view === 'prices' && (
            <ServiceCatalog
              services={servicePrices}
              onAdd={updateServicePrice}
              onUpdate={updateServicePrice}
              onDelete={deleteServicePrice}
            />
          )}
          {view === 'facility' && <FacilityConfig />}
          {view === 'permissions' && (
            <ModulePermissionsConfig
              value={permissions}
              isSaving={isSaving}
              onSave={handleSavePermissions}
              onReset={handleResetPermissions}
            />
          )}
        </>
      )}
    </div>
  );
};
