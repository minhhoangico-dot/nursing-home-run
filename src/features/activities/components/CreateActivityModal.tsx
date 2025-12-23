import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Save } from 'lucide-react';
import { ActivityEvent, ActivityType, User as UserType } from '../../../types/index';
import { Modal, Input, Select, Button } from '../../../components/ui/index';

interface CreateActivityModalProps {
   user: UserType;
   onClose: () => void;
   onSave: (activity: ActivityEvent) => void;
}

export const CreateActivityModal = ({ user, onClose, onSave }: CreateActivityModalProps) => {
   const [formData, setFormData] = useState<Partial<ActivityEvent>>({
      title: '',
      type: 'Social',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      location: '',
      host: user.name,
      description: '',
      status: 'Scheduled'
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
         id: `ACT-${Date.now()}`,
         ...formData as ActivityEvent
      });
   };

   return (
      <Modal title="Lên lịch hoạt động mới" onClose={onClose}>
         <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
               label="Tên hoạt động" 
               value={formData.title} 
               onChange={e => setFormData({...formData, title: e.target.value})}
               placeholder="VD: Tập dưỡng sinh..."
               required
            />

            <div className="grid grid-cols-2 gap-4">
               <Select
                  label="Loại hình"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as ActivityType})}
                  options={[
                     { value: 'Exercise', label: 'Vận động / Thể dục' },
                     { value: 'Social', label: 'Giao lưu / Xã hội' },
                     { value: 'Entertainment', label: 'Giải trí / Văn nghệ' },
                     { value: 'Spiritual', label: 'Tâm linh / Tôn giáo' },
                     { value: 'Education', label: 'Giáo dục / Kỹ năng' },
                     { value: 'Other', label: 'Khác' },
                  ]}
               />
               <Input 
                  label="Ngày tổ chức" 
                  type="date"
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Input 
                  label="Bắt đầu" 
                  type="time"
                  value={formData.startTime} 
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  required
               />
               <Input 
                  label="Kết thúc" 
                  type="time"
                  value={formData.endTime} 
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  required
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Input 
                  label="Địa điểm" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="VD: Sân vườn..."
                  icon={<MapPin className="w-4 h-4" />}
               />
               <Input 
                  label="Người phụ trách" 
                  value={formData.host} 
                  onChange={e => setFormData({...formData, host: e.target.value})}
                  icon={<User className="w-4 h-4" />}
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
               <textarea 
                  className="w-full border rounded-lg px-3 py-2 text-sm h-20 focus:ring-teal-500"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Nội dung hoạt động, dụng cụ cần chuẩn bị..."
               ></textarea>
            </div>

            <div className="flex justify-end pt-4 gap-2 border-t border-slate-100">
               <Button variant="secondary" onClick={onClose} type="button">Hủy</Button>
               <Button type="submit" icon={<Save className="w-4 h-4" />}>Lưu hoạt động</Button>
            </div>
         </form>
      </Modal>
   );
};