import React, { useState } from 'react';
import { Activity, Heart, Thermometer, Wind, Plus, Save, X } from 'lucide-react';
import { Resident, VitalSign, User } from '../../../types/index';

const VitalInputModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (v: VitalSign) => void }) => {
   const [data, setData] = useState({
      bpMorningSys: '', bpMorningDia: '',
      bpNoonSys: '', bpNoonDia: '',
      bpEveningSys: '', bpEveningDia: '',
      pulse: '', temp: '', spo2: ''
   });

   const handleSave = () => {
      const today = new Date().toISOString().split('T')[0];
      onSave({
         id: Math.random().toString(36).substr(2, 9),
         residentId: '', // Filled by parent or context
         recordDate: today,
         bpMorningSystolic: data.bpMorningSys ? Number(data.bpMorningSys) : undefined,
         bpMorningDiastolic: data.bpMorningDia ? Number(data.bpMorningDia) : undefined,
         bpNoonSystolic: data.bpNoonSys ? Number(data.bpNoonSys) : undefined,
         bpNoonDiastolic: data.bpNoonDia ? Number(data.bpNoonDia) : undefined,
         bpEveningSystolic: data.bpEveningSys ? Number(data.bpEveningSys) : undefined,
         bpEveningDiastolic: data.bpEveningDia ? Number(data.bpEveningDia) : undefined,
         pulse: Number(data.pulse) || 0,
         temperature: Number(data.temp) || 0,
         spo2: Number(data.spo2) || 0,
         recordedBy: user.id,
         createdAt: new Date().toISOString()
      } as any); // Type cast until full integration
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-slate-800">Cập nhật sinh hiệu (3 lần/ngày)</h3>
               <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-6">
               {/* Morning */}
               <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 mb-2 uppercase">Sáng (6:00 - 8:00)</p>
                  <div className="flex items-center gap-2">
                     <div className="flex-1">
                        <label className="block text-[10px] text-slate-500 mb-1">Huyết áp</label>
                        <div className="flex items-center gap-1">
                           <input type="number" placeholder="120" className="w-full border rounded p-2 text-center text-sm" value={data.bpMorningSys} onChange={e => setData({ ...data, bpMorningSys: e.target.value })} />
                           <span>/</span>
                           <input type="number" placeholder="80" className="w-full border rounded p-2 text-center text-sm" value={data.bpMorningDia} onChange={e => setData({ ...data, bpMorningDia: e.target.value })} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Noon */}
               <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs font-bold text-orange-700 mb-2 uppercase">Trưa (11:00 - 12:00)</p>
                  <div className="flex items-center gap-2">
                     <div className="flex-1">
                        <label className="block text-[10px] text-slate-500 mb-1">Huyết áp</label>
                        <div className="flex items-center gap-1">
                           <input type="number" placeholder="120" className="w-full border rounded p-2 text-center text-sm" value={data.bpNoonSys} onChange={e => setData({ ...data, bpNoonSys: e.target.value })} />
                           <span>/</span>
                           <input type="number" placeholder="80" className="w-full border rounded p-2 text-center text-sm" value={data.bpNoonDia} onChange={e => setData({ ...data, bpNoonDia: e.target.value })} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Evening */}
               <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-700 mb-2 uppercase">Chiều/Tối (17:00 - 18:00)</p>
                  <div className="flex items-center gap-2">
                     <div className="flex-1">
                        <label className="block text-[10px] text-slate-500 mb-1">Huyết áp</label>
                        <div className="flex items-center gap-1">
                           <input type="number" placeholder="120" className="w-full border rounded p-2 text-center text-sm" value={data.bpEveningSys} onChange={e => setData({ ...data, bpEveningSys: e.target.value })} />
                           <span>/</span>
                           <input type="number" placeholder="80" className="w-full border rounded p-2 text-center text-sm" value={data.bpEveningDia} onChange={e => setData({ ...data, bpEveningDia: e.target.value })} />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-3 border-t pt-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Mạch (l/p)</label>
                     <input type="number" className="w-full border rounded p-2 text-sm" value={data.pulse} onChange={e => setData({ ...data, pulse: e.target.value })} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Nhiệt độ (°C)</label>
                     <input type="number" className="w-full border rounded p-2 text-sm" value={data.temp} onChange={e => setData({ ...data, temp: e.target.value })} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">SpO2 (%)</label>
                     <input type="number" className="w-full border rounded p-2 text-sm" value={data.spo2} onChange={e => setData({ ...data, spo2: e.target.value })} />
                  </div>
               </div>
            </div>
            <div className="mt-6">
               <button onClick={handleSave} className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Lưu chỉ số ngày hôm nay
               </button>
            </div>
         </div>
      </div>
   );
};

export const VitalSignsSection = ({ user, resident, onUpdate }: { user: User, resident: Resident, onUpdate: (r: Resident) => void }) => {
   const [showModal, setShowModal] = useState(false);
   const vitals = resident.vitalSigns || [];

   // Get latest
   const latest = vitals.length > 0 ? vitals[0] : null;

   const handleAdd = (v: VitalSign) => {
      onUpdate({
         ...resident,
         vitalSigns: [v, ...vitals]
      });
      setShowModal(false);
   };

   return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         {showModal && <VitalInputModal user={user} onClose={() => setShowModal(false)} onSave={handleAdd} />}

         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <Activity className="w-5 h-5 text-teal-600" /> Chỉ số sinh hiệu
            </h3>
            <button onClick={() => setShowModal(true)} className="text-xs bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded hover:bg-teal-50 flex items-center gap-1 font-medium">
               <Plus className="w-3 h-3" /> Cập nhật
            </button>
         </div>

         {latest ? (
            <div className="grid grid-cols-1 divide-y divide-slate-100 border-b border-slate-100">
               <div className="p-4 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-2 rounded">
                     <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Sáng</p>
                     <p className="font-bold text-slate-900">{latest.bpMorningSystolic || '-'}/{latest.bpMorningDiastolic || '-'}</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                     <p className="text-[10px] text-orange-600 font-bold uppercase mb-1">Trưa</p>
                     <p className="font-bold text-slate-900">{latest.bpNoonSystolic || '-'}/{latest.bpNoonDiastolic || '-'}</p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded">
                     <p className="text-[10px] text-indigo-600 font-bold uppercase mb-1">Chiều</p>
                     <p className="font-bold text-slate-900">{latest.bpEveningSystolic || '-'}/{latest.bpEveningDiastolic || '-'}</p>
                  </div>
               </div>
               <div className="p-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                     <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1"><Heart className="w-3 h-3" /> Mạch</p>
                     <p className="font-bold">{latest.pulse || '-'}</p>
                  </div>
                  <div>
                     <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1"><Thermometer className="w-3 h-3" /> Nhiệt độ</p>
                     <p className="font-bold">{latest.temperature || '-'}</p>
                  </div>
                  <div>
                     <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1"><Wind className="w-3 h-3" /> SpO2</p>
                     <p className="font-bold">{latest.spo2 || '-'}</p>
                  </div>
               </div>
            </div>
         ) : (
            <div className="p-8 text-center text-slate-400 italic">Chưa có dữ liệu sinh hiệu hôm nay</div>
         )}

         {vitals.length > 0 && (
            <div className="p-4 bg-slate-50/50">
               <p className="text-xs font-bold text-slate-500 mb-3">LỊCH SỬ GẦN ĐÂY</p>
               <div className="space-y-2">
                  {vitals.slice(0, 3).map(v => (
                     <div key={v.id} className="flex justify-between items-center text-sm p-3 bg-white rounded border border-slate-100">
                        <div>
                           <span className="text-slate-900 font-medium block">{new Date(v.recordDate).toLocaleDateString('vi-VN')}</span>
                           <span className="text-xs text-slate-400">Ghi bởi: {v.recordedBy || 'N/A'}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-600">
                           <div className="text-center">
                              <span className="block text-slate-400">Sáng</span>
                              <span className="font-bold">{v.bpMorningSystolic || '-'}/{v.bpMorningDiastolic || '-'}</span>
                           </div>
                           <div className="text-center">
                              <span className="block text-slate-400">Trưa</span>
                              <span className="font-bold">{v.bpNoonSystolic || '-'}/{v.bpNoonDiastolic || '-'}</span>
                           </div>
                           <div className="text-center">
                              <span className="block text-slate-400">Chiều</span>
                              <span className="font-bold">{v.bpEveningSystolic || '-'}/{v.bpEveningDiastolic || '-'}</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};