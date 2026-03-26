import React, { useState } from 'react';
import { ArrowLeft, Building, CreditCard, ShieldCheck, Users } from 'lucide-react';
import type { User } from '../../../types';
import { useToast } from '../../../app/providers';
import { useAuthStore } from '../../../stores/authStore';
import { useFinanceStore } from '../../../stores/financeStore';
import { ServiceCatalog } from '../../finance/components/ServiceCatalog';
import { AddUserModal } from '../components/AddUserModal';
import { FacilityConfig } from '../components/FacilityConfig';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { RolePermissionsPanel } from '../components/RolePermissionsPanel';
import { UserFormModal, type UserFormValues } from '../components/UserFormModal';
import { UserManagementPanel } from '../components/UserManagementPanel';
import { requiresFloor, translateUserMutationError } from '../lib/userManagement';

type SettingsView = 'menu' | 'users' | 'roles' | 'facility' | 'prices';

const normalizeFloor = (role: User['role'], floor?: string): string | undefined =>
  requiresFloor(role) ? floor?.trim() || undefined : undefined;

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

  const {
    user: currentUser,
    users,
    createUser,
    updateUser,
    deactivateUser,
    reactivateUser,
    resetPassword,
  } = useAuthStore();

  const { servicePrices, updateServicePrice, deleteServicePrice } = useFinanceStore();

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
            <button
              type="button"
              className="rounded-xl border border-slate-100 bg-white p-6 text-left shadow-sm transition-colors hover:border-teal-200"
              onClick={() => setView('users')}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">Quản lý người dùng</h3>
              </div>
              <p className="mb-4 text-sm text-slate-500">
                Thêm, cập nhật, khóa tài khoản và đặt lại mật khẩu cho nhân viên.
              </p>
              <div className="text-sm font-medium text-teal-600">Quản lý &rarr;</div>
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-100 bg-white p-6 text-left shadow-sm transition-colors hover:border-teal-200"
              onClick={() => setView('roles')}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">Vai trò & phân quyền</h3>
              </div>
              <p className="mb-4 text-sm text-slate-500">
                Điều chỉnh quyền truy cập module cho từng vai trò hiện có trong hệ thống.
              </p>
              <div className="text-sm font-medium text-teal-600">Thiết lập &rarr;</div>
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-100 bg-white p-6 text-left shadow-sm transition-colors hover:border-teal-200"
              onClick={() => setView('prices')}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-teal-100 p-2 text-teal-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">Bảng giá dịch vụ</h3>
              </div>
              <p className="mb-4 text-sm text-slate-500">
                Cập nhật đơn giá dịch vụ chăm sóc, ăn uống và phụ phí.
              </p>
              <div className="text-sm font-medium text-teal-600">Cập nhật &rarr;</div>
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-100 bg-white p-6 text-left shadow-sm transition-colors hover:border-teal-200"
              onClick={() => setView('facility')}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  <Building className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">Thông tin đơn vị</h3>
              </div>
              <p className="mb-4 text-sm text-slate-500">
                Cập nhật thông tin cơ sở, địa chỉ, mã số thuế và liên hệ.
              </p>
              <div className="text-sm font-medium text-teal-600">Cập nhật &rarr;</div>
            </button>
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

          {view === 'roles' && <RolePermissionsPanel />}

          {view === 'prices' && (
            <ServiceCatalog
              services={servicePrices}
              onAdd={updateServicePrice}
              onUpdate={updateServicePrice}
              onDelete={deleteServicePrice}
            />
          )}

          {view === 'facility' && <FacilityConfig />}
        </>
      )}
    </div>
  );
};
