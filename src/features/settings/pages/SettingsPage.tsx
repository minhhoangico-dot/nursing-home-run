import React, { useState } from 'react';
import { Users, CreditCard, ArrowLeft, Plus, Edit2, Trash2, Building } from 'lucide-react';
import { User, ServicePrice } from '../../../types/index';
import { AddUserModal } from '../components/AddUserModal';
import { ServiceCatalog } from '../../finance/components/ServiceCatalog';
import { FacilityConfig } from '../components/FacilityConfig';
import { useToast } from '../../../app/providers';
import { db } from '../../../services/databaseService';
import { useAuthStore } from '../../../stores/authStore';
import { useFinanceStore } from '../../../stores/financeStore';

export const SettingsPage = () => {
   const [view, setView] = useState<'menu' | 'users' | 'facility' | 'prices'>('menu');
   const [showAddUserModal, setShowAddUserModal] = useState(false);
   const { addToast } = useToast();

   // Store Data
   const { users } = useAuthStore();
   const { servicePrices, updateServicePrice, deleteServicePrice } = useFinanceStore();

   const handleAddUser = async (user: User) => {
      try {
         // Mock add user since authStore doesn't expose it
         // In real app we would call db.users.add(user)
         await db.users.upsert(user);
         addToast('success', 'Thành công', 'Đã thêm người dùng mới');
      } catch (e) {
         addToast('error', 'Lỗi', 'Thêm người dùng thất bại');
      }
      setShowAddUserModal(false);
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
            {/* Desktop Table */}
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
                  {users.length > 0 ? users.map(u => (
                     <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">{u.name}</td>
                        <td className="px-6 py-4">{u.username}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-slate-800 text-white' :
                              u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                                 u.role === 'SUPERVISOR' ? 'bg-green-100 text-green-700' :
                                    'bg-purple-100 text-purple-700'
                              }`}>
                              {u.role === 'ADMIN' ? 'Quản trị viên' :
                                 u.role === 'DOCTOR' ? 'Bác sĩ' :
                                    u.role === 'SUPERVISOR' ? 'Trưởng tầng' : 'Kế toán'}
                           </span>
                        </td>
                        <td className="px-6 py-4">{u.floor || '-'}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                           <button className="text-slate-400 hover:text-teal-600"><Edit2 className="w-4 h-4" /></button>
                           <button onClick={() => { }} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500 italic">Chưa có người dùng nào</td>
                     </tr>
                  )}
               </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
               {users.length > 0 ? users.map(u => (
                  <div key={u.id} className="p-4 hover:bg-slate-50">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <p className="font-bold text-slate-800">{u.name}</p>
                           <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-slate-800 text-white' :
                           u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                              u.role === 'SUPERVISOR' ? 'bg-green-100 text-green-700' :
                                 'bg-purple-100 text-purple-700'
                           }`}>
                           {u.role === 'ADMIN' ? 'Admin' :
                              u.role === 'DOCTOR' ? 'Bác sĩ' :
                                 u.role === 'SUPERVISOR' ? 'Trưởng tầng' : 'Kế toán'}
                        </span>
                     </div>
                     {u.floor && <p className="text-sm text-slate-500">Khu vực: {u.floor}</p>}
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
         {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onSave={handleAddUser} />}

         {view === 'menu' ? (
            <>
               <h2 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer" onClick={() => setView('users')}>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                           <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Quản lý người dùng</h3>
                     </div>
                     <p className="text-sm text-slate-500 mb-4">Thêm, xóa, sửa tài khoản nhân viên và phân quyền truy cập.</p>
                     <div className="text-sm font-medium text-teal-600">Quản lý &rarr;</div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer" onClick={() => setView('prices')}>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                           <CreditCard className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Bảng giá dịch vụ</h3>
                     </div>
                     <p className="text-sm text-slate-500 mb-4">Cập nhật đơn giá dịch vụ chăm sóc, ăn uống và phụ phí.</p>
                     <div className="text-sm font-medium text-teal-600">Cập nhật &rarr;</div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer" onClick={() => setView('facility')}>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                           <Building className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Thông tin đơn vị</h3>
                     </div>
                     <p className="text-sm text-slate-500 mb-4">Cập nhật logo, tên đơn vị, địa chỉ, mã số thuế và thông tin liên hệ.</p>
                     <div className="text-sm font-medium text-teal-600">Cập nhật &rarr;</div>
                  </div>
               </div>
            </>
         ) : (
            <>
               <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-4">
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
            </>
         )}
      </div>
   );
};

