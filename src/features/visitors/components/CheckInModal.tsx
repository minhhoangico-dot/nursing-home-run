import React, { useState } from 'react';
import { UserPlus, Clock } from 'lucide-react';
import { VisitorLog, Resident } from '../../../types/index';
import { Modal, Input, Button } from '../../../components/ui/index';

interface CheckInModalProps {
   residents: Resident[];
   onClose: () => void;
   onSave: (log: VisitorLog) => void;
}

export const CheckInModal = ({ residents, onClose, onSave }: CheckInModalProps) => {
   const [formData, setFormData] = useState<Partial<VisitorLog>>({
      visitorName: '',
      idCard: '',
      phone: '',
      residentId: '',
      relationship: '',
      note: '',
      itemBrought: ''
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.visitorName || !formData.residentId) return;

      const resident = residents.find(r => r.id === formData.residentId);
      
      const newLog: VisitorLog = {
         id: `VIS-${Date.now()}`,
         visitorName: formData.visitorName!,
         idCard: formData.idCard || '',
         phone: formData.phone || '',
         residentId: formData.residentId!,
         residentName: resident ? resident.name : 'Unknown',
         relationship: formData.relationship || 'Người thân',
         checkInTime: new Date().toISOString(), // Local time handling in display
         status: 'Active',
         note: formData.note,
         itemBrought: formData.itemBrought
      };

      onSave(newLog);
   };

   return (
      <Modal title="Đăng ký khách thăm" onClose={onClose}>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-teal-50 p-3 rounded-lg flex items-center gap-3 border border-teal-100 text-sm text-teal-800">
               <Clock className="w-5 h-5 text-teal-600" />
               Giờ vào: {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Input 
                  label="Họ tên khách" 
                  value={formData.visitorName} 
                  onChange={e => setFormData({...formData, visitorName: e.target.value})}
                  placeholder="Nhập tên khách..."
                  required
               />
               <Input 
                  label="Số CMND/CCCD" 
                  value={formData.idCard} 
                  onChange={e => setFormData({...formData, idCard: e.target.value})}
                  placeholder="Nhập số giấy tờ..."
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Input 
                  label="Số điện thoại" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="09..."
               />
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thăm người thân</label>
                  <select 
                     className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-teal-500"
                     value={formData.residentId}
                     onChange={e => setFormData({...formData, residentId: e.target.value})}
                     required
                  >
                     <option value="">-- Chọn NCT --</option>
                     {residents.filter(r => r.status === 'Active').map(r => (
                        <option key={r.id} value={r.id}>{r.name} - P.{r.room}</option>
                     ))}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Input 
                  label="Mối quan hệ" 
                  value={formData.relationship} 
                  onChange={e => setFormData({...formData, relationship: e.target.value})}
                  placeholder="VD: Con, Cháu..."
               />
               <Input 
                  label="Vật dụng mang vào" 
                  value={formData.itemBrought} 
                  onChange={e => setFormData({...formData, itemBrought: e.target.value})}
                  placeholder="VD: Sữa, Quần áo..."
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú thêm</label>
               <textarea 
                  className="w-full border rounded-lg px-3 py-2 text-sm h-20 focus:ring-teal-500"
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  placeholder="Ghi chú khác nếu có..."
               ></textarea>
            </div>

            <div className="flex justify-end pt-4 gap-2 border-t border-slate-100">
               <Button variant="secondary" onClick={onClose} type="button">Hủy</Button>
               <Button type="submit" icon={<UserPlus className="w-4 h-4" />}>Xác nhận vào</Button>
            </div>
         </form>
      </Modal>
   );
};