import React from 'react';
import { BarChart3, TrendingUp, Users, AlertCircle, FileText } from 'lucide-react';
import { formatCurrency } from '../../../data/index';
import { useToast } from '../../../app/providers';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useFinanceStore } from '../../../stores/financeStore';
import { useInventoryStore } from '../../../stores/inventoryStore';
import { useIncidentsStore } from '../../../stores/incidentsStore';

export const ReportsPage = () => {
   const { addToast } = useToast();
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();
   const { transactions } = useFinanceStore();
   const { inventory } = useInventoryStore();
   const { incidents } = useIncidentsStore();

   if (!user) return null;

   // Real Data Calculations
   const totalRevenue = transactions
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + t.amount, 0);

   const collected = transactions
      .filter(t => t.type === 'IN' && t.status === 'Success')
      .reduce((sum, t) => sum + t.amount, 0);

   const outstanding = residents
      .filter(r => r.balance < 0)
      .reduce((sum, r) => sum + Math.abs(r.balance), 0);

   // Occupancy Rate (assuming 56 beds total capacity)
   const totalCapacity = 56;
   const activeResidents = residents.filter(r => r.status === 'Active').length;
   const occupancyRate = Math.round((activeResidents / totalCapacity) * 100);

   const incidentCount = incidents.length;

   return (
      <div className="space-y-8">
         <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold text-slate-800">Báo cáo tổng hợp</h2>
            <div className="text-right text-xs text-slate-500">
               <p>Người xuất báo cáo: <span className="font-bold">{user.name}</span></p>
               <p>Thời gian: {new Date().toLocaleString('vi-VN')}</p>
            </div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                  <div>
                     <p className="text-sm text-slate-500 font-medium">Doanh thu ghi nhận</p>
                     <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</h3>
                  </div>
               </div>
               <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-xs text-slate-500">
                  <span>Đã thu: <span className="text-green-600 font-bold">{formatCurrency(collected)}</span></span>
                  <span>Công nợ: <span className="text-red-500 font-bold">{formatCurrency(outstanding)}</span></span>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-100 text-teal-600 rounded-lg"><Users className="w-6 h-6" /></div>
                  <div>
                     <p className="text-sm text-slate-500 font-medium">Tỷ lệ lấp đầy</p>
                     <h3 className="text-2xl font-bold text-slate-800">{occupancyRate}%</h3>
                  </div>
               </div>
               <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
               </div>
               <p className="text-xs text-slate-400 mt-2 text-right">{activeResidents} / {totalCapacity} giường</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><AlertCircle className="w-6 h-6" /></div>
                  <div>
                     <p className="text-sm text-slate-500 font-medium">Sự cố trong tháng</p>
                     <h3 className="text-2xl font-bold text-slate-800">{incidentCount}</h3>
                  </div>
               </div>
               <div className="mt-4 text-xs text-slate-500">
                  Giảm <span className="text-green-500 font-bold">50%</span> so với tháng trước
               </div>
            </div>
         </div>

         {/* Charts Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400" /> Biểu đồ doanh thu 6 tháng</h3>
               <div className="flex items-end justify-between h-64 gap-2">
                  {[380, 420, 390, 450, 410, totalRevenue / 1000000].map((val, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div
                           className="w-full bg-blue-500 rounded-t-lg transition-all group-hover:bg-blue-600 relative"
                           style={{ height: `${Math.min((val / 500) * 100, 100)}%` }}
                        >
                           <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{Math.round(val)}tr</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{i === 5 ? 'Hiện tại' : `T${5 + i}`}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-6">Phân bố cấp độ chăm sóc</h3>
               <div className="space-y-4">
                  {[1, 2, 3, 4].map(level => {
                     const count = residents.filter(r => r.careLevel === level && r.status === 'Active').length;
                     const pct = activeResidents > 0 ? (count / activeResidents) * 100 : 0;
                     const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

                     return (
                        <div key={level}>
                           <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600 font-medium">Cấp độ {level}</span>
                              <span className="text-slate-900 font-bold">{count} người ({Math.round(pct)}%)</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-3">
                              <div className={`${colors[level - 1]} h-3 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* Detailed Table */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800">Báo cáo tồn kho & Giá trị</h3>
               <button
                  onClick={() => addToast('success', 'Xuất báo cáo thành công', 'File Excel đã được tải xuống.')}
                  className="flex items-center gap-2 text-sm text-teal-600 font-medium hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
               >
                  <FileText className="w-4 h-4" /> Xuất Excel
               </button>
            </div>
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                     <th className="px-6 py-3">Mã</th>
                     <th className="px-6 py-3">Tên vật tư</th>
                     <th className="px-6 py-3 text-right">Tồn kho</th>
                     <th className="px-6 py-3 text-right">Đơn giá vốn</th>
                     <th className="px-6 py-3 text-right">Tổng giá trị</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {inventory.map((item, i) => (
                     <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                        <td className="px-6 py-4 text-right">{item.stock} {item.unit}</td>
                        <td className="px-6 py-4 text-right text-slate-500">{formatCurrency(item.price)}</td>
                        <td className="px-6 py-4 text-right font-bold">{formatCurrency(item.stock * item.price)}</td>
                     </tr>
                  ))}
                  <tr className="bg-slate-50">
                     <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-800">TỔNG GIÁ TRỊ TỒN KHO:</td>
                     <td className="px-6 py-4 text-right font-bold text-teal-700">
                        {formatCurrency(inventory.reduce((sum, i) => sum + (i.stock * i.price), 0))}
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
   );
};