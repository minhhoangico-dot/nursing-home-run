import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { ResidentFinanceTab } from './ResidentFinanceTab';
import type { Medicine, Prescription, Resident, ResidentFixedServiceAssignment, ServicePrice } from '@/src/types';

let prescriptionState: { prescriptions: Prescription[]; medicines: Medicine[] } = {
  prescriptions: [],
  medicines: [],
};

vi.mock('@/src/stores/prescriptionStore', () => ({
  usePrescriptionsStore: () => prescriptionState,
}));

const residentFixture: Resident = {
  id: 'RES-1',
  clinicCode: 'HS001',
  name: 'Nguyen Van A',
  dob: '1950-01-01',
  gender: 'Nam',
  room: '101',
  bed: 'A',
  floor: '1',
  building: 'A',
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

const servicePricesFixture: ServicePrice[] = [
  {
    id: 'SVC-1',
    name: 'Vat ly tri lieu',
    category: 'OTHER',
    price: 250000,
    unit: 'Lan',
    billingType: 'ONE_OFF',
  },
];

const fixedServicePricesFixture: ServicePrice[] = [
  {
    id: 'ROOM_2',
    name: 'Phong 2 nguoi',
    category: 'ROOM',
    price: 4500000,
    unit: 'Thang',
    billingType: 'FIXED',
  },
  {
    id: 'ROOM_1',
    name: 'Phong 1 nguoi',
    category: 'ROOM',
    price: 6000000,
    unit: 'Thang',
    billingType: 'FIXED',
  },
  {
    id: 'CARE_2',
    name: 'Cham soc cap 2',
    category: 'CARE',
    price: 3000000,
    unit: 'Thang',
    billingType: 'FIXED',
  },
  {
    id: 'MEAL_1',
    name: 'An tai nha an',
    category: 'MEAL',
    price: 1400000,
    unit: 'Thang',
    billingType: 'FIXED',
  },
  ...servicePricesFixture,
];

const fixedAssignmentsFixture: ResidentFixedServiceAssignment[] = [
  {
    id: 'RFS-ROOM',
    residentId: 'RES-1',
    serviceId: 'ROOM_2',
    serviceName: 'Phong 2 nguoi',
    category: 'ROOM',
    unitPrice: 4500000,
    quantity: 1,
    totalAmount: 4500000,
    effectiveFrom: '2026-04-30',
    status: 'Active',
  },
  {
    id: 'RFS-CARE',
    residentId: 'RES-1',
    serviceId: 'CARE_2',
    serviceName: 'Cham soc cap 2',
    category: 'CARE',
    unitPrice: 3000000,
    quantity: 1,
    totalAmount: 3000000,
    effectiveFrom: '2026-04-30',
    status: 'Active',
  },
  {
    id: 'RFS-MEAL',
    residentId: 'RES-1',
    serviceId: 'MEAL_1',
    serviceName: 'An tai nha an',
    category: 'MEAL',
    unitPrice: 1400000,
    quantity: 1,
    totalAmount: 1400000,
    effectiveFrom: '2026-04-30',
    status: 'Active',
  },
];

describe('ResidentFinanceTab', () => {
  beforeEach(() => {
    prescriptionState = {
      prescriptions: [],
      medicines: [],
    };
  });

  it('disables the quick-add finance control in read-only mode', () => {
    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={servicePricesFixture}
          usageRecords={[]}
          fixedServices={[]}
          readOnly={true}
          onRecordUsage={() => {}}
          onReplaceFixedServices={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('resident-finance-quick-add')).toBeDisabled();
  });

  it('renders calculated medication billing rows with provisional state', () => {
    prescriptionState = {
      prescriptions: [
        {
          id: 'rx-1',
          code: 'DT-001',
          residentId: 'RES-1',
          doctorId: 'doctor-1',
          doctorName: 'BS A',
          diagnosis: 'Theo doi',
          prescriptionDate: '2026-04-01',
          startDate: new Date().toISOString().slice(0, 10),
          status: 'Active',
          items: [
            {
              id: 'item-1',
              prescriptionId: 'rx-1',
              medicineId: 'med-1',
              medicineName: 'Metformin',
              dosage: '1 vien',
              frequency: '2 lan/ngay',
              timesOfDay: ['Sang', 'Toi'],
              quantityDispensed: 60,
            },
            {
              id: 'item-2',
              prescriptionId: 'rx-1',
              medicineId: 'missing-price',
              medicineName: 'No price medicine',
              dosage: '1 vien',
              frequency: '1 lan/ngay',
              timesOfDay: ['Sang'],
              quantityDispensed: 10,
            },
          ],
        },
      ],
      medicines: [
        {
          id: 'med-1',
          name: 'Metformin',
          unit: 'vien',
          price: 1500,
        },
      ],
    };

    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={servicePricesFixture}
          usageRecords={[]}
          fixedServices={[]}
          onRecordUsage={() => {}}
          onReplaceFixedServices={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Metformin')).toBeInTheDocument();
    expect(screen.getAllByText(/90.000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tạm tính/i).length).toBeGreaterThan(0);
  });

  it('records quick-add service usage with a traceable description', () => {
    const onRecordUsage = vi.fn();

    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={servicePricesFixture}
          usageRecords={[]}
          fixedServices={[]}
          onRecordUsage={onRecordUsage}
          onReplaceFixedServices={() => {}}
        />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('resident-finance-quick-add'), { target: { value: 'SVC-1' } });

    expect(onRecordUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceId: 'SVC-1',
        description: expect.stringContaining('Quick-add from resident finance tab'),
      }),
    );
  });

  it('renders assigned fixed services instead of estimated rows', () => {
    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={fixedServicePricesFixture}
          usageRecords={[]}
          fixedServices={fixedAssignmentsFixture}
          onRecordUsage={() => {}}
          onReplaceFixedServices={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Phong 2 nguoi')).toBeInTheDocument();
    expect(screen.getByText('Cham soc cap 2')).toBeInTheDocument();
    expect(screen.getByText('An tai nha an')).toBeInTheDocument();
    expect(screen.queryByText(/Gia tam tinh/i)).not.toBeInTheDocument();
  });

  it('prevents removing the last required fixed service category', async () => {
    const user = userEvent.setup();
    const onReplaceFixedServices = vi.fn();

    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={fixedServicePricesFixture}
          usageRecords={[]}
          fixedServices={fixedAssignmentsFixture}
          onRecordUsage={() => {}}
          onReplaceFixedServices={onReplaceFixedServices}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText('remove-fixed-service-ROOM_2'));

    expect(onReplaceFixedServices).not.toHaveBeenCalled();
    expect(screen.getByText(/Không thể xóa dịch vụ bắt buộc/i)).toBeInTheDocument();
  });

  it('replaces a fixed service with a catalog snapshot', async () => {
    const user = userEvent.setup();
    const onReplaceFixedServices = vi.fn();

    render(
      <MemoryRouter>
        <ResidentFinanceTab
          resident={residentFixture}
          servicePrices={fixedServicePricesFixture}
          usageRecords={[]}
          fixedServices={fixedAssignmentsFixture}
          onRecordUsage={() => {}}
          onReplaceFixedServices={onReplaceFixedServices}
        />
      </MemoryRouter>,
    );

    await user.selectOptions(screen.getByLabelText('fixed-service-select-ROOM'), 'ROOM_1');

    expect(onReplaceFixedServices).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          serviceId: 'ROOM_1',
          serviceName: 'Phong 1 nguoi',
          unitPrice: 6000000,
          totalAmount: 6000000,
        }),
      ]),
    );
  });
});
