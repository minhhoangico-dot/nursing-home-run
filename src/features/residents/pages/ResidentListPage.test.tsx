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
        clinicCode: 'NCT-001',
        name: 'Nguyen Van A',
        dob: '1950-01-01',
        gender: 'Nam',
        room: '101',
        bed: 'A',
        building: 'Khu A',
        floor: 'Tang 1',
        careLevel: 2,
        status: 'Active',
        admissionDate: '2026-01-01',
        guardianName: 'Nguyen Van B',
        guardianPhone: '0900000000',
        balance: 0,
        currentConditionNote: '',
        lastMedicalUpdate: '2026-04-01',
        roomType: '2 Giuong',
        dietType: 'Normal',
        isDiabetic: false,
      },
    ],
    residentDetails: {},
    fetchResidentDetail: vi.fn().mockResolvedValue(undefined),
    addResident: vi.fn(),
    selectResident: vi.fn(),
  }),
}));

vi.mock('@/src/stores/financeStore', () => ({
  useFinanceStore: () => ({
    servicePrices: [],
    fetchFinanceData: vi.fn(),
    isLoaded: true,
    replaceResidentFixedServices: vi.fn(),
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

    expect(screen.getByRole('heading', { name: /Danh sách NCT/i })).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /Thêm NCT mới/i })).toHaveLength(0);
  });
});
