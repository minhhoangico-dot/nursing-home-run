import React, { useState } from 'react';
import { Building, Save, MapPin, Phone, Mail } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui';
import { useToast } from '../../../app/providers';

export const FacilityConfig = () => {
  const [config, setConfig] = useState({
    name: 'Viện Dưỡng Lão FDC',
    address: '123 Đường ABC, Quận 7, TP.HCM',
    phone: '028 1234 5678',
    email: 'contact@fdc.vn',
    totalFloors: 4,
    roomsPerFloor: 6
  });
  const { addToast } = useToast();

  const handleSave = () => {
    addToast('success', 'Đã lưu cấu hình', 'Thông tin cơ sở đã được cập nhật thành công.');
  };

  return (
    <div className="space-y-6">
      <Card title="Thông tin cơ sở">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Tên đơn vị"
            value={config.name}
            onChange={e => setConfig({ ...config, name: e.target.value })}
            icon={<Building className="w-4 h-4" />}
          />
          <Input
            label="Địa chỉ"
            value={config.address}
            onChange={e => setConfig({ ...config, address: e.target.value })}
            icon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Số điện thoại"
            value={config.phone}
            onChange={e => setConfig({ ...config, phone: e.target.value })}
            icon={<Phone className="w-4 h-4" />}
          />
          <Input
            label="Email liên hệ"
            value={config.email}
            onChange={e => setConfig({ ...config, email: e.target.value })}
            icon={<Mail className="w-4 h-4" />}
          />
        </div>
      </Card>

      <Card title="Cấu trúc tòa nhà">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <h4 className="font-bold text-slate-800 mb-2">Quy mô hiện tại</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex justify-between"><span>Số tầng:</span> <span className="font-bold">{config.totalFloors}</span></li>
              <li className="flex justify-between"><span>Phòng mỗi tầng:</span> <span className="font-bold">{config.roomsPerFloor}</span></li>
              <li className="flex justify-between border-t border-slate-200 pt-2"><span>Tổng sức chứa:</span> <span className="font-bold text-teal-600">{config.totalFloors * config.roomsPerFloor * 2} giường (ước tính)</span></li>
            </ul>
          </div>
          <div className="space-y-4">
            <Input
              label="Số lượng tầng"
              type="number"
              value={config.totalFloors}
              onChange={e => setConfig({ ...config, totalFloors: Number(e.target.value) })}
            />
            <Input
              label="Số phòng trung bình / tầng"
              type="number"
              value={config.roomsPerFloor}
              onChange={e => setConfig({ ...config, roomsPerFloor: Number(e.target.value) })}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>Lưu thay đổi</Button>
      </div>
    </div>
  );
};