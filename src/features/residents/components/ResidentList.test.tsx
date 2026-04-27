import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResidentList } from './ResidentList';

describe('ResidentList', () => {
  it('renders Vietnamese table labels for resident care data', () => {
    render(
      <ResidentList
        data={[
          {
            id: 'resident-1',
            clinicCode: 'NCT-001',
            name: 'Lê Thị Lan',
            dob: '1950-01-01',
            gender: 'Nữ',
            room: 'Chưa xếp',
            bed: '',
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
            isDiabetic: true,
            allergies: [],
            medicalHistory: [],
          },
        ]}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText(/Họ và tên/i)).toBeInTheDocument();
    expect(screen.getByText(/Tình trạng y tế/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiểu đường/i)).toBeInTheDocument();
    expect(screen.getByText(/Chưa xếp/i)).toBeInTheDocument();
  });
});
