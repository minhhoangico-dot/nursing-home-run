import React, { useState, useEffect } from 'react';
import { Building, Save, MapPin, Phone, Mail, Hash, Globe } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui';
import { useToast } from '../../../app/providers';
import { useRoomConfigStore, FacilityInfo } from '../../../stores/roomConfigStore';

export const FacilityConfig = () => {
  const { facility, updateFacilityConfig } = useRoomConfigStore();
  const [config, setConfig] = useState<FacilityInfo>(facility);
  const { addToast } = useToast();

  useEffect(() => {
    setConfig(facility);
  }, [facility]);

  const handleSave = () => {
    updateFacilityConfig(config);
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
            label="Mã số thuế"
            value={config.taxCode}
            onChange={e => setConfig({ ...config, taxCode: e.target.value })}
            icon={<Hash className="w-4 h-4" />}
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
          <Input
            label="Website"
            value={config.website || ''}
            onChange={e => setConfig({ ...config, website: e.target.value })}
            icon={<Globe className="w-4 h-4" />}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>Lưu thay đổi</Button>
      </div>
    </div>
  );
};
