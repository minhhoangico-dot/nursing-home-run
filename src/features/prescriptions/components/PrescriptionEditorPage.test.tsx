import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { PrescriptionEditorPage } from '../pages/PrescriptionEditorPage';
import { useAuthStore } from '@/src/stores/authStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { usePrescriptionsStore } from '@/src/stores/prescriptionStore';
import type { Resident } from '@/src/types';

describe('PrescriptionEditorPage', () => {
  beforeEach(() => {
    const residentDetail: Resident = {
      id: 'R1',
      clinicCode: 'NCT-001',
      name: 'Lê Thị Lan',
      dob: '1950-01-01',
      gender: 'Nữ',
      room: '202',
      bed: 'A',
      floor: '2',
      building: 'A',
      careLevel: 2,
      status: 'Active',
      admissionDate: '2026-01-01',
      guardianName: 'Nguyễn Văn B',
      guardianPhone: '0900000000',
      balance: 0,
      currentConditionNote: '',
      lastMedicalUpdate: '2026-03-30',
      roomType: '2 Giường',
      dietType: 'Normal',
      isDiabetic: false,
      assessments: [],
      prescriptions: [],
      medicalVisits: [],
      specialMonitoring: [],
      medicalHistory: [],
      allergies: [],
      careLogs: [],
    };

    useAuthStore.setState({
      user: {
        id: 'u1',
        name: 'BS A',
        username: 'doctor-a',
        role: 'DOCTOR',
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      users: [],
      login: vi.fn(),
      logout: vi.fn(),
      fetchUsers: vi.fn(),
    });

    useResidentsStore.setState({
      residents: [residentDetail],
      residentDetails: {
        R1: residentDetail,
      },
      selectedResident: null,
      isLoading: false,
      isSyncing: false,
      error: null,
      fetchResidents: vi.fn(),
      fetchResidentDetail: vi.fn().mockResolvedValue(residentDetail),
      addResident: vi.fn(),
      updateResident: vi.fn(),
      deleteResident: vi.fn(),
      selectResident: vi.fn(),
    });

    usePrescriptionsStore.setState({
      prescriptions: [],
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
      fetchMedicines: vi.fn().mockResolvedValue(undefined),
      createMedicine: vi.fn().mockResolvedValue(undefined),
      updateMedicine: vi.fn().mockResolvedValue(undefined),
      deleteMedicine: vi.fn().mockResolvedValue(undefined),
    });
  });

  test('renders a full-page prescription editor with resident context and medication rows', () => {
    render(
      <MemoryRouter initialEntries={['/residents/R1/medications/new']}>
        <Routes>
          <Route
            path="/residents/:residentId/medications/new"
            element={<PrescriptionEditorPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Kê đơn thuốc/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Thêm dòng thuốc/i }),
    ).toBeInTheDocument();
  });

  test('duplicate mode prompts to end, pause, or keep the previous prescription active on save', async () => {
    const user = userEvent.setup();
    const createPrescription = vi.fn().mockResolvedValue(undefined);

    usePrescriptionsStore.setState({
      ...usePrescriptionsStore.getState(),
      createPrescription,
      prescriptions: [
        {
          id: 'rx-1',
          code: 'DT-20260329-658',
          residentId: 'R1',
          residentName: 'Lê Thị Lan',
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
              dosePerTime: 1,
              doseUnit: 'viên',
              timesPerDay: 1,
              quantityDispensed: 30,
              quantity: 30,
              daysSupply: 30,
              startDate: '2026-03-29',
              endDate: '2026-04-27',
              isContinuous: false,
              instructions: 'Uống sau ăn tối',
              specialInstructions: '',
            },
          ],
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/residents/R1/medications/rx-1/duplicate']}>
        <Routes>
          <Route
            path="/residents/:residentId/medications/:prescriptionId/duplicate"
            element={<PrescriptionEditorPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /Lưu đơn thuốc/i }));

    expect(createPrescription).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole('button', { name: /Kết thúc đơn cũ/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Tạm ngưng đơn cũ/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Giữ cả hai đơn đang dùng/i }),
    ).toBeInTheDocument();
  });
});
