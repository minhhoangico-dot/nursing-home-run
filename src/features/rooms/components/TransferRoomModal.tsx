import React, { useState, useMemo } from 'react';
import { X, ArrowRight, CheckCircle2, BedDouble, Building } from 'lucide-react';
import { Resident, Room } from '../../../types/index';
import { generateRooms } from '../../../data/index';
import { Modal, Button, Select } from '../../../components/ui/index';
import { useToast } from '../../../app/providers';

interface TransferRoomModalProps {
   resident: Resident;
   allResidents: Resident[];
   onClose: () => void;
   onSave: (data: { room: string; bed: string; floor: string; building: string; roomType: any }) => void;
}

export const TransferRoomModal = ({ resident, allResidents, onClose, onSave }: TransferRoomModalProps) => {
   const [selectedBuilding, setSelectedBuilding] = useState(resident.building || 'Tòa A');
   const [selectedFloor, setSelectedFloor] = useState(resident.floor);
   const [selectedRoomId, setSelectedRoomId] = useState('');
   const [selectedBedId, setSelectedBedId] = useState('');
   const { addToast } = useToast();

   // Generate current room state based on all residents
   const rooms = useMemo(() => generateRooms(allResidents), [allResidents]);

   // Filter rooms by selected building AND floor
   const availableRooms = rooms.filter(r => r.building === selectedBuilding && r.floor === selectedFloor);

   // Get beds for selected room
   const selectedRoom = availableRooms.find(r => r.id === selectedRoomId);
   
   // Filter available beds (Status is 'Available')
   const availableBeds = selectedRoom 
      ? selectedRoom.beds.filter(b => b.status === 'Available') 
      : [];

   // Determine floors based on building
   const floors = selectedBuilding === 'Tòa A' 
      ? ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4']
      : ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'];

   const handleTransfer = () => {
      if (!selectedRoom || !selectedBedId) return;
      
      const bedLabel = selectedBedId.split('-')[2]; // e.g. "Tòa A-101-A" -> "A"
      
      onSave({
         room: selectedRoom.number,
         bed: bedLabel,
         floor: selectedRoom.floor,
         building: selectedRoom.building,
         roomType: selectedRoom.type
      });
      addToast('success', 'Chuyển phòng thành công', `Đã chuyển NCT sang ${selectedRoom.building} - P.${selectedRoom.number} - Giường ${bedLabel}`);
      onClose();
   };

   return (
      <Modal title="Chuyển phòng / Giường" onClose={onClose} maxWidth="max-w-lg">
         <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
               <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Hiện tại</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                     <BedDouble className="w-4 h-4 text-slate-500" />
                     P.{resident.room} - Giường {resident.bed}
                  </p>
                  <p className="text-sm text-slate-500">{resident.building} - {resident.floor}</p>
               </div>
               <ArrowRight className="w-5 h-5 text-slate-400" />
               <div className="text-right">
                  <p className="text-xs text-teal-600 uppercase font-bold mb-1">Chuyển đến</p>
                  <p className="font-bold text-teal-800">
                     {selectedRoom ? `P.${selectedRoom.number}` : '...'} - {selectedBedId ? `Giường ${selectedBedId.split('-')[2]}` : '...'}
                  </p>
                  <p className="text-sm text-teal-600">{selectedBuilding} - {selectedFloor}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Tòa nhà</label>
                  <div className="flex gap-2">
                     {['Tòa A', 'Tòa B'].map(b => (
                        <button
                           key={b}
                           onClick={() => { 
                              setSelectedBuilding(b); 
                              // Reset floor if switching to a building with fewer floors (though currently B has more)
                              // Reset room and bed
                              setSelectedRoomId(''); 
                              setSelectedBedId(''); 
                           }}
                           className={`flex-1 py-2 text-sm rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                              selectedBuilding === b 
                              ? 'bg-slate-800 text-white border-slate-800' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                           }`}
                        >
                           <Building className="w-4 h-4" /> {b}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Tầng</label>
                  <div className="grid grid-cols-5 gap-2">
                     {floors.map(f => (
                        <button
                           key={f}
                           onClick={() => { setSelectedFloor(f); setSelectedRoomId(''); setSelectedBedId(''); }}
                           className={`py-2 text-sm rounded-lg border transition-colors ${
                              selectedFloor === f 
                              ? 'bg-teal-600 text-white border-teal-600' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                           }`}
                        >
                           {f.replace('Tầng ', 'T')}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Phòng</label>
                  <select 
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                     value={selectedRoomId}
                     onChange={e => { setSelectedRoomId(e.target.value); setSelectedBedId(''); }}
                  >
                     <option value="">-- Chọn phòng --</option>
                     {availableRooms.map(r => {
                        const freeBeds = r.beds.filter(b => b.status === 'Available').length;
                        return (
                           <option key={r.id} value={r.id} disabled={freeBeds === 0}>
                              Phòng {r.number} ({r.type}) - Trống {freeBeds} giường
                           </option>
                        );
                     })}
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Giường</label>
                  <div className="grid grid-cols-2 gap-3">
                     {availableBeds.length > 0 ? availableBeds.map(bed => (
                        <div 
                           key={bed.id}
                           onClick={() => setSelectedBedId(bed.id)}
                           className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between ${
                              selectedBedId === bed.id 
                              ? 'bg-teal-50 border-teal-500 text-teal-700' 
                              : 'bg-white border-slate-200 hover:border-teal-300'
                           }`}
                        >
                           <span className="font-bold">Giường {bed.id.split('-')[2]}</span>
                           {selectedBedId === bed.id && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                        </div>
                     )) : (
                        <div className="col-span-2 text-center py-4 text-slate-400 italic text-sm bg-slate-50 rounded-lg">
                           {selectedRoomId ? 'Không còn giường trống' : 'Vui lòng chọn phòng trước'}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
               <Button variant="secondary" onClick={onClose}>Hủy bỏ</Button>
               <Button onClick={handleTransfer} disabled={!selectedRoomId || !selectedBedId}>
                  Xác nhận chuyển
               </Button>
            </div>
         </div>
      </Modal>
   );
};