import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'nurse-1',
      name: 'Nurse Tester',
      username: 'nurse',
      role: 'NURSE',
    },
    logout: vi.fn(),
  }),
}));

vi.mock('../../stores/residentsStore', () => {
  const state = {
    residents: [
      {
        id: 'resident-1',
        name: 'Lê Thị Lan',
        room: '202',
        floor: 'Tầng 2',
        dob: '1950-01-01',
        balance: 0,
      },
    ],
    isSyncing: false,
    selectResident: vi.fn(),
  };

  return {
    useResidentsStore: Object.assign(() => state, {
      getState: () => state,
    }),
  };
});

vi.mock('../../stores/incidentsStore', () => ({
  useIncidentsStore: () => ({
    incidents: [],
    isSyncing: false,
  }),
}));

vi.mock('react-hot-toast', () => ({
  toast: vi.fn(),
}));

describe('Header', () => {
  it('renders Vietnamese search and account labels without mojibake', () => {
    render(
      <MemoryRouter>
        <Header title="Danh sách NCT" />
      </MemoryRouter>,
    );

    expect(
      screen.getByPlaceholderText(/Tìm nhanh NCT \(Tên, Số phòng\)\.\.\./i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Nurse Tester/i }));

    expect(screen.getByRole('button', { name: /Hồ sơ cá nhân/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đổi mật khẩu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng xuất/i })).toBeInTheDocument();
  });
});
