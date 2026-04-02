import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { RoomMapPage } from './RoomMapPage';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: () => ({
    mode: 'readOnly',
    visible: false,
    canViewFinance: false,
    canEditFinance: false,
  }),
}));

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'U1', name: 'Admin', username: 'admin', role: 'ADMIN' },
  }),
}));

vi.mock('../../../stores/residentsStore', () => ({
  useResidentsStore: () => ({
    residents: [],
    updateResident: vi.fn(),
    selectResident: vi.fn(),
  }),
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
  generateRooms: () => [
    {
      id: 'room-101',
      number: '101',
      type: '1 Giường',
      building: 'Tòa A',
      floor: 'Tầng 2',
      beds: [
        { id: 'bed-101-1', status: 'Available', residentId: null },
      ],
    },
  ],
}));

describe('RoomMapPage', () => {
  it('hides room mutation controls in read-only mode', () => {
    render(<RoomMapPage />);

    expect(screen.queryByText(/^Chỉnh sửa$/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Thêm phòng/i)).not.toBeInTheDocument();
  });
});
