import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { PrescriptionList } from './PrescriptionList';
import { usePrescriptionsStore } from '@/src/stores/prescriptionStore';

describe('PrescriptionList workspace', () => {
  beforeEach(() => {
    usePrescriptionsStore.setState({
      prescriptions: [
        {
          id: 'rx-1',
          code: 'DT-20260329-658',
          residentId: 'r1',
          doctorId: 'u1',
          doctorName: 'BS A',
          diagnosis: 'Rối loạn mỡ máu',
          prescriptionDate: '2026-03-29',
          startDate: '2026-03-29',
          endDate: '2026-04-27',
          status: 'Active',
          notes: 'Theo dõi men gan',
          items: [
            {
              id: 'item-1',
              prescriptionId: 'rx-1',
              medicineName: 'Rosuvastatin',
              dosage: '1 viên',
              frequency: '1 lần/ngày',
              timesOfDay: ['Tối'],
              quantity: 30,
              quantityDispensed: 30,
              daysSupply: 30,
              startDate: '2026-03-29',
              endDate: '2026-04-27',
              isContinuous: false,
              instructions: 'Uống sau ăn tối',
            },
          ],
        },
        {
          id: 'rx-0',
          code: 'DT-20260301-111',
          residentId: 'r1',
          doctorId: 'u1',
          doctorName: 'BS A',
          diagnosis: 'Theo dõi trước đó',
          prescriptionDate: '2026-03-01',
          startDate: '2026-03-01',
          endDate: '2026-03-10',
          status: 'Completed',
          notes: '',
          items: [],
        },
      ],
      medicines: [],
      isLoading: false,
      error: null,
      fetchPrescriptions: vi.fn().mockResolvedValue(undefined),
      createPrescription: vi.fn().mockResolvedValue(undefined),
      updatePrescription: vi.fn().mockResolvedValue(undefined),
      duplicatePrescription: vi.fn().mockResolvedValue(null),
      pausePrescription: vi.fn().mockResolvedValue(undefined),
      cancelPrescription: vi.fn().mockResolvedValue(undefined),
      completePrescription: vi.fn().mockResolvedValue(undefined),
      getResidentActiveMedicationRows: vi.fn().mockReturnValue([
        {
          sourcePrescriptionId: 'rx-1',
          sourcePrescriptionCode: 'DT-20260329-658',
          sourcePrescriptionStartDate: '2026-03-29',
          sourcePrescriptionEndDate: '2026-04-27',
          sourcePrescriptionStatus: 'Active',
          sourcePrescriptionLabel: 'DT-20260329-658 • 29/03/2026',
          medicineName: 'Rosuvastatin',
          dosage: '1 viên',
          frequency: '1 lần/ngày',
          note: 'Uống sau ăn tối',
          quantity: 30,
          morning: '',
          noon: '',
          afternoon: '',
          night: '1 viên',
          timeSlots: ['night'],
          isNearingEndDate: true,
          isContinuous: false,
        },
      ]),
      fetchMedicines: vi.fn().mockResolvedValue(undefined),
      createMedicine: vi.fn().mockResolvedValue(undefined),
      updateMedicine: vi.fn().mockResolvedValue(undefined),
      deleteMedicine: vi.fn().mockResolvedValue(undefined),
    });
  });

  test('renders the active medication summary above prescription cards', () => {
    render(
      <MemoryRouter>
        <PrescriptionList
          user={{ id: 'u1', name: 'BS A', username: 'doctor-a', role: 'DOCTOR' } as any}
          resident={{ id: 'r1', name: 'Lan', room: '202', bed: 'A', floor: '2', building: 'A' } as any}
          onUpdate={() => {}}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /^Thuốc đang dùng$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kê đơn mới/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /In tổng hợp thuốc đang dùng/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Lịch sử đơn thuốc/i)).toBeInTheDocument();
  });
});
