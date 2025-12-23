import React, { useState } from 'react';
import { PenTool, Plus, Search, Filter, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { MaintenanceRequest } from '../../../types/index';
import { CreateRequestModal } from '../components/CreateRequestModal';
import { useToast } from '../../../app/providers';
import { useRoomsStore } from '../../../stores/roomsStore';
import { useAuthStore } from '../../../stores/authStore';

export const MaintenancePage = () => {
   const [showModal, setShowModal] = useState(false);
   const { addToast } = useToast();
   const { maintenanceRequests, addMaintenanceRequest } = useRoomsStore();
   const { user } = useAuthStore();

   const handleCreate = async (data: any) => {
      const newReq: MaintenanceRequest = {
         id: `MT-${Date.now()}`,
         createdAt: new Date().toISOString().split('T')[0],
         title: data.title,
         description: data.description || '',
         location: data.location,
         priority: data.priority,
         status: 'Pending',
         reporter: user?.name || 'Admin',
         // Fields required by interface but maybe missing in form or need defaults
         // Since MaintenanceRequest is strictly defined, we need to ensure all fields are present
         // or use 'as MaintenanceRequest'/partial filling if the type allows optional
      } as MaintenanceRequest;

      try {
         await addMaintenanceRequest(newReq);
         setShowModal(false);
         addToast('success', 'Thành công', 'Đã tạo yêu cầu bảo trì mới');
      } catch (error) {
         addToast('error', 'Lỗi', 'Lỗi khi tạo yêu cầu');
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Bảo trì & Sửa chữa</h2>
               <p className="text-slate-500">Quản lý các yêu cầu sửa chữa cơ sở vật chất</p>
            </div>
            <button
               onClick={() => setShowModal(true)}
               className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium shadow-sm"
            >
               <Plus className="w-5 h-5" /> Tạo yêu cầu
            </button>
         </div>

         {/* Requests List */}
         <div className="grid grid-cols-1 gap-4">
            {maintenanceRequests.length > 0 ? maintenanceRequests.map(req => (
               <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-orange-200 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${req.priority === 'Critical' ? 'bg-red-100 text-red-600' :
                        req.priority === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                        <PenTool className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800">{req.title}</h4>
                        <p className="text-sm text-slate-600">{req.location} • {req.reporter}</p>
                        <p className="text-xs text-slate-400 mt-1">{req.description}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-bold block mb-1 ${req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                           req.status === 'In_Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                           }`}>
                           {req.status === 'Completed' ? 'Hoàn thành' : req.status === 'In_Progress' ? 'Đang xử lý' : 'Chờ tiếp nhận'}
                        </span>
                        <span className="text-xs text-slate-400">{req.createdAt}</span>
                     </div>
                     {req.status !== 'Completed' && (
                        <button className="text-orange-600 text-sm font-medium hover:underline">Xử lý</button>
                     )}
                  </div>
               </div>
            )) : (
               <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
                  Chưa có yêu cầu bảo trì nào.
               </div>
            )}
         </div>

         {showModal && <CreateRequestModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
      </div>
   );
};