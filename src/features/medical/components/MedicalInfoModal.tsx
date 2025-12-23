import React, { useState } from 'react';
import { X, Save, Activity, Trash2, AlertTriangle } from 'lucide-react';
import { Resident, MedicalCondition, Allergy, User } from '../../../types/index';

export const MedicalInfoModal = ({ user, resident, onClose, onSave }: { user: User, resident: Resident, onClose: () => void, onSave: (r: Partial<Resident>) => void }) => {
  const [note, setNote] = useState(resident.currentConditionNote || '');
  const [history, setHistory] = useState<MedicalCondition[]>(resident.medicalHistory || []);
  const [allergies, setAllergies] = useState<Allergy[]>(resident.allergies || []);
  
  // New Item States
  const [newCondition, setNewCondition] = useState({ name: '', date: '', status: 'Active' });
  const [newAllergy, setNewAllergy] = useState({ allergen: '', severity: 'Nhẹ', reaction: '' });

  const addCondition = () => {
    if(!newCondition.name) return;
    setHistory([...history, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: newCondition.name, 
      diagnosedDate: newCondition.date || new Date().getFullYear().toString(), 
      status: newCondition.status as any 
    }]);
    setNewCondition({ name: '', date: '', status: 'Active' });
  };

  const addAllergy = () => {
    if(!newAllergy.allergen) return;
    setAllergies([...allergies, {
      id: Math.random().toString(36).substr(2, 9),
      allergen: newAllergy.allergen,
      severity: newAllergy.severity as any,
      reaction: newAllergy.reaction
    }]);
    setNewAllergy({ allergen: '', severity: 'Nhẹ', reaction: '' });
  };

  const handleSave = () => {
    onSave({
      currentConditionNote: note,
      medicalHistory: history,
      allergies: allergies,
      lastMedicalUpdate: new Date().toLocaleDateString('vi-VN'),
      lastUpdatedBy: user.name
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Cập nhật thông tin y tế</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           {/* Current Note */}
           <div>
             <label className="block text-sm font-bold text-slate-800 mb-2">Tình trạng hiện tại</label>
             <textarea 
               className="w-full border border-slate-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-teal-500 focus:outline-none"
               placeholder="Ghi chú về tình trạng sức khỏe hiện tại..."
               value={note}
               onChange={e => setNote(e.target.value)}
             ></textarea>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Medical History Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" /> Tiền sử bệnh</h3>
                
                <div className="space-y-3 mb-4">
                  {history.map(h => (
                    <div key={h.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 shadow-sm">
                      <div>
                        <p className="font-medium text-sm">{h.name}</p>
                        <p className="text-xs text-slate-500">{h.diagnosedDate} • {h.status === 'Active' ? 'Đang điều trị' : 'Đã khỏi'}</p>
                      </div>
                      <button onClick={() => setHistory(history.filter(i => i.id !== h.id))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <input 
                    type="text" 
                    placeholder="Tên bệnh lý" 
                    className="w-full border rounded p-2 text-sm"
                    value={newCondition.name}
                    onChange={e => setNewCondition({...newCondition, name: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Năm phát hiện" 
                      className="w-1/2 border rounded p-2 text-sm"
                      value={newCondition.date}
                      onChange={e => setNewCondition({...newCondition, date: e.target.value})}
                    />
                    <select 
                      className="w-1/2 border rounded p-2 text-sm"
                      value={newCondition.status}
                      onChange={e => setNewCondition({...newCondition, status: e.target.value})}
                    >
                      <option value="Active">Đang điều trị</option>
                      <option value="Resolved">Đã khỏi</option>
                    </select>
                  </div>
                  <button onClick={addCondition} className="w-full py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200">+ Thêm bệnh lý</button>
                </div>
              </div>

              {/* Allergies Section */}
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Dị ứng</h3>
                
                <div className="space-y-3 mb-4">
                  {allergies.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-white p-2 rounded border border-red-100 shadow-sm">
                      <div>
                        <p className="font-medium text-sm text-red-700">{a.allergen}</p>
                        <p className="text-xs text-slate-500">{a.severity} • {a.reaction}</p>
                      </div>
                      <button onClick={() => setAllergies(allergies.filter(i => i.id !== a.id))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-red-200">
                  <input 
                    type="text" 
                    placeholder="Tên dị nguyên (Thuốc/Thức ăn)" 
                    className="w-full border rounded p-2 text-sm"
                    value={newAllergy.allergen}
                    onChange={e => setNewAllergy({...newAllergy, allergen: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <select 
                      className="w-1/3 border rounded p-2 text-sm"
                      value={newAllergy.severity}
                      onChange={e => setNewAllergy({...newAllergy, severity: e.target.value})}
                    >
                      <option value="Nhẹ">Nhẹ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nặng">Nặng</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Phản ứng (VD: Nổi mẩn)" 
                      className="w-2/3 border rounded p-2 text-sm"
                      value={newAllergy.reaction}
                      onChange={e => setNewAllergy({...newAllergy, reaction: e.target.value})}
                    />
                  </div>
                  <button onClick={addAllergy} className="w-full py-2 bg-red-200 text-red-800 rounded text-sm font-medium hover:bg-red-300">+ Thêm dị ứng</button>
                </div>
              </div>
           </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Hủy</button>
          <button onClick={handleSave} className="px-6 py-2 bg-teal-600 text-white font-medium hover:bg-teal-700 rounded-lg flex items-center gap-2">
            <Save className="w-4 h-4" /> Lưu thông tin
          </button>
        </div>
      </div>
    </div>
  );
};