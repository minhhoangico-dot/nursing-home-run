// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Prescription, Resident, User } from '../../../types';

const fetchPrescriptionsMock = vi.fn();
const usePrescriptionsStoreMock = vi.fn();

vi.mock('../../../stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => usePrescriptionsStoreMock(),
}));

vi.mock('../utils/printTemplates', () => ({
  printDailyMedicationSheet: vi.fn(),
  printPrescription: vi.fn(),
}));

vi.mock('./PrescriptionForm', () => ({
  PrescriptionForm: () => <div>PrescriptionForm</div>,
}));

vi.mock('./MedicineManager', () => ({
  MedicineManager: () => <div>MedicineManager</div>,
}));

vi.mock('@/src/components/ui', () => ({
  Table: ({ data }: { data: unknown[] }) => <div data-testid="active-medications-table">{data.length}</div>,
}));

import { PrescriptionList } from './PrescriptionList';

const mockResident: Resident = {
  id: 'resident-1',
  name: 'Nguyen Van A',
  dob: '1940-01-01',
  gender: 'Nam',
  room: '101',
  bed: 'A',
  floor: 'Tang 1',
  building: 'Khu A',
  careLevel: 2,
  status: 'Active',
  admissionDate: '2025-01-01',
  guardianName: 'Nguoi nha',
  guardianPhone: '0900000000',
  balance: 0,
  assessments: [],
  prescriptions: [],
  medicalVisits: [],
  specialMonitoring: [],
  medicalHistory: [],
  allergies: [],
  careLogs: [],
  currentConditionNote: '',
  lastMedicalUpdate: '2026-03-31',
  roomType: '2 Giuong',
  dietType: 'Normal',
  isDiabetic: false,
};

const mockUser: User = {
  id: 'doctor-1',
  name: 'Bac si B',
  username: 'doctor',
  password: 'password',
  role: 'DOCTOR',
};

const activePrescription: Prescription = {
  id: 'prescription-1',
  code: 'DT-001',
  residentId: 'resident-1',
  doctorId: 'doctor-1',
  doctorName: 'Bac si B',
  diagnosis: 'Tang huyet ap',
  prescriptionDate: '2026-03-31',
  startDate: '2026-03-31',
  status: 'Active',
  items: [
    {
      id: 'item-1',
      prescriptionId: 'prescription-1',
      medicineId: 'medicine-1',
      medicineName: 'Amlodipine',
      dosage: '1 vien',
      frequency: '2 lan/ngay',
      timesOfDay: ['Sang', 'Toi'],
      quantity: 30,
    },
  ],
};

describe('PrescriptionList', () => {
  beforeEach(() => {
    fetchPrescriptionsMock.mockReset();
    usePrescriptionsStoreMock.mockReset();
  });

  it('keeps a dedicated print-prescription action for active prescriptions', async () => {
    usePrescriptionsStoreMock.mockReturnValue({
      prescriptions: [activePrescription],
      fetchPrescriptions: fetchPrescriptionsMock,
      isLoading: false,
    });

    render(<PrescriptionList user={mockUser} resident={mockResident} onUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(fetchPrescriptionsMock).toHaveBeenCalledWith('resident-1');
    });

    expect(screen.getByRole('button', { name: /in phi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /in don thuoc|in đơn thuốc/i })).toBeInTheDocument();
    expect(screen.getByText('DT-001')).toBeInTheDocument();
  });

  it('keeps an adjust action for active prescriptions', async () => {
    usePrescriptionsStoreMock.mockReturnValue({
      prescriptions: [activePrescription],
      fetchPrescriptions: fetchPrescriptionsMock,
      isLoading: false,
    });

    render(<PrescriptionList user={mockUser} resident={mockResident} onUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(fetchPrescriptionsMock).toHaveBeenCalledWith('resident-1');
    });

    expect(screen.getAllByRole('button', { name: /dieu chinh|điều chỉnh/i }).length).toBeGreaterThan(0);
  });
});
