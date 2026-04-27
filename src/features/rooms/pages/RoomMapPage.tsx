import React, { useEffect, useMemo, useState } from 'react';
import {
   Bed,
   Stethoscope,
   Wrench,
   X,
   UserPlus,
   LogOut,
   CheckCircle2,
   AlertTriangle,
   ArrowRightLeft,
   Building,
   Edit,
   Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ResidentListItem, Room, User } from '../../../types/index';
import { BUILDING_STRUCTURE } from '../../../constants/facility';
import { generateRooms } from '../../../data/index';
import { TransferRoomModal } from '../components/TransferRoomModal';
import { AssignBedModal } from '../components/AssignBedModal';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useRoomsStore } from '../../../stores/roomsStore';
import { useRoomConfigStore } from '../../../stores/roomConfigStore';
import { RoomEditModal } from '../components/RoomEditModal';
import { ReadOnlyBanner } from '@/src/components/ui/ReadOnlyBanner';
import { useModuleAccess } from '@/src/hooks/useModuleAccess';

interface BedDetailModalProps {
   bed: any;
   roomNumber: string;
   roomType: string;
   floor: string;
   building: string;
   user: User;
   readOnly: boolean;
   onClose: () => void;
   onAction: (action: string, bedId: string) => void;
   resident?: ResidentListItem;
}

const BedDetailModal = ({
   bed,
   roomNumber,
   roomType,
   floor,
   building,
   user,
   onClose,
   onAction,
   resident,
   readOnly = false,
}: BedDetailModalProps) => {
   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
               <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  bed.status === 'Occupied'
                     ? 'bg-teal-100 text-teal-600'
                     : bed.status === 'Maintenance'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-slate-100 text-slate-500'
               }`}>
                  {bed.status === 'Occupied' ? (
                     <Stethoscope className="w-6 h-6" />
                  ) : bed.status === 'Maintenance' ? (
                     <Wrench className="w-6 h-6" />
                  ) : (
                     <Bed className="w-6 h-6" />
                  )}
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-800">Giường {bed.id.split('-')[2]} - P.{roomNumber}</h3>
                  <p className="text-sm text-slate-500">
                     {building} • {floor} • {bed.status === 'Occupied' ? 'Đang sử dụng' : bed.status === 'Maintenance' ? 'Đang bảo trì' : 'Giường trống'}
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
                     {!readOnly && (
                        <button onClick={() => onAction('transfer', resident.id)} className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 flex items-center justify-center gap-2 text-sm shadow-sm">
                           <ArrowRightLeft className="w-4 h-4" /> Chuyển phòng
                        </button>
                     )}
                  </div>
               </div>
            ) : (
               <div className="text-center py-6 text-slate-500 italic bg-slate-50 rounded-lg mb-6 border border-dashed border-slate-200">
                  Chưa có bệnh nhân
               </div>
            )}

            {!readOnly && (
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
            )}
         </div>
      </div>
   );
};

export const RoomMapPage = () => {
   const { user } = useAuthStore();
   const { residents, updateResident, selectResident } = useResidentsStore();
   const { maintenanceRequests } = useRoomsStore();
   const { configs, updateRoom, addRoom, deleteRoom } = useRoomConfigStore();
   const roomsAccess = useModuleAccess('rooms');
   const isReadOnly = roomsAccess.mode === 'readOnly';
   const navigate = useNavigate();

   const [selectedBuilding, setSelectedBuilding] = useState('Tòa A');
   const [selectedFloor, setSelectedFloor] = useState('Tầng 2');
   const [isEditMode, setIsEditMode] = useState(false);
   const [editingRoom, setEditingRoom] = useState<{ roomNumber: string; bedCount: number; roomType: any } | null>(null);
   const [selectedBed, setSelectedBed] = useState<{ bed: any; roomNumber: string; roomType: string; building: string; floor: string } | null>(null);
   const [transferResident, setTransferResident] = useState<ResidentListItem | null>(null);
   const [assignTarget, setAssignTarget] = useState<any | null>(null);

   useEffect(() => {
      if (isReadOnly) {
         setIsEditMode(false);
         setEditingRoom(null);
         setTransferResident(null);
         setAssignTarget(null);
      }
   }, [isReadOnly]);

   const allRooms = useMemo(() => {
      return generateRooms(residents, maintenanceRequests, configs);
   }, [residents, maintenanceRequests, configs]);

   const roomsOnFloor = useMemo(
      () => allRooms.filter(r => r.building === selectedBuilding && r.floor === selectedFloor),
      [allRooms, selectedBuilding, selectedFloor]
   );

   const availableFloors = BUILDING_STRUCTURE.find(b => b.id === selectedBuilding)?.floors || [];

   const stats = {
      total: roomsOnFloor.reduce((acc, r) => acc + r.beds.length, 0),
      occupied: roomsOnFloor.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'Occupied').length, 0),
      maintenance: roomsOnFloor.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'Maintenance').length, 0),
   };
   const available = stats.total - stats.occupied - stats.maintenance;

   if (!user) return null;

   const handleRoomClick = (room: Room) => {
      if (isReadOnly || !isEditMode) {
         return;
      }

      setEditingRoom({
         roomNumber: room.number,
         bedCount: room.beds.length,
         roomType: room.type
      });
   };

   const handleBedAction = async (action: string, bedId: string) => {
      const resident = residents.find(r => r.id === (selectedBed?.bed.residentId || ''));

      if (action === 'view_resident') {
         if (resident) {
            selectResident(resident);
            navigate(`/residents/${resident.id}`);
         }
         return;
      }

      if (isReadOnly) {
         setSelectedBed(null);
         return;
      }

      if (action === 'transfer') {
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
                  room: 'N/A',
                  bed: 'N/A',
                  floor: 'N/A'
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
      if (isReadOnly) {
         return;
      }

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
      if (isReadOnly) {
         return;
      }

      if (transferResident) {
         await updateResident({
            ...transferResident,
            ...data
         });
         setTransferResident(null);
         toast.success('Chuyển phòng thành công');
      }
   };

   const handleSaveRoom = (data: { roomNumber: string; bedCount: number; roomType: any }) => {
      if (isReadOnly) {
         return;
      }

      if (editingRoom && editingRoom.roomNumber !== '') {
         if (data.roomNumber !== editingRoom.roomNumber) {
            deleteRoom(selectedBuilding, selectedFloor, editingRoom.roomNumber);
            addRoom(selectedBuilding, selectedFloor, { number: data.roomNumber, beds: data.bedCount, type: data.roomType });
         } else {
            updateRoom(selectedBuilding, selectedFloor, { number: data.roomNumber, beds: data.bedCount, type: data.roomType });
         }
         setEditingRoom(null);
      } else {
         addRoom(selectedBuilding, selectedFloor, { number: data.roomNumber, beds: data.bedCount, type: data.roomType });
         setEditingRoom(null);
      }
   };

   const handleDeleteRoom = () => {
      if (isReadOnly) {
         return;
      }

      if (editingRoom && editingRoom.roomNumber !== '') {
         deleteRoom(selectedBuilding, selectedFloor, editingRoom.roomNumber);
         setEditingRoom(null);
      }
   };

   const isAdmin = user?.role === 'ADMIN';
   const isSupervisor = user?.role === 'SUPERVISOR' || isAdmin;

   return (
      <div className="space-y-6">
         {isReadOnly && <ReadOnlyBanner message="Bạn có thể xem sơ đồ phòng nhưng không thể chỉnh sửa phòng hoặc điều phối giường." />}

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
               readOnly={isReadOnly}
            />
         )}

         {transferResident && !isReadOnly && (
            <TransferRoomModal
               resident={transferResident}
               allResidents={residents}
               onClose={() => setTransferResident(null)}
               onSave={handleTransfer}
            />
         )}

         {assignTarget && !isReadOnly && (
            <AssignBedModal
               residents={residents}
               targetBed={assignTarget}
               onClose={() => setAssignTarget(null)}
               onAssign={handleAssign}
            />
         )}

         {editingRoom && !isReadOnly && (
            <RoomEditModal
               roomNumber={editingRoom.roomNumber}
               bedCount={editingRoom.bedCount}
               roomType={editingRoom.roomType}
               onClose={() => setEditingRoom(null)}
               onSave={handleSaveRoom}
               onDelete={editingRoom.roomNumber !== '' ? handleDeleteRoom : undefined}
            />
         )}

         <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
               <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">Sơ đồ phòng ở</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                     <p className="text-sm text-slate-500">Quản lý trạng thái giường bệnh</p>
                     {isAdmin && !isReadOnly && (
                        <div className="flex items-center gap-2">
                           <span className="text-sm text-slate-400 hidden sm:inline">|</span>
                           <label className="flex items-center gap-2 cursor-pointer">
                              <div
                                 className={`w-10 h-6 rounded-full p-1 transition-colors ${isEditMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                 onClick={() => setIsEditMode(!isEditMode)}
                              >
                                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isEditMode ? 'translate-x-4' : ''}`} />
                              </div>
                              <span className={`text-sm font-medium ${isEditMode ? 'text-indigo-600' : 'text-slate-500'}`}>Chỉnh sửa</span>
                           </label>
                           {isEditMode && (
                              <button
                                 onClick={() => setEditingRoom({ roomNumber: '', bedCount: 1, roomType: '1 Giường' })}
                                 className="p-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200"
                                 title="Thêm phòng"
                              >
                                 <Plus className="w-5 h-5" />
                              </button>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               {isSupervisor && (
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                     <button
                        onClick={() => navigate('/incidents')}
                        className="px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm flex items-center gap-2 font-medium transition-all text-sm whitespace-nowrap shrink-0"
                     >
                        <AlertTriangle className="w-4 h-4" />
                        Sự Cố
                     </button>
                  </div>
               )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
               <div className="flex bg-slate-100 rounded-lg p-1 overflow-x-auto hide-scrollbar shrink-0">
                  {BUILDING_STRUCTURE.map(b => (
                     <button
                        key={b.id}
                        onClick={() => {
                           setSelectedBuilding(b.id);
                           setSelectedFloor(b.floors[0]);
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
                           selectedBuilding === b.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                     >
                        <Building className="w-4 h-4" /> {b.name}
                     </button>
                  ))}
               </div>

               <div className="flex bg-slate-100 rounded-lg p-1 overflow-x-auto hide-scrollbar flex-1">
                  {availableFloors.map(floor => (
                     <button
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                           selectedFloor === floor ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                     >
                        {floor}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
            <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 flex items-center justify-between min-w-[140px] shrink-0 md:min-w-0 md:shrink">
               <div><p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase">Tổng giường</p><p className="text-xl md:text-2xl font-bold text-slate-800">{stats.total}</p></div>
               <div className="p-2 bg-slate-100 rounded-lg"><Bed className="w-4 h-4 md:w-5 md:h-5 text-slate-500" /></div>
            </div>
            <div className="bg-teal-50 p-3 md:p-4 rounded-xl border border-teal-100 flex items-center justify-between min-w-[140px] shrink-0 md:min-w-0 md:shrink">
               <div><p className="text-[10px] md:text-xs text-teal-600 font-bold uppercase">Đang ở</p><p className="text-xl md:text-2xl font-bold text-teal-800">{stats.occupied}</p></div>
               <div className="p-2 bg-white rounded-lg"><UserPlus className="w-4 h-4 md:w-5 md:h-5 text-teal-600" /></div>
            </div>
            <div className="bg-green-50 p-3 md:p-4 rounded-xl border border-green-100 flex items-center justify-between min-w-[140px] shrink-0 md:min-w-0 md:shrink">
               <div><p className="text-[10px] md:text-xs text-green-600 font-bold uppercase">Còn trống</p><p className="text-xl md:text-2xl font-bold text-green-800">{available}</p></div>
               <div className="p-2 bg-white rounded-lg"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600" /></div>
            </div>
            <div className="bg-orange-50 p-3 md:p-4 rounded-xl border border-orange-100 flex items-center justify-between min-w-[140px] shrink-0 md:min-w-0 md:shrink">
               <div><p className="text-[10px] md:text-xs text-orange-600 font-bold uppercase">Bảo trì</p><p className="text-xl md:text-2xl font-bold text-orange-800">{stats.maintenance}</p></div>
               <div className="p-2 bg-white rounded-lg"><Wrench className="w-4 h-4 md:w-5 md:h-5 text-orange-500" /></div>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {roomsOnFloor.map(room => (
               <div key={room.id} className={`bg-white rounded-xl shadow-sm border ${isEditMode ? 'border-indigo-300 ring-2 ring-indigo-100 cursor-pointer hover:border-indigo-500' : 'border-slate-200'} overflow-hidden relative transition-all`}>
                  {isEditMode && !isReadOnly && (
                     <div
                        className="absolute inset-0 z-10 bg-indigo-50/10 hover:bg-indigo-50/30 flex items-center justify-center group"
                        onClick={() => handleRoomClick(room)}
                     >
                        <Edit className="w-8 h-8 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                  )}

                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <span className="font-bold text-slate-700">{room.number}</span>
                     <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">{room.type}</span>
                  </div>

                  <div className="p-3 grid grid-cols-2 gap-2">
                     {room.beds.map(bed => (
                        <div
                           key={bed.id}
                           onClick={() => !isEditMode && setSelectedBed({ bed, roomNumber: room.number, roomType: room.type, building: room.building, floor: room.floor })}
                           className={`p-2 rounded-lg border text-center transition-all cursor-pointer relative ${
                              bed.status === 'Occupied'
                                 ? 'bg-teal-50 border-teal-200 hover:bg-teal-100'
                                 : bed.status === 'Maintenance'
                                    ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                           }`}
                        >
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-400 font-medium">{bed.id.split('-')[2]}</span>
                              {bed.status === 'Occupied' && <Stethoscope className="w-3 h-3 text-teal-500" />}
                              {bed.status === 'Maintenance' && <Wrench className="w-3 h-3 text-orange-500" />}
                           </div>
                           {bed.status === 'Occupied' ? (
                              <div className="truncate text-xs font-bold text-slate-800">
                                 {residents.find(r => r.id === bed.residentId)?.name || 'N/A'}
                              </div>
                           ) : (
                              <div className="text-xs text-slate-400 italic">Trống</div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};
