import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomMapPage } from './RoomMapPage';

const { navigateMock, toastMock, residentsStoreState, moduleAccessState, generatedRooms } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
  residentsStoreState: {
    residents: [] as Array<Record<string, unknown>>,
    updateResident: vi.fn(),
    selectResident: vi.fn(),
  },
  moduleAccessState: {
    mode: 'readOnly',
    visible: false,
    canViewFinance: false,
    canEditFinance: false,
  },
  generatedRooms: [] as Array<Record<string, unknown>>,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('react-hot-toast', () => ({
  toast: toastMock,
}));

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: () => moduleAccessState,
}));

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'U1', name: 'Admin', username: 'admin', role: 'ADMIN' },
  }),
}));

vi.mock('../../../stores/residentsStore', () => ({
  useResidentsStore: () => residentsStoreState,
}));

vi.mock('../../../stores/roomsStore', () => ({
  useRoomsStore: () => ({
    maintenanceRequests: [],
  }),
}));

vi.mock('../../../stores/roomConfigStore', () => ({
  useRoomConfigStore: () => ({
    configs: [],
    updateRoom: vi.fn(),
    addRoom: vi.fn(),
    deleteRoom: vi.fn(),
  }),
}));

vi.mock('../../../constants/facility', () => ({
  BUILDING_STRUCTURE: [
    {
      id: 'Tòa A',
      name: 'Tòa A',
      floors: ['Tầng 2'],
    },
  ],
}));

vi.mock('../../../data/index', () => ({
  generateRooms: () => generatedRooms,
}));

describe('RoomMapPage', () => {
  beforeEach(() => {
    moduleAccessState.mode = 'readOnly';
    moduleAccessState.visible = false;
    moduleAccessState.canViewFinance = false;
    moduleAccessState.canEditFinance = false;

    residentsStoreState.residents = [];
    residentsStoreState.updateResident = vi.fn();
    residentsStoreState.selectResident = vi.fn();

    generatedRooms.splice(0, generatedRooms.length);
    generatedRooms.push({
      id: 'room-101',
      number: '101',
      type: '1 Giường',
      building: 'Tòa A',
      floor: 'Tầng 2',
      beds: [{ id: 'bed-101-1', status: 'Available', residentId: null }],
    });

    navigateMock.mockReset();
    toastMock.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
  });

  it('hides room mutation controls in read-only mode', () => {
    render(<RoomMapPage />);

    expect(screen.queryByText(/^Chỉnh sửa$/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Thêm phòng/i)).not.toBeInTheDocument();
  });

  it('shows a toast instead of leaking a rejected discharge mutation', async () => {
    const user = userEvent.setup();

    moduleAccessState.mode = 'full';
    moduleAccessState.visible = true;

    residentsStoreState.residents = [
      {
        id: 'resident-1',
        name: 'Resident One',
        dob: '1950-01-01',
        gender: 'Nam',
        room: '101',
        bed: 'A',
        floor: 'Tầng 2',
        building: 'Tòa A',
        careLevel: 2,
        status: 'Active',
        admissionDate: '2026-01-01',
        guardianName: 'Guardian',
        guardianPhone: '0900000000',
        balance: 0,
        currentConditionNote: 'Stable',
        lastMedicalUpdate: '2026-04-01',
        roomType: '1 Giường',
        dietType: 'Normal',
        isDiabetic: false,
      },
    ];
    residentsStoreState.updateResident = vi
      .fn()
      .mockRejectedValue(new Error('Supabase write failed'));

    generatedRooms.splice(0, generatedRooms.length);
    generatedRooms.push({
      id: 'room-101',
      number: '101',
      type: '1 Giường',
      building: 'Tòa A',
      floor: 'Tầng 2',
      beds: [{ id: 'bed-101-1', status: 'Occupied', residentId: 'resident-1' }],
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<RoomMapPage />);

    await user.click(screen.getByText('Resident One'));
    await user.click(screen.getByRole('button', { name: /Làm thủ tục xuất viện/i }));

    await waitFor(() => {
      expect(residentsStoreState.updateResident).toHaveBeenCalledTimes(1);
      expect(toastMock.error).toHaveBeenCalledWith('Supabase write failed');
    });
  });
});
