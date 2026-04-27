import React, { useRef, useState } from 'react';
import { Save, RefreshCw, ArrowRightLeft, BedDouble, UserCircle, Heart, Utensils } from 'lucide-react';
import { Resident } from '@/src/types/index';
import { Input, Select, Button, Modal, Tabs } from '@/src/components/ui/index';
import { generateClinicCode } from '@/src/utils/clinicCodeUtils';

interface EditResidentModalProps {
  resident: Resident;
  onClose: () => void;
  onSave: (data: Partial<Resident>) => void;
  existingCodes?: string[];
  readOnly?: boolean;
  onRequestTransfer?: () => void;
}

type TabId = 'admin' | 'guardian' | 'diet';

const TABS = [
  { id: 'admin', label: 'Hành chính', icon: <UserCircle className="w-4 h-4" /> },
  { id: 'guardian', label: 'Bảo trợ', icon: <Heart className="w-4 h-4" /> },
  { id: 'diet', label: 'Dinh dưỡng', icon: <Utensils className="w-4 h-4" /> },
];

export const EditResidentModal = ({
  resident,
  onClose,
  onSave,
  existingCodes = [],
  readOnly = false,
  onRequestTransfer,
}: EditResidentModalProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('admin');
  const initialFormData: Partial<Resident> = {
    name: resident.name,
    dob: resident.dob,
    gender: resident.gender,
    clinicCode: resident.clinicCode,
    guardianName: resident.guardianName,
    guardianPhone: resident.guardianPhone,
    careLevel: resident.careLevel,
    status: resident.status,
    dietType: resident.dietType,
    dietNote: resident.dietNote,
  };
  const initialSnapshot = useRef(JSON.stringify(initialFormData));
  const [formData, setFormData] = useState<Partial<Resident>>(initialFormData);
  const isDirty = JSON.stringify(formData) !== initialSnapshot.current;

  const handleChange = (field: keyof Resident, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateCode = () => {
    if (readOnly) return;
    const code = generateClinicCode(formData, existingCodes);
    handleChange('clinicCode', code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) {
      onClose();
      return;
    }
    onSave(formData);
    onClose();
  };

  if (readOnly) return null;

  return (
    <Modal title="Chỉnh sửa thông tin NCT" onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <p className="mb-0.5 text-xs font-bold uppercase text-slate-500">Phòng / Giường</p>
              <p className="text-sm font-bold text-slate-800">
                P.{resident.room} - Giường {resident.bed}
              </p>
              <p className="text-xs text-slate-500">
                {resident.building} • {resident.floor}
              </p>
            </div>
          </div>
          {onRequestTransfer && (
            <button
              type="button"
              onClick={() => {
                if (isDirty) {
                  const ok = window.confirm(
                    'Bạn có thay đổi chưa lưu. Mở "Đổi phòng/giường" sẽ bỏ các thay đổi này. Tiếp tục?'
                  );
                  if (!ok) return;
                }
                onRequestTransfer();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:border-teal-300 hover:bg-teal-50"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Đổi phòng/giường
            </button>
          )}
        </div>

        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />

        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <Input
              label="Họ và tên"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Mã phòng khám (Mã hồ sơ)"
                  value={formData.clinicCode || ''}
                  onChange={e => handleChange('clinicCode', e.target.value)}
                  placeholder="VD: 2589010001"
                />
              </div>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="mb-[2px] rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-600"
                title="Tạo mã tự động"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
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
                { value: 'Nữ', label: 'Nữ' },
              ]}
            />
            <Select
              label="Trạng thái"
              value={formData.status}
              onChange={e => handleChange('status', e.target.value)}
              options={[
                { value: 'Active', label: 'Đang ở' },
                { value: 'Discharged', label: 'Đã xuất viện' },
              ]}
            />
          </div>
        )}

        {activeTab === 'guardian' && (
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <Input
              label="Họ tên"
              value={formData.guardianName}
              onChange={e => handleChange('guardianName', e.target.value)}
            />
            <Input
              label="Số điện thoại"
              value={formData.guardianPhone}
              onChange={e => handleChange('guardianPhone', e.target.value)}
            />
          </div>
        )}

        {activeTab === 'diet' && (
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
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
                { value: 'Cut', label: 'Cắt cơm' },
              ]}
            />
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Ghi chú dinh dưỡng
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                rows={2}
                placeholder="VD: Kiêng muối, ăn chay, dị ứng..."
                value={formData.dietNote || ''}
                onChange={e => handleChange('dietNote', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Hủy bỏ
          </Button>
          <Button type="submit" icon={<Save className="h-4 w-4" />}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
