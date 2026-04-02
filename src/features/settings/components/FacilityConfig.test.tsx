import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FacilityConfig } from './FacilityConfig';

vi.mock('../../../app/providers', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

vi.mock('@/src/stores/appSettingsStore', () => {
  const saveFacility = vi.fn().mockResolvedValue(undefined);
  const facility = {
    name: 'Vien Duong Lao FDC',
    address: '123 Duong ABC',
    phone: '028 1234 5678',
    email: 'contact@fdc.vn',
    taxCode: '0123456789',
    logoDataUrl: '',
  };
  const store = {
    facility,
    saveFacility,
    isSaving: false,
  };
  (globalThis as Record<string, unknown>).__facilityConfigSaveFacilityMock = saveFacility;

  return {
    useAppSettingsStore: () => store,
  };
});

describe('FacilityConfig', () => {
  it('saves branding through the shared settings store', () => {
    render(<FacilityConfig />);

    fireEvent.change(screen.getByDisplayValue('Vien Duong Lao FDC'), {
      target: { value: 'VDL FDC Moi' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/i }));

    expect((globalThis as Record<string, any>).__facilityConfigSaveFacilityMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'VDL FDC Moi' }),
    );
  });
});
