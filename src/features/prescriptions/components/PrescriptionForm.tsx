import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, Printer, AlertCircle, Search, Pill, User as UserIcon } from 'lucide-react';
import { Prescription, PrescriptionItem, Resident, User, InventoryItem } from '../../../types/index';
// Assuming InventoryItem matches Medicine interface roughly or we map it
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';

interface PrescriptionFormProps {
   user: User;
   resident?: Resident; // Can be passed if context is known
   residents?: Resident[]; // For selection if not passed
   onClose: () => void;
   onSave: () => void;
}

export const PrescriptionForm = ({ user, resident: initialResident, residents, onClose, onSave }: PrescriptionFormProps) => {
   const { createPrescription, medicines, fetchMedicines } = usePrescriptionsStore();
   const [selectedResidentId, setSelectedResidentId] = useState(initialResident?.id || '');
   const [diagnosis, setDiagnosis] = useState('');
   const [notes, setNotes] = useState('');
   const [duration, setDuration] = useState(7);

   useEffect(() => {
      fetchMedicines();
   }, [fetchMedicines]);

   // Items state
   const [items, setItems] = useState<Partial<PrescriptionItem>[]>([
      { id: Date.now().toString(), medicineName: '', dosage: '', frequency: '2 lần/ngày', timesOfDay: ['Sáng', 'Chiều'], quantity: 0 }
   ]);

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // Computed
   const selectedResident = initialResident || residents?.find(r => r.id === selectedResidentId);
   const prescriptionCode = `DT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

   const handleAddItem = () => {
      setItems([...items, { id: Date.now().toString(), medicineName: '', dosage: '', frequency: '2 lần/ngày', timesOfDay: ['Sáng', 'Chiều'], quantity: 0 }]);
   };

   const handleRemoveItem = (index: number) => {
      if (items.length > 1) {
         const newItems = [...items];
         newItems.splice(index, 1);
         setItems(newItems);
      }
   };

   const updateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setItems(newItems);
   };

   const calculateQuantity = (item: Partial<PrescriptionItem>) => {
      // Simple heuristic for default quantity
      // Logic could be enhanced based on frequency parsing
      return duration * 2; // Dummy default
   };

   const handleSubmit = async () => {
      if (!selectedResidentId || !diagnosis) {
         setError('Vui lòng chọn NCT và nhập chẩn đoán');
         return;
      }
      if (items.some(i => !i.medicineName || !i.dosage)) {
         setError('Vui lòng điền đầy đủ thông tin thuốc');
         return;
      }

      setLoading(true);
      setError(null);

      try {
         const now = new Date();
         const endDate = new Date(now);
         endDate.setDate(endDate.getDate() + duration);

         await createPrescription({
            code: prescriptionCode,
            residentId: selectedResidentId,
            doctorId: user.id || 'current-user-id',
            doctorName: user.name,
            diagnosis,
            prescriptionDate: now.toISOString().split('T')[0],
            startDate: now.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status: 'Active',
            notes
         }, items as any[]); // Cast for now as types align roughly

         onSave();
         onClose();
      } catch (e: any) {
         setError(e.message || 'Có lỗi xảy ra');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 bg-teal-600 text-white flex justify-between items-center shrink-0">
               <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                     <Pill className="w-5 h-5" /> Kê Đơn Thuốc Mới
                  </h2>
                  <p className="text-teal-100 text-sm mt-1 opacity-90">Mã đơn: {prescriptionCode}</p>
               </div>
               <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
               {error && (
                  <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 border border-red-100">
                     <AlertCircle className="w-5 h-5" /> {error}
                  </div>
               )}

               {/* Resident Info Section */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Người cao tuổi <span className="text-red-500">*</span></label>
                        {initialResident ? (
                           <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                              <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold">
                                 {initialResident.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900">{initialResident.name}</p>
                                 <p className="text-xs text-slate-500">Phòng {initialResident.room} - {initialResident.careLevel}</p>
                              </div>
                           </div>
                        ) : (
                           <select
                              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                              value={selectedResidentId}
                              onChange={e => setSelectedResidentId(e.target.value)}
                           >
                              <option value="">-- Chọn NCT --</option>
                              {residents?.map(r => (
                                 <option key={r.id} value={r.id}>{r.name} - {r.room}</option>
                              ))}
                           </select>
                        )}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Chẩn đoán / Lý do <span className="text-red-500">*</span></label>
                        <input
                           type="text"
                           className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                           placeholder="VD: Tăng huyết áp, Đau dạ dày..."
                           value={diagnosis}
                           onChange={e => setDiagnosis(e.target.value)}
                        />
                     </div>
                  </div>
               </div>

               <div className="mb-6 flex gap-4">
                  <div className="flex-1">
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Thời gian dùng (ngày)</label>
                     <input
                        type="number"
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                     />
                  </div>
                  <div className="flex-[2]">
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú chung</label>
                     <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="Lưu ý chung cho điều dưỡng..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                     />
                  </div>
               </div>

               {/* Medicines List */}
               <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-teal-600" /> Danh sách thuốc
                     </h3>
                     <button onClick={handleAddItem} className="text-sm text-teal-600 font-semibold hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Thêm thuốc
                     </button>
                  </div>

                  <div className="space-y-3">
                     {items.map((item, index) => (
                        <div key={item.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-teal-200 hover:shadow-sm transition-all relative group">
                           <button
                              onClick={() => handleRemoveItem(index)}
                              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              title="Xóa dòng này"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>

                           <div className="grid grid-cols-12 gap-3">
                              <div className="col-span-12 md:col-span-4">
                                 <label className="text-xs font-semibold text-slate-500 block mb-1">Tên thuốc</label>
                                 <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                       list="med-suggestions"
                                       className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                       placeholder="Tìm tên thuốc..."
                                       value={item.medicineName}
                                       onChange={e => updateItem(index, 'medicineName', e.target.value)}
                                    />
                                    <datalist id="med-suggestions">
                                       {medicines.map(m => (
                                          <option key={m.id} value={m.name}>{m.name}</option>
                                       ))}
                                    </datalist>
                                 </div>
                              </div>
                              <div className="col-span-6 md:col-span-2">
                                 <label className="text-xs font-semibold text-slate-500 block mb-1">Liều lượng</label>
                                 <input
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                    placeholder="VD: 1 viên"
                                    value={item.dosage}
                                    onChange={e => updateItem(index, 'dosage', e.target.value)}
                                 />
                              </div>
                              <div className="col-span-6 md:col-span-3">
                                 <label className="text-xs font-semibold text-slate-500 block mb-1">Tần suất</label>
                                 <div className="flex gap-2">
                                    <input
                                       className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                       placeholder="VD: 2 lần/ngày"
                                       value={item.frequency}
                                       onChange={e => updateItem(index, 'frequency', e.target.value)}
                                    />
                                 </div>
                              </div>
                              <div className="col-span-12 md:col-span-3">
                                 <label className="text-xs font-semibold text-slate-500 block mb-1">Thời điểm</label>
                                 <div className="flex flex-wrap gap-1">
                                    {['Sáng', 'Trưa', 'Chiều', 'Tối'].map(t => (
                                       <button
                                          key={t}
                                          type="button"
                                          onClick={() => {
                                             const current = item.timesOfDay || [];
                                             const newTimes = current.includes(t) ? current.filter(x => x !== t) : [...current, t];
                                             updateItem(index, 'timesOfDay', newTimes);
                                          }}
                                          className={`px-2 py-1 text-xs rounded border ${item.timesOfDay?.includes(t) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
                                       >
                                          {t}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <div className="mt-3 pt-3 border-t border-slate-100">
                              <input
                                 className="w-full text-sm text-slate-600 placeholder:text-slate-400 bg-transparent border-none p-0 focus:ring-0"
                                 placeholder="Hướng dẫn thêm (VD: Uống sau khi ăn no...)"
                                 value={item.instructions || ''}
                                 onChange={e => updateItem(index, 'instructions', e.target.value)}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
               <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">
                  Hủy bỏ
               </button>
               <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 flex items-center gap-2 transition-all disabled:opacity-70"
               >
                  {loading ? 'Đang lưu...' : <><Save className="w-5 h-5" /> Lưu đơn thuốc</>}
               </button>
            </div>
         </div>
      </div>
   );
};