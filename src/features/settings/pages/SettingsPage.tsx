import React, { useState } from 'react';
import { Users, CreditCard, ArrowLeft, Plus, Edit2, Trash2, Building, Database, CloudUpload, CheckCircle2 } from 'lucide-react';
import { User, ServicePrice } from '../../../types/index';
import { AddUserModal } from '../components/AddUserModal';
import { PricingConfig } from '../components/PricingConfig';
import { FacilityConfig } from '../components/FacilityConfig';
import { useToast } from '../../../app/providers';
import { db } from '../../../services/databaseService';
import { useAuthStore } from '../../../stores/authStore';
import { useFinanceStore } from '../../../stores/financeStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useInventoryStore } from '../../../stores/inventoryStore';
import { useRoomsStore } from '../../../stores/roomsStore';
import { useIncidentsStore } from '../../../stores/incidentsStore';
import { useActivitiesStore } from '../../../stores/activitiesStore';

import { useScheduleStore } from '../../../stores/scheduleStore';
import { useVisitorsStore } from '../../../stores/visitorsStore';


export const SettingsPage = () => {
   const [view, setView] = useState<'menu' | 'users' | 'facility' | 'prices' | 'migration'>('menu');
   const [showAddUserModal, setShowAddUserModal] = useState(false);
   const [isMigrating, setIsMigrating] = useState(false);
   const { addToast } = useToast();

   // Store Data
   const { users } = useAuthStore();
   const { servicePrices, updateServicePrice } = useFinanceStore();
   const { residents } = useResidentsStore();

   const inventoryStore = useInventoryStore();
   const financeStore = useFinanceStore();

   const roomsStore = useRoomsStore();
   const incidentsStore = useIncidentsStore();
   const activitiesStore = useActivitiesStore();
   const scheduleStore = useScheduleStore();
   const visitorsStore = useVisitorsStore();


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

   const handleUpdatePrices = (newPrices: ServicePrice[]) => {
      newPrices.forEach(p => updateServicePrice(p));
   };

   const handleMigration = async () => {
      if (!window.confirm('Hành động này sẽ ghi đè dữ liệu trên Supabase bằng dữ liệu hiện tại trong bộ nhớ. Bạn có chắc chắn?')) return;

      setIsMigrating(true);
      console.log("Starting migration of system data...");

      try {
         // Gather all data
         const allResidents = residents;
         const allInventory = inventoryStore.inventory;
         const allUsers = users;
         const allFinanceTrx = financeStore.transactions;
         const allPrices = financeStore.servicePrices;
         const allSchedules = scheduleStore.schedules;

         const syncTasks = [
            { name: 'Residents', task: db.residents.bulkUpsert(allResidents) },
            { name: 'Inventory', task: db.inventory.bulkUpsert(allInventory) },
            { name: 'Users', task: db.users.bulkUpsert(allUsers) },
            { name: 'Finance Trx', task: db.finance.bulkUpsertTransactions(allFinanceTrx) },
            { name: 'Prices', task: db.finance.bulkUpsertPrices(allPrices) },
            { name: 'Schedules', task: db.schedules.bulkUpsert(allSchedules) },
         ];

         await Promise.all(syncTasks.map(t => t.task.then(() => console.log(`✓ Sync: ${t.name}`))));

         addToast('success', 'Di trú thành công', 'Toàn bộ dữ liệu hệ thống đã được đẩy lên Cloud Supabase.');
      } catch (err: any) {
         console.error("Migration fatal error:", err);
         addToast('error', 'Di trú thất bại', err.message || 'Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra lại Table schema.');
      } finally {
         setIsMigrating(false);
      }
   };

   const UserManagement = () => (
      <div>
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Quản lý người dùng</h3>
            <button
               onClick={() => setShowAddUserModal(true)}
               className="bg-teal-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-teal-700 shadow-sm"
            >
               <Plus className="w-4 h-4" /> Thêm người dùng
            </button>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-sm">
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
         </div>
      </div>
   );

   const MigrationView = () => (
      <div className="max-w-2xl">
         <h3 className="text-lg font-bold text-slate-800 mb-2">Đồng bộ Toàn diện Cloud (Supabase)</h3>
         <p className="text-sm text-slate-500 mb-6">Tính năng này cho phép bạn đẩy toàn bộ dữ liệu mẫu hiện tại lên cơ sở dữ liệu Cloud, bao gồm cả các bản ghi y tế, sự cố, lịch trực và khách thăm.</p>

         <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h4 className="font-bold text-slate-700">Dữ liệu sẵn sàng di trú:</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm text-slate-600">
                     <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {residents.length} Hồ sơ NCT</li>
                     <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {inventoryStore.inventory.length} Vật tư kho</li>
                     <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {roomsStore.maintenanceRequests.length} Bảo trì</li>
                  </div>
               </div>
               <CloudUpload className="w-16 h-16 text-teal-100 hidden md:block" />
            </div>

            <button
               onClick={handleMigration}
               disabled={isMigrating}
               className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isMigrating ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-900/20'
                  }`}
            >
               {isMigrating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : (
                  <Database className="w-5 h-5" />
               )}
               {isMigrating ? 'Đang tải dữ liệu...' : 'Bắt đầu di trú TOÀN BỘ lên Cloud'}
            </button>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 italic">
               * Đảm bảo bạn đã khởi tạo đầy đủ các Table trên Supabase dashboard trước khi chạy đồng bộ.
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

                  <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer text-white" onClick={() => setView('migration')}>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="bg-teal-500 p-2 rounded-lg text-white">
                           <Database className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold">Di trú Cloud</h3>
                     </div>
                     <p className="text-sm text-slate-400 mb-4">Đồng bộ toàn bộ dữ liệu Local hiện tại lên Supabase Cloud Database.</p>
                     <div className="text-sm font-medium text-teal-400 flex items-center gap-1">Khởi tạo ngay <CloudUpload className="w-3 h-3" /></div>
                  </div>
               </div>
            </>
         ) : (
            <>
               <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Quay lại cài đặt
               </button>
               {view === 'users' && <UserManagement />}
               {view === 'prices' && <PricingConfig prices={financeStore.servicePrices} onUpdatePrices={handleUpdatePrices} />}
               {view === 'migration' && <MigrationView />}
               {view === 'facility' && <FacilityConfig />}
            </>
         )}
      </div>
   );
};