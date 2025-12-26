import React, { useState, useEffect } from 'react';
import { Activity, Heart, Thermometer, Wind, Plus, Save, X, Loader2, ChevronRight, Droplets, Utensils } from 'lucide-react';
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

interface SummaryCardProps {
   title: string;
   value: string | number | undefined | null;
   unit?: string;
   icon: any;
   colorClass: string;
   onClick: () => void;
   status?: { label: string, color: string };
   secondaryValue?: string; // e.g. for bowel movement details or BP time
}

const SummaryCard = ({
   title,
   value,
   unit,
   icon: Icon,
   colorClass,
   onClick,
   status,
   secondaryValue
}: SummaryCardProps) => (
   <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-teal-200 transition-all group relative overflow-hidden"
   >
      <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.replace('bg-', 'text-')}`}>
         <Icon className="w-16 h-16" />
      </div>

      <div className="flex justify-between items-start mb-3">
         <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="w-5 h-5" />
         </div>
         {status && <StatusBadge label={status.label} color={status.color} />}
      </div>

      <div>
         <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</p>
         <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900 line-clamp-1" title={String(value)}>{value || '--'}</span>
            {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
         </div>
         {secondaryValue && <p className="text-xs text-slate-400 mt-1">{secondaryValue}</p>}
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-slate-400 group-hover:text-teal-600 transition-colors">
         Xem lịch sử <ChevronRight className="w-3 h-3 ml-auto" />
      </div>
   </div>
);

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
   const [bloodSugar, setBloodSugar] = useState('');
   const [bowel, setBowel] = useState('');

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
         blood_sugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
         bowel_movements: bowel
      };

      await updateRecord(update);
      setIsSubmitting(false);
      onSave();
      onClose();
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
         <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
               <div>
                  <h3 className="font-bold text-xl text-slate-800">Cập nhật chỉ số hôm nay</h3>
                  <p className="text-sm text-slate-500">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
               </div>
               <button onClick={onClose}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-sm uppercase"><Activity className="w-4 h-4" /> Huyết áp</h4>
                  <div className="p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-100">
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Sáng (mmHg)</label>
                        <input type="text" placeholder="120/80" className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={bpMorning} onChange={e => setBpMorning(e.target.value)} />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-medium text-slate-600 mb-1">Trưa</label>
                           <input type="text" placeholder="--" className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={bpNoon} onChange={e => setBpNoon(e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-600 mb-1">Chiều</label>
                           <input type="text" placeholder="--" className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={bpEvening} onChange={e => setBpEvening(e.target.value)} />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-sm uppercase"><Heart className="w-4 h-4" /> Các chỉ số khác</h4>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Mạch (l/p)</label>
                        <input type="number" className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={pulse} onChange={e => setPulse(e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Thân nhiệt (°C)</label>
                        <input type="number" step="0.1" className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={temp} onChange={e => setTemp(e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">SpO2 (%)</label>
                        <input type="number" className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={spo2} onChange={e => setSpo2(e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Đường huyết (mmol/L)</label>
                        <input type="number" step="0.1" className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-600 mb-1">Đại tiện</label>
                     <input type="text" placeholder="Mô tả (VD: 1 lần, bình thường)" className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" value={bowel} onChange={e => setBowel(e.target.value)} />
                  </div>
               </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
               <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Hủy bỏ</button>
               <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium flex items-center gap-2 shadow-lg shadow-teal-200 disabled:opacity-50 min-w-[120px] justify-center"
               >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu
               </button>
            </div>
         </div>
      </div>
   );
};

export const VitalSignsSection = ({ user, resident }: { user: User, resident: Resident }) => {
   const [showInputModal, setShowInputModal] = useState(false);
   const [selectedMetric, setSelectedMetric] = useState<'bp' | 'pulse' | 'sp02' | 'temp' | 'blood_sugar' | 'bowel' | null>(null);

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

   // Helper to get latest BP
   const getLatestBP = (r?: DailyMonitoringRecord) => {
      if (!r) return null;
      return r.bp_morning || r.bp_afternoon || r.bp_evening;
   };

   return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
         {showInputModal && <VitalInputModal user={user} residentId={resident.id} onClose={() => setShowInputModal(false)} onSave={loadHistory} />}

         {/* Note: Ensure MetricDetailModal supports the new types 'blood_sugar' and 'bowel' or fallback gracefully */}
         {selectedMetric && (
            <MetricDetailModal
               isOpen={!!selectedMetric}
               onClose={() => setSelectedMetric(null)}
               type={selectedMetric as any}
               data={history}
               residentName={resident.name}
            />
         )}

         <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
               <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-teal-600" /> Chỉ số sinh hiệu
               </h3>
               <p className="text-sm text-slate-500 mt-1">
                  {latest ? `Cập nhật: ${new Date(latest.record_date).toLocaleDateString('vi-VN')}` : 'Chưa có thông tin hôm nay'}
               </p>
            </div>

            <button onClick={() => setShowInputModal(true)} className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-100 flex items-center gap-2 font-medium transition-colors border border-teal-100">
               <Plus className="w-4 h-4" /> Cập nhật
            </button>
         </div>

         <div className="p-6 bg-slate-50/50">
            {loading ? (
               <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
            ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <SummaryCard
                     title="Mạch"
                     value={latest?.pulse}
                     unit="l/p"
                     icon={Heart}
                     colorClass="bg-rose-50 text-rose-600"
                     status={latest?.pulse && latest.pulse > 100 ? { label: 'Cao', color: 'bg-red-100 text-red-700' } : undefined}
                     onClick={() => setSelectedMetric('pulse')}
                  />
                  <SummaryCard
                     title="Huyết áp"
                     value={getLatestBP(latest)}
                     unit="mmHg"
                     icon={Activity}
                     colorClass="bg-blue-50 text-blue-600"
                     secondaryValue={latest?.bp_morning ? 'Đo sáng' : undefined}
                     onClick={() => setSelectedMetric('bp')}
                  />
                  <SummaryCard
                     title="Đại tiện"
                     value={latest?.bowel_movements || '--'}
                     unit=""
                     icon={Utensils} // Using Utensils as proxy for Bowel/Digestion or maybe another icon? 'AlignJustify'? 'Circle'? Let's stick to known icon or generic.
                     colorClass="bg-amber-50 text-amber-600"
                     onClick={() => setSelectedMetric('bowel')}
                  />
                  <SummaryCard
                     title="Đường huyết"
                     value={latest?.blood_sugar}
                     unit="mmol/L"
                     icon={Droplets}
                     colorClass="bg-emerald-50 text-emerald-600"
                     status={latest?.blood_sugar && latest.blood_sugar > 7 ? { label: 'Cao', color: 'bg-orange-100 text-orange-700' } : undefined}
                     onClick={() => setSelectedMetric('blood_sugar')}
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