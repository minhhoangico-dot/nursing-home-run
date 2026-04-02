import { render, screen } from '@testing-library/react';
import { ResidentBasicInfo } from './ResidentBasicInfo';
import type { Resident } from '@/src/types';

const residentFixture: Resident = {
  id: 'RES-1',
  clinicCode: 'HS001',
  name: 'Nguyen Van A',
  dob: '1950-01-01',
  gender: 'Nam',
  room: '101',
  bed: 'A',
  floor: 'Tang 1',
  building: 'Khu A',
  careLevel: 2,
  status: 'Active',
  admissionDate: '2026-01-01',
  guardianName: 'Nguyen Van B',
  guardianPhone: '0900000000',
  balance: 0,
  assessments: [],
  prescriptions: [],
  medicalVisits: [],
  specialMonitoring: [],
  medicalHistory: [],
  allergies: [],
  vitalSigns: [],
  careLogs: [],
  currentConditionNote: '',
  lastMedicalUpdate: '2026-03-01',
  roomType: '2 Giường',
  dietType: 'Normal',
  isDiabetic: false,
};

describe('ResidentBasicInfo', () => {
  it('hides the edit button in read-only mode', () => {
    render(
      <ResidentBasicInfo
        resident={residentFixture}
        readOnly={true}
        onEdit={() => {}}
        onPrint={() => {}}
      />,
    );

    expect(screen.queryByRole('button', { name: /Chỉnh sửa/i })).not.toBeInTheDocument();
  });
});
