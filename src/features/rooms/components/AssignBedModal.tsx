import React, { useState } from 'react';
import { AlertCircle, Calendar, User } from 'lucide-react';
import { Resident } from '../../../types/index';
import { Button, Modal } from '../../../components/ui/index';

interface AssignBedModalProps {
   residents: Resident[];
   targetBed: { id: string, roomNumber: string, bedLabel: string, building: string, floor: string, type: string };
   readOnly?: boolean;
   onClose: () => void;
   onAssign: (residentId: string) => void;
}

export const AssignBedModal = ({ residents, targetBed, readOnly = false, onClose, onAssign }: AssignBedModalProps) => {
   const [selectedId, setSelectedId] = useState<string>('');

   const waitingResidents = residents.filter(r =>
      r.status === 'Active' && (r.room === 'ChÆ°a xáº¿p' || !r.room || r.room === 'N/A')
   );

   const handleSubmit = () => {
      if (readOnly) {
         onClose();
         return;
      }

      if (selectedId) {
         onAssign(selectedId);
      }
   };

   return (
      <Modal title="Tiáº¿p nháº­n vÃ o phÃ²ng" onClose={onClose} maxWidth="max-w-xl">
         <div className="space-y-6">
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
               <h4 className="text-teal-800 font-bold mb-2">Vá»‹ trÃ­ tiáº¿p nháº­n</h4>
               <div className="flex gap-4 text-sm text-teal-700">
                  <span>TÃ²a nhÃ : <b>{targetBed.building}</b></span>
                  <span>PhÃ²ng: <b>{targetBed.roomNumber}</b></span>
                  <span>GiÆ°á»ng: <b>{targetBed.bedLabel}</b></span>
               </div>
               <div className="mt-1 text-xs text-teal-600">
                  Loáº¡i phÃ²ng: {targetBed.type} â€¢ {targetBed.floor}
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-3">Chá»n NCT chá» xáº¿p phÃ²ng ({waitingResidents.length})</label>

               {waitingResidents.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                     {waitingResidents.map(r => (
                        <div
                           key={r.id}
                           onClick={() => setSelectedId(r.id)}
                           className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                              selectedId === r.id
                                 ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                 : 'bg-white border-slate-200 hover:border-blue-300'
                           }`}
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                 <User className="w-4 h-4" />
                              </div>
                              <div>
                                 <p className="font-bold text-slate-800 text-sm">{r.name}</p>
                                 <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> NgÃ y vÃ o: {r.admissionDate}
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">
                                 Cáº¥p Ä‘á»™ {r.careLevel}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
                     <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                     <p>KhÃ´ng cÃ³ NCT nÃ o Ä‘ang chá» xáº¿p phÃ²ng.</p>
                     <p className="text-xs mt-1">Vui lÃ²ng táº¡o há»“ sÆ¡ NCT má»›i trÆ°á»›c.</p>
                  </div>
               )}
            </div>

            <div className="flex justify-end pt-4 gap-2 border-t border-slate-100">
               <Button variant="secondary" onClick={onClose}>Há»§y bá»</Button>
               {!readOnly && (
                  <Button onClick={handleSubmit} disabled={!selectedId}>
                     XÃ¡c nháº­n xáº¿p phÃ²ng
                  </Button>
               )}
            </div>
         </div>
      </Modal>
   );
};
