import React from 'react';
import { BedDouble, Users, AlertCircle, Wrench, ClipboardList } from 'lucide-react';
import { Resident, MaintenanceRequest } from '../../../types/index';
import { StatCard } from './StatCard';
import { Card } from '../../../components/ui/Card';
import { useToast } from '../../../app/providers';

interface FloorHeadDashboardProps {
   residents: Resident[];
   maintenanceRequests?: MaintenanceRequest[];
}

export const FloorHeadDashboard = ({ residents, maintenanceRequests = [] }: FloorHeadDashboardProps) => {
   const { addToast } = useToast();

   const activeResidents = residents.filter(r => r.status === 'Active').length;
   const totalCapacity = 56;
   const availableBeds = totalCapacity - activeResidents;

   const activeMaintenance = maintenanceRequests.filter(r => r.status === 'Pending' || r.status === 'In_Progress').length;
   const medicalAlerts = residents.filter(r => r.careLevel === 4 && r.status === 'Active').length;

   const handleAction = (action: string, detail: string) => {
      addToast('success', 'Đã cập nhật trạng thái', `${action}: ${detail}`);
   };

   return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="NCT phụ trách" value={activeResidents} icon={Users} color="bg-blue-500" />
            <StatCard title="Giường trống" value={availableBeds} icon={BedDouble} color="bg-green-500" />
            <StatCard title="Sự cố kỹ thuật" value={activeMaintenance} icon={Wrench} color="bg-orange-500" />
            <StatCard title="Cảnh báo y tế" value={medicalAlerts} icon={AlertCircle} color="bg-red-500" subtext={<span className="text-xs text-red-600">Cần theo dõi sát</span>} />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Giao ca & Phân công (Ca Sáng)">
               <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-800">Tầng 1 & 2</h4>
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Đủ nhân sự</span>
                     </div>
                     <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Điều dưỡng: Nguyễn Thị Lan (Trưởng nhóm)</li>
                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Hộ lý: Phạm Văn Tú, Lê Thị Mai</li>
                     </ul>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-800">Tầng 3 & 4</h4>
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Đủ nhân sự</span>
                     </div>
                     <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Điều dưỡng: Trần Văn Hùng</li>
                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Hộ lý: Ngô Văn G</li>
                     </ul>
                  </div>
               </div>
            </Card>

            <Card title="Yêu cầu cần xử lý">
               <div className="space-y-3">
                  {maintenanceRequests.filter(r => r.status === 'Pending').slice(0, 3).map(req => (
                     <div key={req.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${req.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                              <Wrench className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-800">{req.title}</p>
                              <p className="text-xs text-slate-500">{req.location} - {req.priority}</p>
                           </div>
                        </div>
                        <button onClick={() => addToast('info', 'Chi tiết', req.description)} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded font-medium hover:bg-slate-100">Chi tiết</button>
                     </div>
                  ))}
                  {maintenanceRequests.filter(r => r.status === 'Pending').length === 0 && (
                     <div className="text-center py-6 text-slate-400 italic text-sm">Không có yêu cầu bảo trì tồn đọng</div>
                  )}
               </div>
            </Card>
         </div>
      </div>
   );
};