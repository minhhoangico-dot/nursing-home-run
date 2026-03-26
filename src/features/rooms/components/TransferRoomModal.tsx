import React, { useMemo, useState } from 'react';
import { ArrowRight, BedDouble, Building, CheckCircle2 } from 'lucide-react';
import { Resident } from '../../../types/index';
import { generateRooms } from '../../../data/index';
import { Button, Modal } from '../../../components/ui/index';
import { useToast } from '../../../app/providers';

interface TransferRoomModalProps {
   resident: Resident;
   allResidents: Resident[];
   readOnly?: boolean;
   onClose: () => void;
   onSave: (data: { room: string; bed: string; floor: string; building: string; roomType: any }) => void;
}

export const TransferRoomModal = ({ resident, allResidents, readOnly = false, onClose, onSave }: TransferRoomModalProps) => {
   const [selectedBuilding, setSelectedBuilding] = useState(resident.building || 'TÃ²a A');
   const [selectedFloor, setSelectedFloor] = useState(resident.floor);
   const [selectedRoomId, setSelectedRoomId] = useState('');
   const [selectedBedId, setSelectedBedId] = useState('');
   const { addToast } = useToast();

   const rooms = useMemo(() => generateRooms(allResidents), [allResidents]);
   const availableRooms = rooms.filter(r => r.building === selectedBuilding && r.floor === selectedFloor);
   const selectedRoom = availableRooms.find(r => r.id === selectedRoomId);
   const availableBeds = selectedRoom
      ? selectedRoom.beds.filter(b => b.status === 'Available')
      : [];

   const floors = selectedBuilding === 'TÃ²a A'
      ? ['Táº§ng 1', 'Táº§ng 2', 'Táº§ng 3', 'Táº§ng 4']
      : ['Táº§ng 1', 'Táº§ng 2', 'Táº§ng 3', 'Táº§ng 4', 'Táº§ng 5'];

   const handleTransfer = () => {
      if (readOnly) {
         onClose();
         return;
      }

      if (!selectedRoom || !selectedBedId) return;

      const bedLabel = selectedBedId.split('-')[2];

      onSave({
         room: selectedRoom.number,
         bed: bedLabel,
         floor: selectedRoom.floor,
         building: selectedRoom.building,
         roomType: selectedRoom.type
      });
      addToast('success', 'Chuyá»ƒn phÃ²ng thÃ nh cÃ´ng', `ÄÃ£ chuyá»ƒn NCT sang ${selectedRoom.building} - P.${selectedRoom.number} - GiÆ°á»ng ${bedLabel}`);
      onClose();
   };

   return (
      <Modal title="Chuyá»ƒn phÃ²ng / GiÆ°á»ng" onClose={onClose} maxWidth="max-w-lg">
         <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
               <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Hiá»‡n táº¡i</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                     <BedDouble className="w-4 h-4 text-slate-500" />
                     P.{resident.room} - GiÆ°á»ng {resident.bed}
                  </p>
                  <p className="text-sm text-slate-500">{resident.building} - {resident.floor}</p>
               </div>
               <ArrowRight className="w-5 h-5 text-slate-400" />
               <div className="text-right">
                  <p className="text-xs text-teal-600 uppercase font-bold mb-1">Chuyá»ƒn Ä‘áº¿n</p>
                  <p className="font-bold text-teal-800">
                     {selectedRoom ? `P.${selectedRoom.number}` : '...'} - {selectedBedId ? `GiÆ°á»ng ${selectedBedId.split('-')[2]}` : '...'}
                  </p>
                  <p className="text-sm text-teal-600">{selectedBuilding} - {selectedFloor}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chá»n TÃ²a nhÃ </label>
                  <div className="flex gap-2">
                     {['TÃ²a A', 'TÃ²a B'].map(b => (
                        <button
                           key={b}
                           onClick={() => {
                              setSelectedBuilding(b);
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chá»n Táº§ng</label>
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
                           {f.replace('Táº§ng ', 'T')}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chá»n PhÃ²ng</label>
                  <select
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                     value={selectedRoomId}
                     onChange={e => { setSelectedRoomId(e.target.value); setSelectedBedId(''); }}
                  >
                     <option value="">-- Chá»n phÃ²ng --</option>
                     {availableRooms.map(r => {
                        const freeBeds = r.beds.filter(b => b.status === 'Available').length;
                        return (
                           <option key={r.id} value={r.id} disabled={freeBeds === 0}>
                              PhÃ²ng {r.number} ({r.type}) - Trá»‘ng {freeBeds} giÆ°á»ng
                           </option>
                        );
                     })}
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chá»n GiÆ°á»ng</label>
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
                           <span className="font-bold">GiÆ°á»ng {bed.id.split('-')[2]}</span>
                           {selectedBedId === bed.id && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                        </div>
                     )) : (
                        <div className="col-span-2 text-center py-4 text-slate-400 italic text-sm bg-slate-50 rounded-lg">
                           {selectedRoomId ? 'KhÃ´ng cÃ²n giÆ°á»ng trá»‘ng' : 'Vui lÃ²ng chá»n phÃ²ng trÆ°á»›c'}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
               <Button variant="secondary" onClick={onClose}>Há»§y bá»</Button>
               {!readOnly && (
                  <Button onClick={handleTransfer} disabled={!selectedRoomId || !selectedBedId}>
                     XÃ¡c nháº­n chuyá»ƒn
                  </Button>
               )}
            </div>
         </div>
      </Modal>
   );
};
