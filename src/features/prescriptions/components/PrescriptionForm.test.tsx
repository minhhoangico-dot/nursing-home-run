// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Prescription, Resident, User } from '../../../types';

const createPrescriptionMock = vi.fn();
const updatePrescriptionMock = vi.fn();
const fetchMedicinesMock = vi.fn();
const usePrescriptionsStoreMock = vi.fn();

vi.mock('../../../stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => usePrescriptionsStoreMock(),
}));

vi.mock('./DrugMasterDialog', () => ({
  DrugMasterDialog: ({ open, onSelect }: { open: boolean; onSelect: (medicine: { id: string; name: string }) => void }) =>
    open ? (
      <button type="button" onClick={() => onSelect({ id: 'medicine-1', name: 'Rosuvastatin' })}>
        Chon thuoc mau
      </button>
    ) : null,
}));

import { PrescriptionForm } from './PrescriptionForm';

const mockUser: User = {
  id: 'doctor-1',
  name: 'Bac si B',
  username: 'doctor',
  password: 'password',
  role: 'DOCTOR',
};

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

const duplicateSource: Prescription = {
  id: 'prescription-1',
  code: 'DT-001',
  residentId: 'resident-1',
  doctorId: 'doctor-1',
  doctorName: 'Bac si B',
  diagnosis: 'Tang huyet ap',
  prescriptionDate: '2026-03-31',
  startDate: '2026-03-31',
  endDate: '2026-04-05',
  status: 'Active',
  notes: 'Theo doi',
  items: [
    {
      id: 'item-1',
      prescriptionId: 'prescription-1',
      medicineId: 'medicine-1',
      medicineName: 'Rosuvastatin',
      dosage: '1 vien',
      frequency: '2 lan/ngay',
      timesOfDay: ['Sang', 'Toi'],
      startDate: '2026-03-31',
      endDate: '2026-04-05',
      continuous: false,
      quantity: 10,
      quantitySupplied: 10,
      administrationsPerDay: 2,
      schedule: {
        morning: true,
        noon: false,
        afternoon: false,
        evening: true,
      },
    },
  ],
};

describe('PrescriptionForm', () => {
  beforeEach(() => {
    createPrescriptionMock.mockReset();
    updatePrescriptionMock.mockReset();
    fetchMedicinesMock.mockReset();
    usePrescriptionsStoreMock.mockReturnValue({
      createPrescription: createPrescriptionMock,
      updatePrescription: updatePrescriptionMock,
      medicines: [
        {
          id: 'medicine-1',
          name: 'Rosuvastatin',
          activeIngredient: 'Rosuvastatin',
          unit: 'Vien',
        },
      ],
      fetchMedicines: fetchMedicinesMock,
    });
  });

  it('shows full item fields for each medication row', async () => {
    render(
      <PrescriptionForm
        user={mockUser}
        resident={mockResident}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(fetchMedicinesMock).toHaveBeenCalled();
    });

    expect(screen.getByLabelText(/ngay bat dau/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ngay ket thuc/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dung lien tuc/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/so luong cap/i)).toBeInTheDocument();
  });

  it('prefills from a duplicate source prescription', async () => {
    render(
      <PrescriptionForm
        user={mockUser}
        resident={mockResident}
        duplicateSource={duplicateSource}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Rosuvastatin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tang huyet ap')).toBeInTheDocument();
  });

  it('derives administrations per day from selected schedule on save', async () => {
    render(
      <PrescriptionForm
        user={mockUser}
        resident={mockResident}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    fireEvent.change(screen.getAllByLabelText(/chan doan/i)[0], { target: { value: 'Tang huyet ap' } });
    fireEvent.change(screen.getAllByLabelText(/ten thuoc/i)[0], { target: { value: 'Rosuvastatin' } });
    fireEvent.change(screen.getAllByLabelText(/lieu dung/i)[0], { target: { value: '1 vien' } });
    fireEvent.click(screen.getAllByLabelText(/^sang$/i)[0]);
    fireEvent.click(screen.getAllByLabelText(/^toi$/i)[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /luu don|luu don thuoc/i })[0]);

    await waitFor(() => {
      expect(createPrescriptionMock).toHaveBeenCalled();
    });

    expect(createPrescriptionMock.mock.calls[0][1]).toEqual([
      expect.objectContaining({
        administrationsPerDay: 2,
      }),
    ]);
  });
});
