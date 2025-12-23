import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Filter, Eye, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Incident } from '../../../types/index';
import { ReportIncidentModal } from '../components/ReportIncidentModal';
import { useIncidentsStore } from '../../../stores/incidentsStore';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';

export const IncidentsPage = () => {
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();
   const { incidents, addIncident, updateIncident } = useIncidentsStore();
   const [showReportModal, setShowReportModal] = useState(false);

   if (!user) return null;

   const handleReportSubmit = async (incident: Incident) => {
      try {
         await addIncident(incident);
         setShowReportModal(false);
         toast.success('Sự cố mới đã được ghi nhận thành công.');
      } catch (error) {
         toast.error('Lỗi khi báo cáo sự cố');
      }
   };

   const getSeverityColor = (severity: string) => {
      switch (severity) {
         case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
         case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
         case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
         default: return 'bg-slate-100 text-slate-800 border-slate-200';
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Quản lý Sự cố & Rủi ro</h2>
               <p className="text-slate-500">Theo dõi và xử lý các vấn đề phát sinh trong vận hành</p>
            </div>
            <button
               onClick={() => setShowReportModal(true)}
               className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium shadow-sm transition-all hover:shadow-md shadow-red-200"
            >
               <Plus className="w-5 h-5" /> Báo cáo sự cố
            </button>
         </div>

         {/* Stats / Filters */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
               <div>
                  <p className="text-sm text-slate-500 font-medium">Sự cố chờ xử lý</p>
                  <p className="text-2xl font-bold text-red-600">{incidents.filter(i => i.status === 'New' || i.status === 'Investigating').length}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-5 h-5" />
               </div>
            </div>
            {/* Add more stats if needed */}
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex gap-4">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                     type="text"
                     placeholder="Tìm kiếm sự cố..."
                     className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
               </div>
               <button className="px-4 py-2 border rounded-lg flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Filter className="w-4 h-4" /> Lọc
               </button>
            </div>

            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                     <th className="px-6 py-3">Mã & Ngày</th>
                     <th className="px-6 py-3">Sự cố</th>
                     <th className="px-6 py-3">Địa điểm</th>
                     <th className="px-6 py-3">Mức độ</th>
                     <th className="px-6 py-3">Người báo cáo</th>
                     <th className="px-6 py-3 text-center">Trạng thái</th>
                     <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {incidents.map((incident) => (
                     <tr key={incident.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="font-mono font-bold text-slate-700">{incident.id}</div>
                           <div className="text-xs text-slate-500">{new Date(incident.date).toLocaleDateString('vi-VN')}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="font-medium text-slate-800">{incident.type}</div>
                           <div className="text-xs text-slate-500 line-clamp-1">{incident.description}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{incident.location}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getSeverityColor(incident.severity)}`}>
                              {incident.severity}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{incident.reporter}</td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${incident.status === 'New' ? 'bg-red-50 text-red-600' :
                              incident.status === 'Investigating' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                              }`}>
                              {incident.status === 'New' ? 'Mới' : incident.status === 'Resolved' ? 'Đã xong' : incident.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-slate-400 hover:text-teal-600 rounded hover:bg-teal-50" title="Xem chi tiết">
                                 <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50" title="Cập nhật tiến độ">
                                 <FileText className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {showReportModal && (
            <ReportIncidentModal
               currentUser={user}
               onClose={() => setShowReportModal(false)}
               onSubmit={handleReportSubmit}
            />
         )}
      </div>
   );
};