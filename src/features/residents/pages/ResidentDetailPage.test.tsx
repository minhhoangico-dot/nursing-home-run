import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { ResidentDetailPage } from './ResidentDetailPage';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  fetchResidentDetail: vi.fn(),
  updateResident: vi.fn(),
  params: { id: 'RES-1' } as { id?: string },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
  useParams: () => mocks.params,
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: () => ({
    mode: 'full',
    visible: true,
    canViewFinance: true,
    canEditFinance: true,
  }),
}));

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'user-1',
      name: 'Điều dưỡng A',
      role: 'NURSE',
    },
  }),
}));

vi.mock('@/src/stores/residentsStore', () => ({
  useResidentsStore: () => ({
    residents: [
      {
        id: 'RES-1',
        clinicCode: 'NCT-001',
        name: 'Nguyễn Văn A',
        dob: '1950-01-01',
        gender: 'Nam',
        room: '101',
        bed: 'A',
        building: 'Tòa A',
        floor: 'Tầng 1',
        careLevel: 2,
        status: 'Active',
        admissionDate: '2026-01-01',
        guardianName: 'Nguyễn Văn B',
        guardianPhone: '0900000000',
        balance: 0,
        currentConditionNote: '',
        lastMedicalUpdate: '2026-04-01',
        roomType: 'Đôi',
        dietType: 'Normal',
        isDiabetic: false,
      },
    ],
    residentDetails: {},
    fetchResidentDetail: mocks.fetchResidentDetail,
    updateResident: mocks.updateResident,
  }),
}));

vi.mock('@/src/stores/financeStore', () => ({
  useFinanceStore: () => ({
    servicePrices: [],
    usageRecords: [],
    recordUsage: vi.fn(),
  }),
}));

vi.mock('../components/ResidentBasicInfo', () => ({
  ResidentBasicInfo: () => <div>Resident basic info</div>,
}));

vi.mock('../components/ResidentDetail', () => ({
  ResidentDetail: () => <div>Resident detail</div>,
}));

vi.mock('../components/EditResidentModal', () => ({
  EditResidentModal: () => <div>Edit resident modal</div>,
}));

vi.mock('@/src/features/assessments/components/AssessmentWizard', () => ({
  AssessmentWizard: () => <div>Assessment wizard</div>,
}));

describe('ResidentDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.params.id = 'RES-1';
    mocks.fetchResidentDetail.mockResolvedValue(undefined);
  });

  it('renders the resident loading state in Vietnamese', async () => {
    render(<ResidentDetailPage />);

    expect(screen.getByText(/Đang tải hồ sơ NCT\.\.\./i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.fetchResidentDetail).toHaveBeenCalledWith('RES-1');
    });
  });

  it('redirects without fetching when the route id is the string undefined', async () => {
    mocks.params.id = 'undefined';

    render(<ResidentDetailPage />);

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/residents', { replace: true });
    });
    expect(mocks.fetchResidentDetail).not.toHaveBeenCalled();
  });
});
