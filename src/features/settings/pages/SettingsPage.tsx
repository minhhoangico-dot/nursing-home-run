import React, { useState } from 'react';
import {
  ArrowLeft,
  Building,
  CreditCard,
  Edit2,
  Pill,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { User } from '../../../types/index';
import { AddUserModal } from '../components/AddUserModal';
import { ServiceCatalog } from '../../finance/components/ServiceCatalog';
import { FacilityConfig } from '../components/FacilityConfig';
import { MedicineCatalogManager } from '../../prescriptions/components/MedicineCatalogManager';
import { useToast } from '../../../app/providers';
import { db } from '../../../services/databaseService';
import { useAuthStore } from '../../../stores/authStore';
import { useFinanceStore } from '../../../stores/financeStore';

export const SettingsPage = () => {
  const [view, setView] = useState<
    'menu' | 'users' | 'facility' | 'prices' | 'medicines'
  >('menu');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { addToast } = useToast();

  const { users } = useAuthStore();
  const { servicePrices, updateServicePrice, deleteServicePrice } =
    useFinanceStore();

  const handleAddUser = async (user: User) => {
    try {
      await db.users.upsert(user);
      addToast('success', 'Thành công', 'Đã thêm người dùng mới');
    } catch (error) {
      addToast('error', 'Lỗi', 'Thêm người dùng thất bại');
    }
    setShowAddUserModal(false);
  };

  const UserManagement = () => (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="text-lg font-bold text-slate-800">
          Quản lý người dùng
        </h3>
        <button
          type="button"
          onClick={() => setShowAddUserModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Thêm người dùng
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <table className="hidden w-full text-left text-sm md:table">
          <thead className="bg-slate-50 font-medium text-slate-500">
            <tr>
              <th className="px-6 py-3">Họ và tên</th>
              <th className="px-6 py-3">Tên đăng nhập</th>
              <th className="px-6 py-3">Vai trò</th>
              <th className="px-6 py-3">Khu vực</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-slate-800 text-white'
                          : user.role === 'DOCTOR'
                            ? 'bg-blue-100 text-blue-700'
                            : user.role === 'SUPERVISOR'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {user.role === 'ADMIN'
                        ? 'Quản trị viên'
                        : user.role === 'DOCTOR'
                          ? 'Bác sĩ'
                          : user.role === 'SUPERVISOR'
                            ? 'Trưởng tầng'
                            : 'Kế toán'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.floor || '-'}</td>
                  <td className="flex justify-end gap-2 px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-teal-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="text-slate-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center italic text-slate-500">
                  Chưa có người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="divide-y divide-slate-100 md:hidden">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-slate-50">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-slate-800 text-white'
                        : user.role === 'DOCTOR'
                          ? 'bg-blue-100 text-blue-700'
                          : user.role === 'SUPERVISOR'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {user.role === 'ADMIN'
                      ? 'Admin'
                      : user.role === 'DOCTOR'
                        ? 'Bác sĩ'
                        : user.role === 'SUPERVISOR'
                          ? 'Trưởng tầng'
                          : 'Kế toán'}
                  </span>
                </div>
                {user.floor && (
                  <p className="text-sm text-slate-500">Khu vực: {user.floor}</p>
                )}
                <div className="mt-3 flex justify-end gap-3">
                  <button className="text-sm font-medium text-teal-600">
                    Sửa
                  </button>
                  <button className="text-sm font-medium text-red-500">Xóa</button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center italic text-slate-500">
              Chưa có người dùng nào
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMenuCard = ({
    icon,
    iconClassName,
    title,
    description,
    onClick,
    actionText,
  }: {
    icon: React.ReactNode;
    iconClassName: string;
    title: string;
    description: string;
    onClick: () => void;
    actionText: string;
  }) => (
    <div
      className="cursor-pointer rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-colors hover:border-teal-200"
      onClick={onClick}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconClassName}`}>{icon}</div>
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      <div className="text-sm font-medium text-teal-600">{actionText} &rarr;</div>
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
          <h2 className="text-2xl font-bold text-slate-800">
            Cài đặt hệ thống
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {renderMenuCard({
              icon: <Users className="h-5 w-5" />,
              iconClassName: 'bg-blue-100 text-blue-600',
              title: 'Quản lý người dùng',
              description:
                'Thêm, xóa, sửa tài khoản nhân viên và phân quyền truy cập.',
              onClick: () => setView('users'),
              actionText: 'Quản lý',
            })}
            {renderMenuCard({
              icon: <CreditCard className="h-5 w-5" />,
              iconClassName: 'bg-teal-100 text-teal-600',
              title: 'Bảng giá dịch vụ',
              description:
                'Cập nhật đơn giá dịch vụ chăm sóc, ăn uống và phụ phí.',
              onClick: () => setView('prices'),
              actionText: 'Cập nhật',
            })}
            {renderMenuCard({
              icon: <Building className="h-5 w-5" />,
              iconClassName: 'bg-purple-100 text-purple-600',
              title: 'Thông tin đơn vị',
              description:
                'Cập nhật thông tin cơ sở, địa chỉ, mã số thuế và liên hệ.',
              onClick: () => setView('facility'),
              actionText: 'Cập nhật',
            })}
            {renderMenuCard({
              icon: <Pill className="h-5 w-5" />,
              iconClassName: 'bg-amber-100 text-amber-600',
              title: 'Danh mục thuốc',
              description:
                'Quản lý thuốc kê đơn nội bộ, tra cứu mã thuốc và nguồn nhập.',
              onClick: () => setView('medicines'),
              actionText: 'Quản lý',
            })}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setView('menu')}
            className="mb-4 flex items-center gap-2 text-slate-500 hover:text-teal-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại cài đặt
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
          {view === 'medicines' && <MedicineCatalogManager />}
        </>
      )}
    </div>
  );
};
