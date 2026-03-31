// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActiveMedicationRow,
  Prescription,
  PrescriptionSnapshot,
  Resident,
  User,
} from '../../../types';

const fetchPrescriptionsMock = vi.fn();
const pausePrescriptionMock = vi.fn();
const completePrescriptionMock = vi.fn();
const fetchPrescriptionSnapshotsMock = vi.fn();
const usePrescriptionsStoreMock = vi.fn();

vi.mock('../../../stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => usePrescriptionsStoreMock(),
}));

vi.mock('../utils/printTemplates', () => ({
  printPrescription: vi.fn(),
}));

vi.mock('../utils/activeMedicationPrint', () => ({
  printActiveMedicationSheet: vi.fn(),
}));

vi.mock('./PrescriptionForm', () => ({
  PrescriptionForm: ({
    editingPrescription,
    duplicateSource,
  }: {
    editingPrescription?: Prescription | null;
    duplicateSource?: Prescription | null;
  }) => (
    <div>
      PrescriptionForm
      {editingPrescription ? ` editing:${editingPrescription.code}` : ''}
      {duplicateSource ? ` duplicate:${duplicateSource.code}` : ''}
    </div>
  ),
}));

vi.mock('./MedicineManager', () => ({
  MedicineManager: () => <div>MedicineManager</div>,
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
      quantity: 4,
      quantitySupplied: 4,
      administrationsPerDay: 2,
      schedule: {
        morning: true,
        noon: false,
        afternoon: false,
        evening: true,
      },
      startDate: '2026-03-31',
    },
  ],
};

const activeRows: ActiveMedicationRow[] = [
  {
    prescriptionId: 'prescription-1',
    sourcePrescriptionCode: 'DT-001',
    medicineName: 'Amlodipine',
    dosage: '1 vien',
    instructions: 'Sau an',
    timeOfDay: 'morning',
    startDate: '2026-03-31',
    status: {
      active: true,
      nearEnd: true,
      exhausted: false,
      remainingDays: 2,
      estimatedExhaustionDate: '2026-04-01',
    },
  },
];

const snapshots: PrescriptionSnapshot[] = [
  {
    id: 'snapshot-1',
    prescriptionId: 'prescription-1',
    version: 1,
    snapshotAt: '2026-03-31T09:00:00.000Z',
    actor: 'Bac si B',
    changeReason: 'adjust',
    headerPayload: {
      diagnosis: 'Tang huyet ap',
    },
    itemsPayload: [
      {
        medicine_name: 'Amlodipine',
        dosage: '1 vien',
      },
    ],
  },
];

describe('PrescriptionList', () => {
  beforeEach(() => {
    fetchPrescriptionsMock.mockReset();
    pausePrescriptionMock.mockReset();
    completePrescriptionMock.mockReset();
    fetchPrescriptionSnapshotsMock.mockReset();
    usePrescriptionsStoreMock.mockReset();
  });

  const buildStoreState = () => ({
    prescriptions: [activePrescription],
    fetchPrescriptions: fetchPrescriptionsMock,
    isLoading: false,
    pausePrescription: pausePrescriptionMock,
    completePrescription: completePrescriptionMock,
    fetchPrescriptionSnapshots: fetchPrescriptionSnapshotsMock,
    getActivePrescriptionsForResident: () => [activePrescription],
    getActiveMedicationRowsForResident: () => activeRows,
  });

  it('keeps a dedicated print-prescription action for active prescriptions', async () => {
    usePrescriptionsStoreMock.mockReturnValue(buildStoreState());

    render(<PrescriptionList user={mockUser} resident={mockResident} onUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(fetchPrescriptionsMock).toHaveBeenCalledWith('resident-1');
    });

    expect(screen.getByRole('button', { name: /in tong hop thuoc dang dung/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /in don thuoc/i })).toBeInTheDocument();
    expect(screen.getAllByText('DT-001').length).toBeGreaterThan(0);
  });

  it('keeps an adjust action for active prescriptions', async () => {
    usePrescriptionsStoreMock.mockReturnValue(buildStoreState());

    render(<PrescriptionList user={mockUser} resident={mockResident} onUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(fetchPrescriptionsMock).toHaveBeenCalledWith('resident-1');
    });

    expect(screen.getAllByRole('button', { name: /dieu chinh/i }).length).toBeGreaterThan(0);
  });

  it('shows duplicate, pause, and complete actions on active cards', async () => {
    usePrescriptionsStoreMock.mockReturnValue(buildStoreState());

    render(<PrescriptionList user={mockUser} resident={mockResident} onUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(fetchPrescriptionsMock).toHaveBeenCalledWith('resident-1');
    });

    expect(screen.getAllByRole('button', { name: /nhan ban/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /tam ngung/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /ket thuc/i }).length).toBeGreaterThan(0);
  });

  it('opens a duplicate draft instead of cloning immediately', async () => {
    usePrescriptionsStoreMock.mockReturnValue(buildStoreState());

    render(<PrescriptionList user={mockUser} resident={mockResident} onUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(fetchPrescriptionsMock).toHaveBeenCalledWith('resident-1');
    });

    fireEvent.click(screen.getAllByRole('button', { name: /^Nhan ban$/i })[0]);

    expect(screen.getByText(/duplicate:DT-001/i)).toBeInTheDocument();
  });

  it('opens history for an adjusted prescription', async () => {
    fetchPrescriptionSnapshotsMock.mockResolvedValue(snapshots);
    usePrescriptionsStoreMock.mockReturnValue(buildStoreState());

    render(<PrescriptionList user={mockUser} resident={mockResident} onUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(fetchPrescriptionsMock).toHaveBeenCalledWith('resident-1');
    });

    fireEvent.click(screen.getAllByRole('button', { name: /^Lich su dieu chinh$/i })[0]);

    await waitFor(() => {
      expect(fetchPrescriptionSnapshotsMock).toHaveBeenCalledWith('prescription-1');
    });

    expect(screen.getByText(/phien ban 1/i)).toBeInTheDocument();
  });
});
