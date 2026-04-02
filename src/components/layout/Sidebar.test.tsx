import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import { DEFAULT_ROLE_MODULE_PERMISSIONS } from '@/src/utils/modulePermissions';

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'doctor-1',
      name: 'Doctor Demo',
      username: 'doctor',
      role: 'DOCTOR',
    },
    logout: vi.fn(),
  }),
}));

vi.mock('@/src/stores/appSettingsStore', () => ({
  useAppSettingsStore: () => ({
    permissions: {
      ...DEFAULT_ROLE_MODULE_PERMISSIONS,
      DOCTOR: {
        ...DEFAULT_ROLE_MODULE_PERMISSIONS.DOCTOR,
        finance: { view: false, edit: false },
      },
    },
  }),
}));

vi.mock('@/src/hooks/useFacilityBranding', () => ({
  useFacilityBranding: () => ({
    name: 'VDL FDC',
    logoSrc: '/logo.png',
  }),
}));

describe('Sidebar', () => {
  it('removes hidden modules from navigation', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Danh sách NCT/i)).toBeInTheDocument();
    expect(screen.queryByText(/Tài chính/i)).not.toBeInTheDocument();
  });
});
