import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrescriptionForm } from './PrescriptionForm';

const storeState = {
  medicines: [
    {
      id: 'med-1',
      name: 'Desloratadine (Aerius 0.5mg/ml)',
    },
    {
      id: 'med-2',
      name: 'Amlodipine (Norvasc 5mg)',
    },
  ],
  fetchMedicines: vi.fn(),
  createPrescription: vi.fn(),
};

vi.mock('../../../stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => storeState,
}));

describe('PrescriptionForm', () => {
  beforeEach(() => {
    storeState.fetchMedicines.mockReset();
    storeState.createPrescription.mockReset();
    storeState.createPrescription.mockResolvedValue(undefined);
  });

  it('snapshots the selected catalog medicine id and canonical name when saving', async () => {
    render(
      <PrescriptionForm
        user={{ id: 'doctor-1', name: 'Dr. Test', role: 'DOCTOR' } as any}
        resident={{ id: 'resident-1', name: 'Resident A', room: '101', careLevel: 'A' } as any}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/tăng huyết áp/i), {
      target: { value: 'Cảm cúm' },
    });
    fireEvent.change(screen.getByPlaceholderText(/tìm tên thuốc/i), {
      target: { value: 'Desloratadine (Aerius 0.5mg/ml)' },
    });
    fireEvent.change(screen.getByPlaceholderText(/1 viên/i), {
      target: { value: '1 viên' },
    });

    fireEvent.click(screen.getByRole('button', { name: /lưu đơn thuốc/i }));

    await waitFor(() => {
      expect(storeState.createPrescription).toHaveBeenCalledTimes(1);
    });

    expect(storeState.createPrescription).toHaveBeenCalledWith(
      expect.objectContaining({
        residentId: 'resident-1',
        doctorId: 'doctor-1',
        diagnosis: 'Cảm cúm',
      }),
      [
        expect.objectContaining({
          medicineId: 'med-1',
          medicineName: 'Desloratadine (Aerius 0.5mg/ml)',
          dosage: '1 viên',
        }),
      ],
    );
  });

  it('requires the medicine field to be cleared before replacing a catalog selection', () => {
    render(
      <PrescriptionForm
        user={{ id: 'doctor-1', name: 'Dr. Test', role: 'DOCTOR' } as any}
        resident={{ id: 'resident-1', name: 'Resident A', room: '101', careLevel: 'A' } as any}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    const medicineInput = screen.getByPlaceholderText(/tìm tên thuốc/i);

    fireEvent.change(medicineInput, {
      target: { value: 'Desloratadine (Aerius 0.5mg/ml)' },
    });
    expect(medicineInput).toHaveValue('Desloratadine (Aerius 0.5mg/ml)');

    fireEvent.change(medicineInput, {
      target: { value: 'Amlodipine (Norvasc 5mg)' },
    });
    expect(medicineInput).toHaveValue('Desloratadine (Aerius 0.5mg/ml)');

    fireEvent.change(medicineInput, {
      target: { value: '' },
    });
    expect(medicineInput).toHaveValue('');

    fireEvent.change(medicineInput, {
      target: { value: 'Amlodipine (Norvasc 5mg)' },
    });
    expect(medicineInput).toHaveValue('Amlodipine (Norvasc 5mg)');
  });
});
