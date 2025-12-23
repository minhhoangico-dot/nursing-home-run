import React, { useState } from 'react';
import { Activity, Pill, Package, AlertCircle, Users, Printer } from 'lucide-react';
import { PrintableForm } from '../components/PrintableForm';
import { BUILDING_STRUCTURE, getFloorsForBuilding } from '@/src/constants/facility';
import { useAuthStore } from '@/src/stores/authStore';
import { useResidentsStore } from '@/src/stores/residentsStore';

export const PrintFormsPage = () => {
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();

   const [selectedForm, setSelectedForm] = useState<any | null>(null);
   const [showConfig, setShowConfig] = useState(false);
   const [config, setConfig] = useState({
      date: new Date().toISOString().split('T')[0],
      building: 'Tòa A',
      floor: 'Tầng 1',
      shift: 'Sáng'
   });

   if (!user) return null; // Guard clause if needed

   const currentFloors = getFloorsForBuilding(config.building);

   const forms = [
      { id: 'vitals', name: 'Phiếu theo dõi sinh hiệu', icon: Activity, desc: 'In cho từng tầng để điều dưỡng ghi chép hàng ngày.', hasShift: false },
      { id: 'meds', name: 'Phiếu phát thuốc', icon: Pill, desc: 'Danh sách thuốc cần phát theo ca trực.', hasShift: true },
      { id: 'meals', name: 'Phiếu theo dõi bữa ăn', icon: Package, desc: 'Ghi nhận tình trạng ăn uống của NCT.', hasShift: false },
      { id: 'incident', name: 'Phiếu ghi nhận sự cố', icon: AlertCircle, desc: 'Dùng khi có tai nạn, té ngã hoặc sự cố y khoa.', hasShift: false },
      { id: 'shift', name: 'Phiếu phân công ca trực', icon: Users, desc: 'Lịch trực tuần cho nhân viên.', hasShift: false },
   ];

   const handleFormClick = (form: any) => {
      setSelectedForm(form);
      setShowConfig(true);
   };

   const handlePrint = () => {
      setShowConfig(false);
   };

   return (
      <>
         {/* Configuration Modal */}
         {showConfig && selectedForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
               <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <Printer className="w-5 h-5 text-teal-600" />
                     Cấu hình in: {selectedForm.name}
                  </h3>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ngày in</label>
                        <input
                           type="date"
                           value={config.date}
                           onChange={e => setConfig({ ...config, date: e.target.value })}
                           className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                     </div>

                     {selectedForm.id !== 'incident' && (
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Tòa nhà</label>
                              <select
                                 value={config.building}
                                 onChange={e => {
                                    const newBuilding = e.target.value;
                                    const newFloors = getFloorsForBuilding(newBuilding);
                                    setConfig({ ...config, building: newBuilding, floor: newFloors[0] || '' });
                                 }}
                                 className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                              >
                                 {BUILDING_STRUCTURE.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                 ))}
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Tầng</label>
                              <select
                                 value={config.floor}
                                 onChange={e => setConfig({ ...config, floor: e.target.value })}
                                 className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                              >
                                 {currentFloors.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                 ))}
                              </select>
                           </div>
                        </div>
                     )}

                     {selectedForm.hasShift && (
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Ca trực</label>
                           <select
                              value={config.shift}
                              onChange={e => setConfig({ ...config, shift: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                           >
                              <option value="Sáng">Sáng (06:00 - 14:00)</option>
                              <option value="Chiều">Chiều (14:00 - 22:00)</option>
                              <option value="Đêm">Đêm (22:00 - 06:00)</option>
                           </select>
                        </div>
                     )}
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                     <button
                        onClick={() => { setShowConfig(false); setSelectedForm(null); }}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                     >
                        Hủy
                     </button>
                     <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-medium flex items-center gap-2"
                     >
                        <Printer className="w-4 h-4" /> Xem bản in
                     </button>
                  </div>
               </div>
            </div>
         )}

         {!showConfig && selectedForm ? (
            <PrintableForm
               user={user}
               residents={residents}
               type={selectedForm.name.toUpperCase()}
               formId={selectedForm.id}
               config={config}
               onClose={() => setSelectedForm(null)}
            />
         ) : (
            <div className="space-y-6">
               <h2 className="text-2xl font-bold text-slate-800">Trung tâm Biểu mẫu & In ấn</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.map(f => (
                     <div key={f.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-teal-400 transition-colors group cursor-pointer" onClick={() => handleFormClick(f)}>
                        <div className="bg-teal-50 text-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                           <f.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2">{f.name}</h3>
                        <p className="text-sm text-slate-500">{f.desc}</p>
                        <div className="mt-4 flex items-center text-teal-600 text-sm font-medium">
                           <Printer className="w-4 h-4 mr-2" /> Chọn in
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </>
   );
};