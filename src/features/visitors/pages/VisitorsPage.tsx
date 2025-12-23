import React, { useState } from 'react';
import { UserPlus, Search, LogOut, Clock, History, Package } from 'lucide-react';
import { VisitorLog } from '../../../types/index';
import { CheckInModal } from '../components/CheckInModal';
import { Button } from '../../../components/ui/index';
import { useToast } from '../../../app/providers';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useVisitorsStore } from '../../../stores/visitorsStore';

export const VisitorsPage = () => {
   const { visitors, addVisitor, checkOutVisitor } = useVisitorsStore();
   const { residents } = useResidentsStore();
   const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
   const [showModal, setShowModal] = useState(false);
   const [search, setSearch] = useState('');
   const { addToast } = useToast();

   const filteredVisitors = visitors.filter(v => {
      const matchSearch = v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
         v.residentName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = activeTab === 'current' ? v.status === 'Active' : v.status === 'Completed';
      return matchSearch && matchStatus;
   });

   const handleCheckOut = async (id: string) => {
      if (window.confirm('Xác nhận khách đã rời khỏi viện?')) {
         try {
            await checkOutVisitor(id, new Date().toISOString());
            addToast('success', 'Check-out thành công', 'Đã ghi nhận giờ ra của khách.');
         } catch (error) {
            addToast('error', 'Lỗi', 'Check-out thất bại');
         }
      }
   };

   const handleSave = async (log: VisitorLog) => {
      try {
         await addVisitor(log);
         setShowModal(false);
         addToast('success', 'Check-in thành công', `Đã đăng ký khách ${log.visitorName}`);
      } catch (error) {
         addToast('error', 'Lỗi', 'Check-in thất bại');
      }
   };

   // Sort: Most recent first
   const sortedVisitors = [...filteredVisitors].sort((a, b) => {
      const timeA = activeTab === 'current' ? a.checkInTime : (a.checkOutTime || a.checkInTime);
      const timeB = activeTab === 'current' ? b.checkInTime : (b.checkOutTime || b.checkInTime);
      return new Date(timeB).getTime() - new Date(timeA).getTime();
   });

   return (
      <div className="space-y-6">
         {showModal && (
            <CheckInModal
               residents={residents}
               onClose={() => setShowModal(false)}
               onSave={handleSave}
            />
         )}

         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Quản lý Khách thăm</h2>
               <p className="text-sm text-slate-500">Ghi nhận khách ra vào và lịch sử thăm gặp</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                     className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-teal-500 focus:outline-none"
                     placeholder="Tìm khách hoặc NCT..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                  />
               </div>
               <Button onClick={() => setShowModal(true)} icon={<UserPlus className="w-4 h-4" />}>
                  Đăng ký vào
               </Button>
            </div>
         </div>

         {/* Stats */}
         {activeTab === 'current' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex items-center justify-between">
                  <div>
                     <p className="text-teal-600 font-bold text-sm uppercase">Đang ở trong viện</p>
                     <p className="text-3xl font-bold text-teal-800 mt-1">{visitors.filter(v => v.status === 'Active').length}</p>
                  </div>
                  <div className="p-3 bg-white rounded-full text-teal-500"><Clock className="w-6 h-6" /></div>
               </div>
            </div>
         )}

         {/* Tabs */}
         <div className="flex gap-6 border-b border-slate-200">
            <button
               onClick={() => setActiveTab('current')}
               className={`pb-3 text-sm font-medium transition-colors border-b-2 px-2 flex items-center gap-2 ${activeTab === 'current' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
            >
               <Clock className="w-4 h-4" /> Khách đang thăm
            </button>
            <button
               onClick={() => setActiveTab('history')}
               className={`pb-3 text-sm font-medium transition-colors border-b-2 px-2 flex items-center gap-2 ${activeTab === 'history' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
            >
               <History className="w-4 h-4" /> Lịch sử ra vào
            </button>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                     <th className="px-6 py-3">Khách thăm</th>
                     <th className="px-6 py-3">Người được thăm</th>
                     <th className="px-6 py-3">Giờ vào</th>
                     {activeTab === 'history' && <th className="px-6 py-3">Giờ ra</th>}
                     <th className="px-6 py-3">Ghi chú / Đồ mang theo</th>
                     {activeTab === 'current' && <th className="px-6 py-3 text-right">Thao tác</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {sortedVisitors.length > 0 ? sortedVisitors.map(v => (
                     <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                           <p className="font-bold text-slate-800">{v.visitorName}</p>
                           <p className="text-xs text-slate-500">{v.phone} • {v.relationship}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="font-medium text-slate-700">{v.residentName}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                           {new Date(v.checkInTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}
                        </td>
                        {activeTab === 'history' && (
                           <td className="px-6 py-4 font-mono text-slate-600">
                              {v.checkOutTime ? new Date(v.checkOutTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' }) : '-'}
                           </td>
                        )}
                        <td className="px-6 py-4">
                           {v.itemBrought && (
                              <div className="flex items-center gap-1 text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded w-fit mb-1">
                                 <Package className="w-3 h-3" /> {v.itemBrought}
                              </div>
                           )}
                           <span className="text-slate-500 text-xs italic">{v.note || 'Không có ghi chú'}</span>
                        </td>
                        {activeTab === 'current' && (
                           <td className="px-6 py-4 text-right">
                              <button
                                 onClick={() => handleCheckOut(v.id)}
                                 className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 transition-colors flex items-center gap-1 ml-auto"
                              >
                                 <LogOut className="w-3 h-3" /> Check-out
                              </button>
                           </td>
                        )}
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={activeTab === 'current' ? 5 : 5} className="px-6 py-12 text-center text-slate-400 italic">
                           {activeTab === 'current' ? 'Hiện không có khách nào trong viện' : 'Chưa có lịch sử thăm'}
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
};