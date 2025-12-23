import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Resident } from '@/src/types/index';
import { Input, Select, Button, Modal } from '@/src/components/ui/index';

interface EditResidentModalProps {
  resident: Resident;
  onClose: () => void;
  onSave: (data: Partial<Resident>) => void;
}

export const EditResidentModal = ({ resident, onClose, onSave }: EditResidentModalProps) => {
  const [formData, setFormData] = useState<Partial<Resident>>({
    name: resident.name,
    dob: resident.dob,
    gender: resident.gender,
    room: resident.room,
    bed: resident.bed,
    floor: resident.floor,
    building: resident.building || 'Tòa A',
    guardianName: resident.guardianName,
    guardianPhone: resident.guardianPhone,
    careLevel: resident.careLevel,
    status: resident.status,
    dietType: resident.dietType,
    dietNote: resident.dietNote
  });

  const handleChange = (field: keyof Resident, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal title="Chỉnh sửa thông tin NCT" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Họ và tên"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
          />
          <Input
            label="Ngày sinh"
            type="date"
            value={formData.dob}
            onChange={e => handleChange('dob', e.target.value)}
          />
          <Select
            label="Giới tính"
            value={formData.gender}
            onChange={e => handleChange('gender', e.target.value)}
            options={[
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' }
            ]}
          />
          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={e => handleChange('status', e.target.value)}
            options={[
              { value: 'Active', label: 'Đang ở' },
              { value: 'Discharged', label: 'Đã xuất viện' }
            ]}
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-bold text-sm text-slate-800 mb-3">Thông tin phòng ở</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              label="Tòa nhà"
              value={formData.building}
              onChange={e => handleChange('building', e.target.value)}
              options={[
                { value: 'Tòa A', label: 'Tòa A' },
                { value: 'Tòa B', label: 'Tòa B' },
              ]}
            />
            <Select
              label="Tầng"
              value={formData.floor}
              onChange={e => handleChange('floor', e.target.value)}
              options={[
                { value: 'Tầng 1', label: 'Tầng 1' },
                { value: 'Tầng 2', label: 'Tầng 2' },
                { value: 'Tầng 3', label: 'Tầng 3' },
                { value: 'Tầng 4', label: 'Tầng 4' },
                { value: 'Tầng 5', label: 'Tầng 5' },
              ]}
            />
            <Input label="Phòng" value={formData.room} onChange={e => handleChange('room', e.target.value)} />
            <Input label="Giường" value={formData.bed} onChange={e => handleChange('bed', e.target.value)} />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-bold text-sm text-slate-800 mb-3">Người bảo trợ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Họ tên" value={formData.guardianName} onChange={e => handleChange('guardianName', e.target.value)} />
            <Input label="Số điện thoại" value={formData.guardianPhone} onChange={e => handleChange('guardianPhone', e.target.value)} />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-bold text-sm text-slate-800 mb-3">Chế độ Dinh dưỡng</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Loại chế độ ăn"
              value={formData.dietType}
              onChange={e => handleChange('dietType', e.target.value)}
              options={[
                { value: 'Normal', label: 'Cơm (Thường)' },
                { value: 'Porridge', label: 'Cháo' },
                { value: 'Soup', label: 'Súp' },
                { value: 'Pureed', label: 'Xay' },
                { value: 'Tube', label: 'Ăn qua Sonde' },
                { value: 'Cut', label: 'Cắt cơm' }
              ]}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú dinh dưỡng</label>
              <textarea
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-teal-500 focus:border-teal-500"
                rows={2}
                placeholder="VD: Kiêng muối, ăn chay, dị ứng..."
                value={formData.dietNote || ''}
                onChange={e => handleChange('dietNote', e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <Button variant="secondary" onClick={onClose} type="button">Hủy bỏ</Button>
          <Button type="submit" icon={<Save className="w-4 h-4" />}>Lưu thay đổi</Button>
        </div>
      </form>
    </Modal>
  );
};