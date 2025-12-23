import React, { useState, useMemo } from 'react';
import { Pill, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MedicationLog, Prescription, Resident } from '../../../types/index';
import { MedicationCard } from '../components/MedicationCard';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useMedicationStore } from '../../../stores/medicationStore';

export const MedicationPage = () => {
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();
   const { logs, addLog } = useMedicationStore();
   const [selectedShift, setSelectedShift] = useState<'Morning' | 'Noon' | 'Afternoon' | 'Night'>('Morning');
   const [selectedFloor, setSelectedFloor] = useState('All');
   const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

   if (!user) return null;

   const shifts = {
      Morning: { label: 'Sáng', time: '07:00 - 08:00', icon: '🌅' },
      Noon: { label: 'Trưa', time: '11:30 - 12:30', icon: '☀️' },
      Afternoon: { label: 'Chiều', time: '16:00 - 17:00', icon: '⛅' },
      Night: { label: 'Tối', time: '20:00 - 21:00', icon: '🌙' },
   };

   // Helper to check if a prescription matches the current shift
   const isPrescriptionForShift = (p: Prescription, shift: string) => {
      const freq = p.frequency.toLowerCase();
      const map: Record<string, string[]> = {
         'Morning': ['sáng', 'morning'],
         'Noon': ['trưa', 'noon'],
         'Afternoon': ['chiều', 'afternoon'],
         'Night': ['tối', 'đêm', 'night']
      };
      return map[shift].some(s => freq.includes(s)) && p.status === 'Active';
   };

   const filteredData = useMemo(() => {
      return residents.filter(r => {
         if (r.status !== 'Active') return false;
         if (selectedFloor !== 'All' && r.floor !== selectedFloor) return false;

         // Check if resident has any meds for this shift
         return r.prescriptions.some(p => isPrescriptionForShift(p, selectedShift));
      }).map(r => ({
         resident: r,
         prescriptions: r.prescriptions.filter(p => isPrescriptionForShift(p, selectedShift))
      }));
   }, [residents, selectedFloor, selectedShift]);

   const totalMeds = filteredData.reduce((acc, item) => acc + item.prescriptions.length, 0);
   const givenMeds = filteredData.reduce((acc, item) => {
      return acc + item.prescriptions.filter(p => {
         const log = logs.find(l => l.prescriptionId === p.id && l.date === currentDate && l.time === selectedShift);
         return log && log.status !== 'Pending';
      }).length;
   }, 0);
   const progress = totalMeds > 0 ? Math.round((givenMeds / totalMeds) * 100) : 0;

   const handleLog = async (resident: Resident, prescriptionId: string, status: 'Given' | 'Refused', note?: string) => {
      const prescription = resident.prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) return;

      const newLog: MedicationLog = {
         id: `LOG-${Date.now()}`,
         residentId: resident.id,
         prescriptionId: prescription.id,
         medicationName: prescription.medicationName,
         dose: prescription.dosage,
         time: selectedShift,
         date: currentDate,
         status,
         performer: user.name,
         note
      };

      try {
         await addLog(newLog);
         if (status === 'Given') {
            toast.success(`Đã phát ${prescription.medicationName} cho ${resident.name}`);
         } else {
            toast('Đã ghi nhận từ chối', { icon: '⚠️' });
         }
      } catch (error) {
         toast.error('Lỗi khi ghi nhận');
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Cấp phát thuốc</h2>
               <p className="text-sm text-slate-500">Quản lý vòng phát thuốc hàng ngày</p>
            </div>
            <div className="flex gap-2 items-center bg-white p-1 rounded-lg border border-slate-200">
               <Calendar className="w-4 h-4 ml-2 text-slate-400" />
               <input
                  type="date"
                  className="border-none text-sm focus:ring-0 text-slate-700 font-medium"
                  value={currentDate}
                  onChange={e => setCurrentDate(e.target.value)}
               />
            </div>
         </div>

         {/* Shift Selector */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
               <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  {(Object.keys(shifts) as Array<keyof typeof shifts>).map(key => (
                     <button
                        key={key}
                        onClick={() => setSelectedShift(key)}
                        className={`flex flex-col items-center px-6 py-2 rounded-lg border-2 transition-all min-w-[100px] ${selectedShift === key
                           ? 'border-teal-500 bg-teal-50 text-teal-700'
                           : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                           }`}
                     >
                        <span className="text-lg">{shifts[key].icon}</span>
                        <span className="font-bold text-sm">{shifts[key].label}</span>
                        <span className="text-[10px] opacity-70">{shifts[key].time}</span>
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex-1 md:w-64">
                     <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>Tiến độ ca trực</span>
                        <span>{givenMeds}/{totalMeds} ({progress}%)</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-teal-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                     </div>
                  </div>

                  <select
                     className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                     value={selectedFloor}
                     onChange={e => setSelectedFloor(e.target.value)}
                  >
                     <option value="All">Tất cả tầng</option>
                     <option value="Tầng 1">Tầng 1</option>
                     <option value="Tầng 2">Tầng 2</option>
                     <option value="Tầng 3">Tầng 3</option>
                     <option value="Tầng 4">Tầng 4</option>
                  </select>
               </div>
            </div>
         </div>

         {/* Residents Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredData.map(({ resident, prescriptions }) => (
               <MedicationCard
                  key={resident.id}
                  resident={resident}
                  prescriptions={prescriptions}
                  logs={logs.filter(l => l.residentId === resident.id && l.date === currentDate && l.time === selectedShift)}
                  shift={selectedShift}
                  date={currentDate}
                  onLog={(pId, status, note) => handleLog(resident, pId, status, note)}
               />
            ))}
            {filteredData.length === 0 && (
               <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Không có đơn thuốc nào cần phát cho ca này.</p>
               </div>
            )}
         </div>
      </div>
   );
};