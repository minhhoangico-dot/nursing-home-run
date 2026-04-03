import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrescriptionForm } from './PrescriptionForm';

const defaultMedicines = [
  {
    id: 'med-1',
    name: 'Desloratadine (Aerius 0.5mg/ml)',
  },
  {
    id: 'med-2',
    name: 'Amlodipine (Norvasc 5mg)',
  },
];

const storeState = {
  medicines: defaultMedicines,
  fetchMedicines: vi.fn(),
  createPrescription: vi.fn(),
};

vi.mock('../../../stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => storeState,
}));

const renderForm = () =>
  render(
    <PrescriptionForm
      user={{ id: 'doctor-1', name: 'Dr. Test', role: 'DOCTOR' } as any}
      resident={{ id: 'resident-1', name: 'Resident A', room: '101', careLevel: 'A' } as any}
      onClose={vi.fn()}
      onSave={vi.fn()}
    />,
  );

const getDiagnosisInput = () => screen.getAllByRole('textbox')[0];
const getMedicineInput = () => screen.getByRole('combobox');
const getDosageInput = () => screen.getByPlaceholderText(/1 vi/i);
const getSaveButton = () => {
  const buttons = screen.getAllByRole('button');
  return buttons[buttons.length - 1];
};

describe('PrescriptionForm', () => {
  beforeEach(() => {
    storeState.medicines = [...defaultMedicines];
    storeState.fetchMedicines.mockReset();
    storeState.fetchMedicines.mockResolvedValue(undefined);
    storeState.createPrescription.mockReset();
    storeState.createPrescription.mockResolvedValue(undefined);
  });

  it('snapshots the selected catalog medicine id and canonical name when saving', async () => {
    renderForm();

    fireEvent.change(getDiagnosisInput(), {
      target: { value: 'Cam cum' },
    });
    fireEvent.change(getMedicineInput(), {
      target: { value: 'Desloratadine (Aerius 0.5mg/ml)' },
    });
    fireEvent.change(getDosageInput(), {
      target: { value: '1 vien' },
    });

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(storeState.createPrescription).toHaveBeenCalledTimes(1);
    });

    expect(storeState.createPrescription).toHaveBeenCalledWith(
      expect.objectContaining({
        residentId: 'resident-1',
        doctorId: 'doctor-1',
        diagnosis: 'Cam cum',
      }),
      [
        expect.objectContaining({
          medicineId: 'med-1',
          medicineName: 'Desloratadine (Aerius 0.5mg/ml)',
          dosage: '1 vien',
        }),
      ],
    );
  });

  it('requires the medicine field to be cleared before replacing a catalog selection', () => {
    renderForm();

    const medicineInput = getMedicineInput();

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

  it('reconciles a typed catalog name into a bound medicine after medicines finish loading', async () => {
    storeState.medicines = [];
    let resolveFetch: (() => void) | undefined;
    storeState.fetchMedicines.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const view = renderForm();

    fireEvent.change(getDiagnosisInput(), {
      target: { value: 'Cam cum' },
    });
    fireEvent.change(getMedicineInput(), {
      target: { value: 'Desloratadine (Aerius 0.5mg/ml)' },
    });
    fireEvent.change(getDosageInput(), {
      target: { value: '1 vien' },
    });

    storeState.medicines = [
      {
        id: 'med-1',
        name: 'Desloratadine (Aerius 0.5mg/ml)',
      },
    ];

    view.rerender(
      <PrescriptionForm
        user={{ id: 'doctor-1', name: 'Dr. Test', role: 'DOCTOR' } as any}
        resident={{ id: 'resident-1', name: 'Resident A', room: '101', careLevel: 'A' } as any}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(getSaveButton()).toBeDisabled();

    await act(async () => {
      resolveFetch?.();
    });

    await waitFor(() => {
      expect(getSaveButton()).not.toBeDisabled();
    });

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(storeState.createPrescription).toHaveBeenCalledWith(
        expect.any(Object),
        [
          expect.objectContaining({
            medicineId: 'med-1',
            medicineName: 'Desloratadine (Aerius 0.5mg/ml)',
          }),
        ],
      );
    });
  });

  it('keeps submit disabled until the catalog fetch is ready to bind medicines', async () => {
    storeState.medicines = [];
    let resolveFetch: (() => void) | undefined;
    storeState.fetchMedicines.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    renderForm();

    expect(getSaveButton()).toBeDisabled();

    await act(async () => {
      resolveFetch?.();
    });

    await waitFor(() => {
      expect(getSaveButton()).not.toBeDisabled();
    });
  });

  it('does not save an ambiguous or unbound medicine name', async () => {
    storeState.medicines = [
      {
        id: 'med-1',
        name: 'Paracetamol',
      },
      {
        id: 'med-2',
        name: 'Paracetamol',
      },
    ];

    renderForm();

    fireEvent.change(getDiagnosisInput(), {
      target: { value: 'Sot' },
    });
    fireEvent.change(getMedicineInput(), {
      target: { value: 'Paracetamol' },
    });
    fireEvent.change(getDosageInput(), {
      target: { value: '1 vien' },
    });

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(storeState.createPrescription).not.toHaveBeenCalled();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng chọn thuốc từ danh mục nội bộ');
  });

  it('shows matched catalog suggestions while typing a partial medicine query', () => {
    renderForm();

    const medicineInput = getMedicineInput();
    fireEvent.focus(medicineInput);
    fireEvent.change(medicineInput, {
      target: { value: 'Aerius' },
    });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: /Desloratadine \(Aerius 0\.5mg\/ml\)/,
      }),
    ).toBeInTheDocument();
  });
});
