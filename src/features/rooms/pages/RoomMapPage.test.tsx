// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { INITIAL_RESIDENTS } from '../../../data/mockResidents';
import { SPECIAL_FLOOR_CONFIG } from '../../../data/mockRooms';
import type { User } from '../../../types';

const mockNavigate = vi.fn();
const mockUpdateResident = vi.fn();
const mockSelectResident = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
  },
}));

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'user-1',
      name: 'Điều dưỡng A',
      username: 'nurse-a',
      role: 'NURSE',
    } satisfies User,
  }),
}));

vi.mock('../../../stores/residentsStore', () => ({
  useResidentsStore: () => ({
    residents: INITIAL_RESIDENTS,
    updateResident: mockUpdateResident,
    selectResident: mockSelectResident,
  }),
}));

vi.mock('../../../stores/roomsStore', () => ({
  useRoomsStore: () => ({
    maintenanceRequests: [],
  }),
}));

vi.mock('../../../stores/roomConfigStore', () => ({
  useRoomConfigStore: () => ({
    configs: SPECIAL_FLOOR_CONFIG,
    updateRoom: vi.fn(),
    addRoom: vi.fn(),
    deleteRoom: vi.fn(),
  }),
}));

vi.mock('../components/TransferRoomModal', () => ({
  TransferRoomModal: () => <div>TransferRoomModal</div>,
}));

vi.mock('../components/AssignBedModal', () => ({
  AssignBedModal: () => <div>AssignBedModal</div>,
}));

vi.mock('../components/RoomEditModal', () => ({
  RoomEditModal: () => <div>RoomEditModal</div>,
}));

import { RoomMapPage } from './RoomMapPage';

describe('RoomMapPage', () => {
  it('hides the discharge action in the occupied-bed detail modal', () => {
    render(<RoomMapPage />);

    fireEvent.click(screen.getByText('Lê Thị Lan'));

    expect(screen.getByText(/Cần hỗ trợ nhắc uống thuốc và theo dõi ăn uống đồ ngọt\./i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Làm thủ tục xuất viện' })).not.toBeInTheDocument();
  });
});
