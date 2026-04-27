import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResidentCard } from './ResidentCard';

describe('ResidentCard', () => {
  it('renders resident summary labels in Vietnamese', () => {
    render(
      <ResidentCard
        resident={{
          id: 'resident-1',
          clinicCode: 'NCT-001',
          name: 'Lê Thị Lan',
          dob: '1950-01-01',
          gender: 'Nữ',
          room: '202',
          bed: 'B',
          building: 'Tòa A',
          floor: 'Tầng 2',
          careLevel: 2,
          status: 'Active',
          admissionDate: '2026-01-01',
          guardianName: 'Nguyễn Văn B',
          guardianPhone: '0900000000',
          balance: 0,
          currentConditionNote: '',
          lastMedicalUpdate: '2026-04-01',
          roomType: '2 Giường',
          dietType: 'Normal',
          isDiabetic: false,
        }}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/tuổi • Nữ/i)).toBeInTheDocument();
    expect(screen.getByText(/Đủ phí/i)).toBeInTheDocument();
  });
});
