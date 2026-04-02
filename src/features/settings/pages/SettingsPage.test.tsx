// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../app/providers', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    users: [],
  }),
}));

vi.mock('../../../stores/financeStore', () => ({
  useFinanceStore: () => ({
    servicePrices: [],
    updateServicePrice: vi.fn(),
    deleteServicePrice: vi.fn(),
  }),
}));

vi.mock('../../../services/databaseService', () => ({
  db: {
    users: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('../components/AddUserModal', () => ({
  AddUserModal: () => <div>AddUserModal</div>,
}));

vi.mock('../../finance/components/ServiceCatalog', () => ({
  ServiceCatalog: () => <div>ServiceCatalog</div>,
}));

vi.mock('../components/FacilityConfig', () => ({
  FacilityConfig: () => <div>FacilityConfig</div>,
}));

vi.mock('../components/RolePermissionsPanel', () => ({
  RolePermissionsPanel: () => <div>RolePermissionsPanel</div>,
}));

import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  it('exposes role management from the settings menu', () => {
    render(<SettingsPage />);

    const roleTile = screen.getByText('Vai trò & phân quyền');
    fireEvent.click(roleTile);

    expect(screen.getByText('RolePermissionsPanel')).toBeInTheDocument();
  });
});
