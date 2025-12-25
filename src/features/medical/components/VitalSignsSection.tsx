import React, { useState, useEffect } from 'react';
import { Activity, Heart, Thermometer, Wind, Plus, Save, X, Loader2, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Resident, User } from '../../../types/index';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { DailyMonitoringRecord, DailyMonitoringUpdate } from '@/src/types/dailyMonitoring';
import { MetricDetailModal } from './MetricDetailModal';

// --- Helper Components ---

const StatusBadge = ({ label, color }: { label: string, color: string }) => (
   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>
      {label}
   </span>
);

const TrendIcon = ({ current, previous }: { current: number, previous: number }) => {
   if (!previous) return <Minus className="w-3 h-3 text-slate-300" />;
   const diff = current - previous;
   if (diff > 0) return <TrendingUp className="w-3 h-3 text-red-500" />;
   if (diff < 0) return <TrendingDown className="w-3 h-3 text-green-500" />; // Context dependent colors? Assume lower is better generally for simplicty or mixed.
   return <Minus className="w-3 h-3 text-slate-400" />;
};

const SummaryCard = ({
   title,
   value,
   unit,
   icon: Icon,
   colorClass,
   onClick,
   status
}: {
   title: string,
   value: string | number | undefined | null,
   unit: string,
   icon: any,
   colorClass: string,
   onClick: () => void,
   status?: { label: string, color: string }
}) => (
   <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-teal-200 transition-all group relative overflow-hidden"
   >
      <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.replace('bg-', 'text-')}`}>
         <Icon className="w-16 h-16" />
      </div>

      <div className="flex justify-between items-start mb-2">
         <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="w-5 h-5" />
         </div>
         {status && <StatusBadge label={status.label} color={status.color} />}
      </div>

      <div>
         <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</p>
         <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900">{value || '--'}</span>
            <span className="text-xs text-slate-400 font-medium">{unit}</span>
         </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-slate-400 group-hover:text-teal-600 transition-colors">
         Xem chi tiết <ChevronRight className="w-3 h-3" />
      </div>
   </div>
);

// Reusing existing modal logic from previous step, keeping it internal or imported? 
// For cleanliness, let's keep the InputModal inline here as it's specific to data entry, 
// but the DetailModal is imported.

const VitalInputModal = ({ user, residentId, onClose, onSave }: { user: User, residentId: string, onClose: () => void, onSave: () => void }) => {
   const { updateRecord } = useMonitoringStore();
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Form state
   const [bpMorning, setBpMorning] = useState('');
   const [bpNoon, setBpNoon] = useState('');
   const [bpEvening, setBpEvening] = useState('');
   const [pulse, setPulse] = useState('');
   const [temp, setTemp] = useState('');
   const [spo2, setSpo2] = useState('');

   const handleSave = async () => {
      setIsSubmitting(true);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const update: DailyMonitoringUpdate = {
         resident_id: residentId,
         record_date: dateStr,
         bp_morning: bpMorning,
         bp_afternoon: bpNoon,
         bp_evening: bpEvening,
         pulse: pulse ? parseInt(pulse) : undefined,
         temperature: temp ? parseFloat(temp) : undefined,
         sp02: spo2 ? parseInt(spo2) : undefined,
      };

      await updateRecord(update);
      setIsSubmitting(false);
      onSave(); // Trigger reload
      onClose();
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
         <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-slate-800">Cập nhật sinh hiệu hôm nay</h3>
               <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-6">
               {/* Morning */}
               <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 mb-2 uppercase">Sáng (Tham chiếu chính)</p>
                  <div>
                     <label className="block text-[10px] text-slate-500 mb-1">Huyết áp (VD: 120/80)</label>
                     <input type="text" placeholder="120/80" className="w-full border rounded p-2 text-sm" value={bpMorning} onChange={e => setBpMorning(e.target.value)} />
                  </div>
               </div>

               {/* Noon & Evening Group */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                     <p className="text-xs font-bold text-orange-700 mb-2 uppercase">Trưa</p>
                     <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Huyết áp</label>
                        <input type="text" placeholder="120/80" className="w-full border rounded p-2 text-sm" value={bpNoon} onChange={e => setBpNoon(e.target.value)} />
                     </div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                     <p className="text-xs font-bold text-indigo-700 mb-2 uppercase">Chiều</p>
                     <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Huyết áp</label>
                        <input type="text" placeholder="120/80" className="w-full border rounded p-2 text-sm" value={bpEvening} onChange={e => setBpEvening(e.target.value)} />
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-3 border-t pt-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Mạch (l/p)</label>
                     <input type="number" className="w-full border rounded p-2 text-sm" value={pulse} onChange={e => setPulse(e.target.value)} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Nhiệt độ (°C)</label>
                     <input type="number" className="w-full border rounded p-2 text-sm" value={temp} onChange={e => setTemp(e.target.value)} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">SpO2 (%)</label>
                     <input type="number" className="w-full border rounded p-2 text-sm" value={spo2} onChange={e => setSpo2(e.target.value)} />
                  </div>
               </div>
            </div>
            <div className="mt-6">
               <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
               >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu chỉ số
               </button>
            </div>
         </div>
      </div>
   );
};

export const VitalSignsSection = ({ user, resident }: { user: User, resident: Resident }) => {
   const [showInputModal, setShowInputModal] = useState(false);
   const [selectedMetric, setSelectedMetric] = useState<'bp' | 'pulse' | 'sp02' | 'temp' | null>(null);

   const { fetchResidentRecords } = useMonitoringStore();
   const [history, setHistory] = useState<DailyMonitoringRecord[]>([]);
   const [loading, setLoading] = useState(false);

   const loadHistory = async () => {
      setLoading(true);
      const data = await fetchResidentRecords(resident.id);
      setHistory(data);
      setLoading(false);
   };

   useEffect(() => {
      loadHistory();
   }, [resident.id]);

   const latest = history.length > 0 ? history[0] : null;

   // Simple Status Checkers (Mock logic for demonstration)
   const getBpStatus = (val?: string) => {
      if (!val) return null;
      const sys = parseInt(val.split('/')[0]);
      if (sys >= 140) return { label: 'Cao', color: 'bg-red-100 text-red-700' };
      if (sys <= 90) return { label: 'Thấp', color: 'bg-blue-100 text-blue-700' };
      return { label: 'Ổn định', color: 'bg-green-100 text-green-700' };
   };

   return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
         {showInputModal && <VitalInputModal user={user} residentId={resident.id} onClose={() => setShowInputModal(false)} onSave={loadHistory} />}

         {selectedMetric && (
            <MetricDetailModal
               isOpen={!!selectedMetric}
               onClose={() => setSelectedMetric(null)}
               type={selectedMetric}
               data={history}
               residentName={resident.name}
            />
         )}

         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" /> Chỉ số sinh hiệu & Theo dõi
               </h3>
               {latest && <p className="text-xs text-slate-500 mt-1">Cập nhật lần cuối: {new Date(latest.record_date).toLocaleDateString('vi-VN')}</p>}
            </div>

            <button onClick={() => setShowInputModal(true)} className="text-xs bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-1 font-medium shadow-sm active:scale-95 transition-all">
               <Plus className="w-3 h-3" /> Cập nhật chỉ số
            </button>
         </div>

         <div className="p-4">
            {loading ? (
               <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SummaryCard
                     title="Huyết áp"
                     value={latest?.bp_morning}
                     unit="mmHg"
                     icon={Activity}
                     colorClass="bg-blue-50 text-blue-600"
                     status={getBpStatus(latest?.bp_morning) || undefined}
                     onClick={() => setSelectedMetric('bp')}
                  />
                  <SummaryCard
                     title="Nhịp tim"
                     value={latest?.pulse}
                     unit="lần/phút"
                     icon={Heart}
                     colorClass="bg-pink-50 text-pink-600"
                     status={latest?.pulse && latest.pulse > 100 ? { label: 'Nhanh', color: 'bg-orange-100 text-orange-700' } : undefined}
                     onClick={() => setSelectedMetric('pulse')}
                  />
                  <SummaryCard
                     title="SpO2"
                     value={latest?.sp02}
                     unit="%"
                     icon={Wind}
                     colorClass="bg-sky-50 text-sky-600"
                     status={latest?.sp02 && latest.sp02 < 95 ? { label: 'Thấp', color: 'bg-red-100 text-red-700' } : undefined}
                     onClick={() => setSelectedMetric('sp02')}
                  />
                  <SummaryCard
                     title="Nhiệt độ"
                     value={latest?.temperature}
                     unit="°C"
                     icon={Thermometer}
                     colorClass="bg-orange-50 text-orange-600"
                     status={latest?.temperature && latest.temperature > 37.5 ? { label: 'Sốt', color: 'bg-red-100 text-red-700' } : undefined}
                     onClick={() => setSelectedMetric('temp')}
                  />
               </div>
            )}
         </div>
      </div>
   );
};