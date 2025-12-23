import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, Activity, Stethoscope, CheckCircle2 } from 'lucide-react';
import { Resident } from '../../../types/index';
import { StatCard } from './StatCard';
import { Card } from '../../../components/ui/Card';
import { RecentAdmissions } from './RecentAdmissions';
import { useToast } from '../../../app/providers';

export const DoctorDashboard = ({ residents, onSelectResident }: { residents: Resident[], onSelectResident: (r: Resident) => void }) => {
  const needsAssessment = residents.filter(r => r.assessments.length === 0).length;
  const criticalCondition = residents.filter(r => r.careLevel === 4).length;
  const activeResidents = residents.filter(r => r.status === 'Active').length;
  const { addToast } = useToast();
  
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Generate dynamic tasks based on residents on mount or resident update
  useEffect(() => {
     const newTasks = [];
     const now = new Date();
     const hour = now.getHours();

     // 1. Monitoring Plans
     residents.forEach(r => {
        if (r.status === 'Active' && r.specialMonitoring && r.specialMonitoring.length > 0) {
           r.specialMonitoring.forEach(plan => {
              if (plan.status === 'Active') {
                 newTasks.push({
                    id: `MON-${r.id}-${plan.id}`,
                    time: `${hour}:00`, // Mock time
                    patient: r.name,
                    room: r.room,
                    task: `${plan.type}: ${plan.note || 'Theo dõi định kỳ'}`,
                    priority: 'High'
                 });
              }
           });
        }
     });

     // 2. High Care Level Routine Checks
     residents.filter(r => r.careLevel === 4 && r.status === 'Active').forEach(r => {
        newTasks.push({
           id: `CHECK-${r.id}`,
           time: `${hour}:30`,
           patient: r.name,
           room: r.room,
           task: 'Kiểm tra sinh hiệu & Chăm sóc toàn diện (Cấp độ 4)',
           priority: 'Normal'
        });
     });

     // 3. New Admissions (No assessments yet)
     residents.filter(r => r.assessments.length === 0 && r.status === 'Active').forEach(r => {
        newTasks.push({
           id: `ADM-${r.id}`,
           time: 'Pending',
           patient: r.name,
           room: r.room,
           task: 'Đánh giá đầu vào & Lập hồ sơ sức khỏe',
           priority: 'Critical'
        });
     });

     setTasks(newTasks.slice(0, 8));
  }, [residents]);

  const handleCompleteTask = (taskId: string, taskName: string) => {
     setCompletedTasks([...completedTasks, taskId]);
     addToast('success', 'Đã hoàn thành', `Đã xác nhận thực hiện: ${taskName}`);
  };

  const pendingTasks = tasks.filter(t => !completedTasks.includes(t.id));

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard title="Tổng số bệnh nhân" value={activeResidents} icon={Users} color="bg-blue-500" />
         <StatCard title="Cần đánh giá" value={needsAssessment} icon={ClipboardList} color="bg-orange-500" subtext={<span className="text-xs text-orange-600">NCT mới nhập viện</span>} />
         <StatCard title="Chăm sóc đặc biệt" value={criticalCondition} icon={Activity} color="bg-red-500" subtext={<span className="text-xs text-red-600">Cấp độ 4</span>} />
         <StatCard title="Lịch khám hôm nay" value={pendingTasks.length} icon={Stethoscope} color="bg-teal-500" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <Card title={`Lịch khám bệnh & Theo dõi (${pendingTasks.length})`}>
                <div className="space-y-4">
                   {pendingTasks.length > 0 ? pendingTasks.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 pb-3 border-b border-slate-50 last:border-0 last:pb-0 hover:bg-slate-50 p-2 rounded transition-colors group">
                         <div className="flex items-start gap-4">
                            <div className={`font-bold px-3 py-1 rounded text-sm min-w-[80px] text-center ${item.time === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-teal-50 text-teal-700'}`}>
                                {item.time}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 cursor-pointer hover:text-teal-700" onClick={() => onSelectResident(residents.find(r => r.name === item.patient)!)}>
                                   {item.patient} <span className="font-normal text-slate-500 text-sm">- P.{item.room}</span>
                                </p>
                                <p className="text-sm text-slate-600">{item.task}</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => handleCompleteTask(item.id, item.task)}
                            className="opacity-0 group-hover:opacity-100 text-teal-600 hover:bg-teal-50 p-2 rounded-full transition-all"
                            title="Đánh dấu hoàn thành"
                         >
                            <CheckCircle2 className="w-5 h-5" />
                         </button>
                      </div>
                   )) : (
                      <div className="text-center py-12 flex flex-col items-center justify-center text-slate-400">
                         <CheckCircle2 className="w-12 h-12 mb-3 text-slate-200" />
                         <p className="italic">Đã hoàn thành tất cả công việc!</p>
                      </div>
                   )}
                </div>
             </Card>
          </div>
          <div className="space-y-6">
             <RecentAdmissions residents={residents} onSelectResident={onSelectResident} />
             <Card title="Cảnh báo y tế">
                <div className="space-y-3">
                   <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                      <Activity className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                         <p className="font-bold">R003 - Lê Văn Tám</p>
                         <p>Huyết áp tăng cao (160/95) lúc 07:00</p>
                      </div>
                   </div>
                   <div className="p-3 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-100 flex items-start gap-2">
                      <ClipboardList className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                         <p className="font-bold">R001 - Nguyễn Văn Minh</p>
                         <p>Bỏ ăn sáng, kêu mệt mỏi</p>
                      </div>
                   </div>
                </div>
             </Card>
          </div>
       </div>
    </div>
  );
};