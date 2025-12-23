import React, { useState, useMemo } from 'react';
import { ShieldAlert, Bed, Stethoscope, ArrowRight, Wrench, X, UserPlus, LogOut, CheckCircle2, AlertTriangle, ArrowRightLeft, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Resident, Room, User, MaintenanceRequest } from '../../../types/index';
import { BUILDING_STRUCTURE, getFloorsForBuilding } from '../../../constants/facility';
import { generateRooms } from '../../../data/index';
import { TransferRoomModal } from '../components/TransferRoomModal';
import { AssignBedModal } from '../components/AssignBedModal';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useRoomsStore } from '../../../stores/roomsStore';

interface BedDetailModalProps {
   bed: any;
   roomNumber: string;
   roomType: string;
   floor: string;
   building: string;
   user: User;
   onClose: () => void;
   onAction: (action: string, bedId: string) => void;
   resident?: Resident;
}

const BedDetailModal = ({ bed, roomNumber, roomType, floor, building, user, onClose, onAction, resident }: BedDetailModalProps) => {
   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
               <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bed.status === 'Occupied' ? 'bg-teal-100 text-teal-600' :
                  bed.status === 'Maintenance' ? 'bg-orange-100 text-orange-600' :
                     'bg-slate-100 text-slate-500'
                  }`}>
                  {bed.status === 'Occupied' ? <Stethoscope className="w-6 h-6" /> :
                     bed.status === 'Maintenance' ? <Wrench className="w-6 h-6" /> :
                        <Bed className="w-6 h-6" />}
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-800">Giường {bed.id.split('-')[2]} - P.{roomNumber}</h3>
                  <p className="text-sm text-slate-500">
                     {building} • {floor} • {bed.status === 'Occupied' ? 'Đang sử dụng' :
                        bed.status === 'Maintenance' ? 'Đang bảo trì' : 'Giường trống'}
                  </p>
               </div>
            </div>

            {resident ? (
               <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100">
                  <p className="font-bold text-slate-800 text-lg mb-1">{resident.name}</p>
                  <div className="space-y-1 text-sm text-slate-600">
                     <p>Tuổi: {new Date().getFullYear() - new Date(resident.dob).getFullYear()}</p>
                     <p>Cấp độ chăm sóc: <span className="font-bold text-teal-700">{resident.careLevel}</span></p>
                     <p>Tình trạng: {resident.currentConditionNote || 'Ổn định'}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <button onClick={() => onAction('view_resident', resident.id)} className="flex-1 bg-white border border-slate-200 text-teal-700 py-2 rounded-lg font-medium hover:bg-teal-50 flex items-center justify-center gap-2 text-sm">
                        Xem hồ sơ
                     </button>
                     <button onClick={() => onAction('transfer', resident.id)} className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 flex items-center justify-center gap-2 text-sm shadow-sm">
                        <ArrowRightLeft className="w-4 h-4" /> Chuyển phòng
                     </button>
                  </div>
               </div>
            ) : (
               <div className="text-center py-6 text-slate-500 italic bg-slate-50 rounded-lg mb-6 border border-dashed border-slate-200">
                  Chưa có bệnh nhân
               </div>
            )}

            <div className="grid grid-cols-1 gap-3">
               {bed.status === 'Occupied' ? (
                  <button onClick={() => onAction('discharge', bed.id)} className="w-full py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 flex items-center justify-center gap-2">
                     <LogOut className="w-4 h-4" /> Làm thủ tục xuất viện
                  </button>
               ) : bed.status === 'Maintenance' ? (
                  <button onClick={() => onAction('end_maintenance', bed.id)} className="w-full py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                     <CheckCircle2 className="w-4 h-4" /> Hoàn tất bảo trì
                  </button>
               ) : (
                  <>
                     <button onClick={() => onAction('assign', bed.id)} className="w-full py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2">
                        <UserPlus className="w-4 h-4" /> Xếp bệnh nhân mới
                     </button>
                     <button onClick={() => onAction('start_maintenance', bed.id)} className="w-full py-2 bg-orange-50 text-orange-600 font-medium rounded-lg hover:bg-orange-100 flex items-center justify-center gap-2">
                        <Wrench className="w-4 h-4" /> Báo hỏng / Bảo trì
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export const RoomMapPage = () => {
   const { user } = useAuthStore();
   const { residents, updateResident, selectResident } = useResidentsStore();
   const { maintenanceRequests } = useRoomsStore();
   const navigate = useNavigate();

   const [selectedBuilding, setSelectedBuilding] = useState('Tòa A');
   const [selectedFloor, setSelectedFloor] = useState('Tầng 1');
   const [selectedBed, setSelectedBed] = useState<{ bed: any, roomNumber: string, roomType: string, building: string, floor: string } | null>(null);
   const [transferResident, setTransferResident] = useState<Resident | null>(null);
   const [assignTarget, setAssignTarget] = useState<any | null>(null);

   // Live generation based on residents AND maintenance state
   const allRooms = useMemo(() => generateRooms(residents, maintenanceRequests), [residents, maintenanceRequests]);

   const displayedRooms = allRooms.filter(r => r.building === selectedBuilding && r.floor === selectedFloor);

   const availableFloors = getFloorsForBuilding(selectedBuilding);

   const stats = {
      total: displayedRooms.reduce((acc, r) => acc + r.beds.length, 0),
      occupied: displayedRooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'Occupied').length, 0),
      maintenance: displayedRooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'Maintenance').length, 0),
   };
   const available = stats.total - stats.occupied - stats.maintenance;

   if (!user) return null;

   const handleBedAction = async (action: string, bedId: string) => {
      const resident = residents.find(r => r.id === (selectedBed?.bed.residentId || ''));

      if (action === 'view_resident') {
         if (resident) {
            selectResident(resident);
            navigate(`/residents/${resident.id}`);
         }
      } else if (action === 'transfer') {
         if (resident) {
            setTransferResident(resident);
            setSelectedBed(null);
         }
      } else if (action === 'discharge') {
         if (resident) {
            if (window.confirm(`Bạn có chắc chắn muốn làm thủ tục xuất viện cho ${resident.name}?`)) {
               await updateResident({
                  ...resident,
                  status: 'Discharged',
                  room: 'N/A', bed: 'N/A', floor: 'N/A'
               });
               toast.success(`Hồ sơ của ${resident.name} đã cập nhật.`);
               setSelectedBed(null);
            }
         }
      } else if (action === 'assign') {
         if (selectedBed) {
            setAssignTarget({
               id: selectedBed.bed.id,
               roomNumber: selectedBed.roomNumber,
               bedLabel: selectedBed.bed.id.split('-')[2],
               building: selectedBed.building,
               floor: selectedBed.floor,
               type: selectedBed.roomType
            });
            setSelectedBed(null);
         }
      } else {
         toast('Hành động bảo trì cần được thực hiện qua module Bảo trì.', { icon: 'ℹ️' });
         setSelectedBed(null);
      }
   };

   const handleAssign = async (residentId: string) => {
      const resident = residents.find(r => r.id === residentId);
      if (resident && assignTarget) {
         await updateResident({
            ...resident,
            building: assignTarget.building,
            floor: assignTarget.floor,
            room: assignTarget.roomNumber,
            bed: assignTarget.bedLabel,
            roomType: assignTarget.type
         });
         toast.success(`Đã xếp ${resident.name} vào P.${assignTarget.roomNumber}`);
         setAssignTarget(null);
      }
   };

   const handleTransfer = async (data: any) => {
      if (transferResident) {
         await updateResident({
            ...transferResident,
            ...data
         });
         setTransferResident(null);
         toast.success("Chuyển phòng thành công");
      }
   }

   return (
      <div className="space-y-6">
         {selectedBed && (
            <BedDetailModal
               bed={selectedBed.bed}
               roomNumber={selectedBed.roomNumber}
               roomType={selectedBed.roomType}
               floor={selectedFloor}
               building={selectedBed.building}
               user={user}
               onClose={() => setSelectedBed(null)}
               onAction={handleBedAction}
               resident={residents.find(r => r.id === selectedBed.bed.residentId)}
            />
         )}

         {transferResident && (
            <TransferRoomModal
               resident={transferResident}
               allResidents={residents}
               onClose={() => setTransferResident(null)}
               onSave={handleTransfer}
            />
         )}

         {assignTarget && (
            <AssignBedModal
               residents={residents}
               targetBed={assignTarget}
               onClose={() => setAssignTarget(null)}
               onAssign={handleAssign}
            />
         )}

         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Sơ đồ phòng ở</h2>
               <p className="text-sm text-slate-500">Quản lý trạng thái giường bệnh theo thời gian thực</p>
            </div>

            <div className="flex gap-4">
               <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                  {BUILDING_STRUCTURE.map(b => (
                     <button
                        key={b.id}
                        onClick={() => { setSelectedBuilding(b.id); setSelectedFloor(b.floors[0]); }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${selectedBuilding === b.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                           }`}
                     >
                        <Building className="w-4 h-4" /> {b.name}
                     </button>
                  ))}
               </div>

               <div className="flex bg-white rounded-lg p-1 border border-slate-200 overflow-x-auto max-w-md">
                  {availableFloors.map(floor => (
                     <button
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${selectedFloor === floor ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                           }`}
                     >
                        {floor}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
               <div><p className="text-xs text-slate-500 font-bold uppercase">Tổng giường</p><p className="text-2xl font-bold text-slate-800">{stats.total}</p></div>
               <div className="p-2 bg-slate-100 rounded-lg"><Bed className="w-5 h-5 text-slate-500" /></div>
            </div>
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex items-center justify-between">
               <div><p className="text-xs text-teal-600 font-bold uppercase">Đang ở</p><p className="text-2xl font-bold text-teal-800">{stats.occupied}</p></div>
               <div className="p-2 bg-white rounded-lg"><UserPlus className="w-5 h-5 text-teal-600" /></div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
               <div><p className="text-xs text-green-600 font-bold uppercase">Còn trống</p><p className="text-2xl font-bold text-green-800">{available}</p></div>
               <div className="p-2 bg-white rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
               <div><p className="text-xs text-orange-600 font-bold uppercase">Bảo trì</p><p className="text-2xl font-bold text-orange-800">{stats.maintenance}</p></div>
               <div className="p-2 bg-white rounded-lg"><Wrench className="w-5 h-5 text-orange-500" /></div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedRooms.map(room => (
               <div key={room.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                     <div>
                        <span className="font-bold text-slate-800 text-lg">Phòng {room.number}</span>
                        <span className="text-xs text-slate-500 ml-2">({room.type})</span>
                     </div>
                     {room.beds.some(b => b.status === 'Maintenance') && <ShieldAlert className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                     {room.beds.map(bed => {
                        const resident = residents.find(r => r.id === bed.residentId);
                        const bedLabel = bed.id.split('-')[2];
                        return (
                           <div
                              key={bed.id}
                              onClick={() => setSelectedBed({
                                 bed, roomNumber: room.number, roomType: room.type, building: selectedBuilding, floor: selectedFloor
                              })}
                              className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${bed.status === 'Occupied' ? 'border-teal-200 bg-teal-50/50' :
                                 bed.status === 'Maintenance' ? 'border-orange-200 bg-orange-50/50' :
                                    'border-slate-100 bg-slate-50 hover:border-slate-300'
                                 }`}
                           >
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-xs font-bold text-slate-400">Giường {bedLabel}</span>
                                 {bed.status === 'Occupied' ? <div className="w-2 h-2 rounded-full bg-teal-500"></div> :
                                    bed.status === 'Maintenance' ? <Wrench className="w-3 h-3 text-orange-500" /> :
                                       <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                              </div>
                              {bed.status === 'Occupied' && resident ? (
                                 <div><p className="font-bold text-sm text-slate-800 truncate">{resident.name}</p><p className="text-xs text-slate-500">Cấp độ {resident.careLevel}</p></div>
                              ) : bed.status === 'Maintenance' ? (
                                 <div className="flex flex-col items-center justify-center py-1 text-orange-600"><span className="text-xs font-bold">Bảo trì</span></div>
                              ) : (
                                 <div className="flex flex-col items-center justify-center py-1 text-slate-400"><span className="text-xs">Trống</span></div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};