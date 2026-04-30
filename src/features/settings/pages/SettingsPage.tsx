import React, { useEffect, useRef, useState } from 'react';
import {
  Users,
  CreditCard,
  ArrowLeft,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../../../types/index';
import { useToast } from '../../../app/providers';
import { useAuthStore } from '../../../stores/authStore';
import { useFinanceStore } from '../../../stores/financeStore';
import { ServiceCatalog } from '../../finance/components/ServiceCatalog';
import { AddUserModal } from '../components/AddUserModal';
import { FacilityConfig } from '../components/FacilityConfig';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { UserFormModal, type UserFormValues } from '../components/UserFormModal';
import { UserManagementPanel } from '../components/UserManagementPanel';
import { ModulePermissionsConfig } from '../components/ModulePermissionsConfig';
import { requiresFloor, translateUserMutationError } from '../lib/userManagement';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import { ReadOnlyBanner } from '@/src/components/ui/ReadOnlyBanner';
import { RestrictedAccessPanel } from '@/src/components/ui/RestrictedAccessPanel';
import { useModuleAccess } from '@/src/hooks/useModuleAccess';
import { useDeferredStoreLoad } from '@/src/hooks/useDeferredStoreLoad';
import type { RoleModulePermissionMatrix } from '@/src/types/appSettings';

type SettingsView = 'menu' | 'users' | 'facility' | 'prices' | 'permissions';

const normalizeFloor = (role: User['role'], floor?: string): string | undefined =>
  requiresFloor(role) ? floor?.trim() || undefined : undefined;

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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const { addToast } = useToast();
  const hasShownFallbackWarning = useRef(false);

  const {
    user: currentUser,
    users,
    createUser,
    updateUser,
    deactivateUser,
    reactivateUser,
    resetPassword,
  } = useAuthStore();

  const {
    servicePrices,
    fetchFinanceData,
    isLoaded: isFinanceLoaded,
    updateServicePrice,
    deleteServicePrice,
  } = useFinanceStore();
  const financeAccess = useModuleAccess('finance');
  const {
    permissions,
    savePermissions,
    isSaving,
    usedFallbackDefaults,
    lastLoadError,
  } = useAppSettingsStore();

  useDeferredStoreLoad(
    fetchFinanceData,
    isFinanceLoaded,
    view === 'prices' && financeAccess.canViewFinance,
  );

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN' || !usedFallbackDefaults || hasShownFallbackWarning.current) {
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
  }, [addToast, lastLoadError, usedFallbackDefaults, currentUser?.role]);

  const closeCreateModal = () => {
    setShowAddUserModal(false);
    setUserFormError(null);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setUserFormError(null);
  };

  const closeResetPasswordModal = () => {
    setResetPasswordUser(null);
    setResetPasswordError(null);
  };

  const handleCreateUser = async (newUser: User) => {
    setIsSavingUser(true);
    setUserFormError(null);

    try {
      await createUser({
        ...newUser,
        floor: normalizeFloor(newUser.role, newUser.floor),
        isActive: true,
      });
      addToast('success', 'Thành công', 'Đã tạo tài khoản mới.');
      closeCreateModal();
    } catch (error) {
      const message = translateUserMutationError(error);
      setUserFormError(message);
      addToast('error', 'Lỗi', message);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleUpdateUser = async (values: UserFormValues) => {
    if (!editingUser) {
      return;
    }

    const nextRole = values.role ?? editingUser.role;
    const nextStatus = values.status ?? (editingUser.isActive === false ? 'inactive' : 'active');

    setIsSavingUser(true);
    setUserFormError(null);

    try {
      await updateUser({
        ...editingUser,
        name: values.name,
        username: values.username,
        role: nextRole,
        floor: normalizeFloor(nextRole, values.floor),
        isActive: nextStatus === 'active',
      });

      addToast('success', 'Thành công', 'Đã cập nhật tài khoản.');
      closeEditModal();
    } catch (error) {
      const message = translateUserMutationError(error);
      setUserFormError(message);
      addToast('error', 'Lỗi', message);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    setBusyUserId(user.id);

    try {
      if (user.isActive === false) {
        await reactivateUser(user.id);
        addToast('success', 'Thành công', 'Đã kích hoạt lại tài khoản.');
      } else {
        await deactivateUser(user.id);
        addToast('success', 'Thành công', 'Đã khóa tài khoản.');
      }
    } catch (error) {
      const message = translateUserMutationError(error);
      addToast('error', 'Lỗi', message);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleResetPassword = async (password: string) => {
    if (!resetPasswordUser) {
      return;
    }

    setIsResettingPassword(true);
    setResetPasswordError(null);

    try {
      await resetPassword(resetPasswordUser.id, password);
      addToast('success', 'Thành công', 'Đã đặt lại mật khẩu.');
      closeResetPasswordModal();
    } catch (error) {
      const message = translateUserMutationError(error);
      setResetPasswordError(message);
      addToast('error', 'Lỗi', message);
    } finally {
      setIsResettingPassword(false);
    }
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

  return (
    <div className="space-y-6">
      {showAddUserModal && (
        <AddUserModal
          onClose={closeCreateModal}
          onSave={handleCreateUser}
          isSubmitting={isSavingUser}
          submitError={userFormError}
        />
      )}

      {editingUser && (
        <UserFormModal
          mode="edit"
          user={editingUser}
          onClose={closeEditModal}
          onSubmit={handleUpdateUser}
          isSubmitting={isSavingUser}
          submitError={userFormError}
          disableRole={editingUser.id === currentUser?.id}
          disableActiveStatus={editingUser.id === currentUser?.id}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          userName={resetPasswordUser.name}
          onClose={closeResetPasswordModal}
          onSubmit={handleResetPassword}
          isSubmitting={isResettingPassword}
          submitError={resetPasswordError}
        />
      )}

      {view === 'menu' ? (
        <>
          <h2 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <SettingsTile
              title="Quản lý người dùng"
              description="Thêm, cập nhật, khóa tài khoản và đặt lại mật khẩu cho nhân viên."
              icon={<Users className="h-5 w-5" />}
              accentClass="bg-blue-100 text-blue-600"
              onClick={() => setView('users')}
            />

            <SettingsTile
              title="Bảng giá dịch vụ"
              description="Cập nhật đơn giá dịch vụ chăm sóc, ăn uống và phụ phí."
              icon={<CreditCard className="h-5 w-5" />}
              accentClass="bg-teal-100 text-teal-600"
              onClick={() => setView('prices')}
            />

            <SettingsTile
              title="Thông tin đơn vị"
              description="Cập nhật thông tin cơ sở, địa chỉ, mã số thuế và liên hệ."
              icon={<Building className="h-5 w-5" />}
              accentClass="bg-purple-100 text-purple-600"
              onClick={() => setView('facility')}
            />

            {currentUser?.role === 'ADMIN' && (
              <SettingsTile
                title="Phân quyền module"
                description="Ẩn hiện từng module theo role và cấu hình riêng quyền xem hoặc sửa tài chính."
                icon={<ShieldCheck className="h-5 w-5" />}
                accentClass="bg-amber-100 text-amber-600"
                onClick={() => setView('permissions')}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setView('menu')}
            className="mb-4 flex items-center gap-2 text-slate-500 hover:text-teal-600"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại cài đặt
          </button>

          {view === 'users' && (
            <UserManagementPanel
              users={users}
              currentUserId={currentUser?.id}
              busyUserId={busyUserId}
              onCreate={() => {
                setUserFormError(null);
                setShowAddUserModal(true);
              }}
              onEdit={(user) => {
                setUserFormError(null);
                setEditingUser(user);
              }}
              onResetPassword={(user) => {
                setResetPasswordError(null);
                setResetPasswordUser(user);
              }}
              onToggleActive={handleToggleActive}
            />
          )}

          {view === 'prices' && (
            !financeAccess.canViewFinance ? (
              <RestrictedAccessPanel moduleKey="finance" />
            ) : (
              <div className="space-y-4">
                {financeAccess.mode === 'readOnly' && (
                  <ReadOnlyBanner message="Bạn có thể xem bảng giá dịch vụ nhưng không thể chỉnh sửa." />
                )}
                <ServiceCatalog
                  services={servicePrices}
                  onAdd={updateServicePrice}
                  onUpdate={updateServicePrice}
                  onDelete={deleteServicePrice}
                  readOnly={!financeAccess.canEditFinance}
                />
              </div>
            )
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
