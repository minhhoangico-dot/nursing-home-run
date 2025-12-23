import React, { useState } from 'react';
import { ClipboardList, Plus, Clock, User, ArrowRight } from 'lucide-react';
import { HandoverReport } from '../../../types/index';
import { CreateHandoverModal } from '../components/CreateHandoverModal';
import { useToast } from '../../../app/providers';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useHandoverStore } from '../../../stores/handoverStore';

export const HandoverPage = () => {
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();
   const { handovers, addHandover } = useHandoverStore();
   const [showModal, setShowModal] = useState(false);
   const { addToast } = useToast();

   if (!user) return null;

   const handleCreateHandover = async (data: any) => {
      const newHandover: HandoverReport = {
         id: `HO${Date.now()}`,
         date: new Date().toLocaleDateString('vi-VN'),
         shift: data.shift,
         leader: user.name,
         totalResidents: residents.filter(r => r.status === 'Active').length,
         newAdmissions: 0, // In real app, calculate this
         discharges: 0, // In real app, calculate this
         transfers: 0, // In real app, calculate this
         medicalAlerts: data.criticalIssues || '',
         equipmentIssues: '',
         generalNotes: data.notes,
         createdAt: new Date().toISOString()
      };

      try {
         await addHandover(newHandover);
         setShowModal(false);
         addToast('success', 'Bàn giao thành công', 'Báo cáo bàn giao đã được lưu.');
      } catch (error) {
         addToast('error', 'Lỗi', 'Lưu báo cáo thất bại');
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Bàn giao ca trực</h2>
               <p className="text-slate-500">Ghi nhận và theo dõi thông tin chuyển giao giữa các ca</p>
            </div>
            <button
               onClick={() => setShowModal(true)}
               className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2 font-medium shadow-sm transition-all hover:shadow-md"
            >
               <Plus className="w-5 h-5" /> Tạo bàn giao mới
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {handovers.map((item) => (
               <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden">
                  <div className={`h-1.5 w-full ${item.medicalAlerts ? 'bg-red-500' : 'bg-teal-500'}`}></div>
                  <div className="p-5">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                           <Clock className="w-4 h-4" />
                           <span>{item.date} - {item.shift}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.medicalAlerts ? 'bg-red-100 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
                           {item.medicalAlerts ? 'Có lưu ý' : 'Bình thường'}
                        </span>
                     </div>

                     <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                           <User className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-800">{item.leader}</p>
                           <p className="text-xs text-slate-400">Người bàn giao</p>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div className="bg-slate-50 p-3 rounded-lg">
                           <p className="text-xs uppercase text-slate-400 font-bold mb-1">Ghi chú chung</p>
                           <p className="text-sm text-slate-700 line-clamp-2">{item.generalNotes || 'Không có ghi chú'}</p>
                        </div>

                        {item.medicalAlerts && (
                           <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                              <p className="text-xs uppercase text-red-500 font-bold mb-1">Lưu ý quan trọng</p>
                              <p className="text-sm text-red-700 font-medium line-clamp-2">{item.medicalAlerts}</p>
                           </div>
                        )}
                     </div>

                     <button className="w-full mt-4 py-2 text-sm text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition-colors flex items-center justify-center gap-1 group">
                        Xem chi tiết <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            ))}
            {handovers.length === 0 && (
               <div className="col-span-full py-12 text-center text-slate-400 border border-dashed rounded-xl">
                  Chưa có báo cáo bàn giao nào.
               </div>
            )}
         </div>

         {showModal && (
            <CreateHandoverModal
               currentUser={user}
               onClose={() => setShowModal(false)}
               onSubmit={handleCreateHandover}
            />
         )}
      </div>
   );
};