import React, { useState } from 'react';
import { Check, X, AlertCircle, Clock } from 'lucide-react';
import { Resident, Prescription, MedicationLog } from '../../../types/index';

interface MedicationCardProps {
  resident: Resident;
  prescriptions: Prescription[];
  logs: MedicationLog[];
  shift: string;
  date: string;
  onLog: (prescriptionId: string, status: 'Given' | 'Refused', note?: string) => void;
}

export const MedicationCard = ({ resident, prescriptions, logs, shift, date, onLog }: MedicationCardProps) => {
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const isCompleted = prescriptions.every(p => 
    logs.some(l => l.prescriptionId === p.id && l.status !== 'Pending')
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-slate-800">{resident.name}</h3>
          <p className="text-xs text-slate-500">Phòng {resident.room} • Giường {resident.bed}</p>
        </div>
        {isCompleted ? (
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Check className="w-3 h-3" /> Hoàn thành
          </div>
        ) : (
          <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Chờ phát
          </div>
        )}
      </div>
      
      <div className="divide-y divide-slate-100">
        {prescriptions.map(p => {
          const log = logs.find(l => l.prescriptionId === p.id);
          const status = log?.status || 'Pending';

          return (
            <div key={p.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-slate-800">{p.medicationName}</p>
                  <p className="text-sm text-slate-500">{p.dosage} • {p.frequency}</p>
                </div>
                {status === 'Pending' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onLog(p.id, 'Given')}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Xác nhận đã uống"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setNoteOpen(noteOpen === p.id ? null : p.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Báo cáo bất thường/Từ chối"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    status === 'Given' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {status === 'Given' ? 'Đã uống' : 'Không uống'}
                  </span>
                )}
              </div>

              {noteOpen === p.id && status === 'Pending' && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    placeholder="Lý do từ chối / Ghi chú..."
                    className="w-full text-sm border rounded p-2 mb-2"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setNoteOpen(null)} className="text-xs text-slate-500 hover:underline">Hủy</button>
                    <button 
                      onClick={() => {
                        onLog(p.id, 'Refused', noteText);
                        setNoteOpen(null);
                        setNoteText('');
                      }}
                      className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              )}
              
              {log?.note && (
                 <div className="mt-2 text-xs bg-red-50 text-red-600 p-2 rounded flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>Ghi chú: {log.note}</span>
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};