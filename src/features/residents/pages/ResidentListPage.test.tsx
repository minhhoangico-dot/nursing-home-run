import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ResidentListPage } from './ResidentListPage';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: () => ({
    mode: 'readOnly',
    visible: true,
    canViewFinance: false,
    canEditFinance: false,
  }),
}));

vi.mock('@/src/stores/residentsStore', () => ({
  useResidentsStore: () => ({
    residents: [
      {
        id: 'RES-1',
        name: 'Nguyen Van A',
        dob: '1950-01-01',
        room: '101',
        bed: 'A',
        building: 'Khu A',
        floor: 'Tang 1',
        status: 'Active',
        isDiabetic: false,
      },
    ],
    addResident: vi.fn(),
    selectResident: vi.fn(),
  }),
}));

vi.mock('../components/ResidentFilters', () => ({
  ResidentFilters: () => <div>Resident filters</div>,
}));

vi.mock('../components/ResidentList', () => ({
  ResidentList: () => <div>Resident list</div>,
}));

vi.mock('../../../components/shared/ResidentCard', () => ({
  ResidentCard: () => <div>Resident card</div>,
}));

describe('ResidentListPage', () => {
  it('hides resident creation controls in read-only mode', () => {
    render(<ResidentListPage />);

    expect(screen.queryAllByRole('button', { name: /Thêm NCT mới/i })).toHaveLength(0);
  });
});
