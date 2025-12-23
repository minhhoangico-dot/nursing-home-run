import React, { useState } from 'react';
import { 
  Coffee, Moon, Smile, Activity, PenTool, 
  ShowerHead, Send, Filter, Clock 
} from 'lucide-react';
import { CareLog, Resident, User } from '../../../types/index';
import { Modal, Button, Input } from '../../../components/ui/index';

interface CareLogSectionProps {
  user: User;
  resident: Resident;
  onUpdate: (r: Resident) => void;
}

export const CareLogSection = ({ user, resident, onUpdate }: CareLogSectionProps) => {
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
  // New Log State
  const [newLog, setNewLog] = useState<{ category: CareLog['category'], note: string, importance: 'Normal' | 'High' }>({
    category: 'Other',
    note: '',
    importance: 'Normal'
  });

  const categories = {
    Hygiene: { label: 'Vệ sinh', icon: ShowerHead, color: 'bg-blue-100 text-blue-600' },
    Nutrition: { label: 'Ăn uống', icon: Coffee, color: 'bg-green-100 text-green-600' },
    Sleep: { label: 'Giấc ngủ', icon: Moon, color: 'bg-indigo-100 text-indigo-600' },
    Mood: { label: 'Tâm lý', icon: Smile, color: 'bg-yellow-100 text-yellow-600' },
    Activity: { label: 'Vận động', icon: Activity, color: 'bg-orange-100 text-orange-600' },
    Other: { label: 'Khác', icon: PenTool, color: 'bg-slate-100 text-slate-600' }
  };

  const handleSave = () => {
    if (!newLog.note) return;
    
    const logEntry: CareLog = {
      id: `CL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: newLog.category,
      note: newLog.note,
      performer: user.name,
      importance: newLog.importance
    };

    onUpdate({
      ...resident,
      careLogs: [logEntry, ...(resident.careLogs || [])]
    });
    
    setNewLog({ category: 'Other', note: '', importance: 'Normal' });
    setShowModal(false);
  };

  const filteredLogs = (resident.careLogs || []).filter(log => log.timestamp.startsWith(filterDate));

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Xem ngày:</span>
            <input 
               type="date" 
               className="border-none bg-transparent font-medium text-slate-800 focus:ring-0 p-0"
               value={filterDate}
               onChange={e => setFilterDate(e.target.value)}
            />
         </div>
         <div className="flex gap-2 w-full md:w-auto">
            {/* Quick Actions */}
            <button 
               onClick={() => { setNewLog({ ...newLog, category: 'Nutrition', note: 'Ăn hết suất' }); handleSave(); }}
               className="flex-1 md:flex-none px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
            >
               🍽️ Ăn hết
            </button>
            <button 
               onClick={() => { setNewLog({ ...newLog, category: 'Sleep', note: 'Đã ngủ' }); handleSave(); }}
               className="flex-1 md:flex-none px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
            >
               😴 Đã ngủ
            </button>
            <Button onClick={() => setShowModal(true)} icon={<PenTool className="w-4 h-4" />}>
               Ghi chép
            </Button>
         </div>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 py-2">
         {filteredLogs.length > 0 ? filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => {
            const CatIcon = categories[log.category].icon;
            return (
               <div key={log.id} className="relative pl-8">
                  <div className={`absolute -left-[17px] top-0 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center ${categories[log.category].color}`}>
                     <CatIcon className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-teal-200 transition-colors">
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {log.importance === 'High' && (
                           <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Quan trọng</span>
                        )}
                     </div>
                     <p className="text-slate-800 text-sm mb-2">{log.note}</p>
                     <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>{categories[log.category].label}</span>
                        <span>✍️ {log.performer}</span>
                     </div>
                  </div>
               </div>
            );
         }) : (
            <div className="pl-8 text-slate-400 italic py-8">Chưa có nhật ký nào trong ngày {new Date(filterDate).toLocaleDateString('vi-VN')}</div>
         )}
      </div>

      {/* Add Log Modal */}
      {showModal && (
         <Modal title="Ghi nhật ký chăm sóc" onClose={() => setShowModal(false)}>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Loại hoạt động</label>
                  <div className="grid grid-cols-3 gap-2">
                     {Object.entries(categories).map(([key, config]) => (
                        <button
                           key={key}
                           onClick={() => setNewLog({ ...newLog, category: key as any })}
                           className={`p-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${
                              newLog.category === key 
                              ? `${config.color} border-current ring-1 ring-offset-1` 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                           }`}
                        >
                           <config.icon className="w-5 h-5" />
                           <span className="text-xs font-medium">{config.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung ghi chép</label>
                  <textarea 
                     className="w-full border rounded-lg px-3 py-2 text-sm h-24 focus:ring-teal-500 focus:outline-none"
                     placeholder="Mô tả chi tiết (VD: Ăn hết 1/2 suất, tâm trạng vui vẻ...)"
                     value={newLog.note}
                     onChange={e => setNewLog({ ...newLog, note: e.target.value })}
                     autoFocus
                  ></textarea>
               </div>

               <div className="flex items-center gap-2">
                  <input 
                     type="checkbox" 
                     id="important"
                     className="rounded text-teal-600 focus:ring-teal-500"
                     checked={newLog.importance === 'High'}
                     onChange={e => setNewLog({ ...newLog, importance: e.target.checked ? 'High' : 'Normal' })}
                  />
                  <label htmlFor="important" className="text-sm text-slate-700 font-medium">Đánh dấu quan trọng (Bàn giao ca)</label>
               </div>

               <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} icon={<Send className="w-4 h-4" />}>Lưu nhật ký</Button>
               </div>
            </div>
         </Modal>
      )}
    </div>
  );
};