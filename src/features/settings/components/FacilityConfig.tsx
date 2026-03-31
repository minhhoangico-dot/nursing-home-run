import React, { useEffect, useState } from 'react';
import { Building, Hash, Mail, MapPin, Phone, Save, Trash2, Upload } from 'lucide-react';
import { useToast } from '../../../app/providers';
import { Button } from '../../../components/ui';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import type { FacilityInfo } from '@/src/types/appSettings';
import { fallbackFacilityLogo, getFacilityBranding } from '@/src/utils/facilityBranding';

const LOGO_FILE_SIZE_LIMIT = 2 * 1024 * 1024;

export const FacilityConfig = () => {
  const { facility, saveFacility, isSaving } = useAppSettingsStore();
  const [config, setConfig] = useState<FacilityInfo>(facility);
  const { addToast } = useToast();

  useEffect(() => {
    setConfig(facility);
  }, [facility]);

  const handleSave = async () => {
    try {
      await saveFacility(config);
      addToast('success', 'Đã lưu cấu hình', 'Thông tin cơ sở đã được cập nhật thành công.');
    } catch {
      addToast('error', 'Không lưu được', 'Không thể cập nhật thông tin đơn vị.');
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Tệp không hợp lệ', 'Vui lòng chọn tệp hình ảnh.');
      return;
    }

    if (file.size > LOGO_FILE_SIZE_LIMIT) {
      addToast('error', 'Logo quá lớn', 'Vui lòng chọn logo nhỏ hơn 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        addToast('error', 'Không đọc được logo', 'Vui lòng thử lại với tệp khác.');
        return;
      }

      setConfig((current) => ({ ...current, logoDataUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setConfig((current) => ({ ...current, logoDataUrl: '' }));
  };

  const branding = getFacilityBranding(config);

  return (
    <div className="space-y-6">
      <Card title="Thông tin cơ sở">
        <div className="space-y-6">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img
                    src={branding.logoSrc}
                    alt={`Logo ${branding.name}`}
                    className="h-full w-full object-contain p-3"
                    onError={(event) => fallbackFacilityLogo(event.currentTarget)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-800">Logo đơn vị</div>
                  <div className="text-sm text-slate-500">
                    Dùng cho phần thông tin đơn vị, đơn thuốc, biểu mẫu in và trang đăng nhập.
                  </div>
                  <div className="text-xs text-slate-400">
                    Hỗ trợ ảnh PNG, JPG, WEBP, SVG. Tối đa 2MB.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700">
                  <Upload className="h-4 w-4" />
                  Tải logo lên
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={handleRemoveLogo}
                >
                  Dùng logo mặc định
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Tên đơn vị"
              value={config.name}
              onChange={(event) => setConfig({ ...config, name: event.target.value })}
              icon={<Building className="w-4 h-4" />}
            />
            <Input
              label="Mã số thuế"
              value={config.taxCode}
              onChange={(event) => setConfig({ ...config, taxCode: event.target.value })}
              icon={<Hash className="w-4 h-4" />}
            />
            <Input
              label="Địa chỉ"
              value={config.address}
              onChange={(event) => setConfig({ ...config, address: event.target.value })}
              icon={<MapPin className="w-4 h-4" />}
            />
            <Input
              label="Số điện thoại"
              value={config.phone}
              onChange={(event) => setConfig({ ...config, phone: event.target.value })}
              icon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Email liên hệ"
              value={config.email}
              onChange={(event) => setConfig({ ...config, email: event.target.value })}
              icon={<Mail className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button icon={<Save className="w-4 h-4" />} onClick={() => void handleSave()} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </div>
  );
};
