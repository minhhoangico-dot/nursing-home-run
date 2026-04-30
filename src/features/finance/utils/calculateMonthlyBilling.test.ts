import { describe, expect, it } from 'vitest';

import type { ResidentFixedServiceAssignment, ResidentListItem } from '@/src/types';
import { calculateFixedCosts } from './calculateMonthlyBilling';

const residentFixture: ResidentListItem = {
  id: 'RES-1',
  clinicCode: 'NCT-001',
  name: 'Nguyen Van A',
  dob: '1950-01-01',
  gender: 'Nam',
  room: '101',
  bed: 'A',
  floor: 'Tang 1',
  building: 'Toa A',
  careLevel: 2,
  status: 'Active',
  admissionDate: '2026-04-01',
  guardianName: 'Nguyen Van B',
  guardianPhone: '0900000000',
  balance: 0,
  currentConditionNote: '',
  lastMedicalUpdate: '2026-04-01',
  roomType: '2 Giường',
  dietType: 'Normal',
  isDiabetic: false,
};

const assignmentsFixture: ResidentFixedServiceAssignment[] = [
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
  {
    id: 'RFS-OTHER',
    residentId: 'RES-2',
    serviceId: 'ROOM_1',
    serviceName: 'Other resident room',
    category: 'ROOM',
    unitPrice: 6000000,
    quantity: 1,
    totalAmount: 6000000,
    effectiveFrom: '2026-04-30',
    status: 'Active',
  },
];

describe('calculateFixedCosts', () => {
  it('calculates fixed costs from resident fixed assignments', () => {
    const result = calculateFixedCosts(residentFixture, assignmentsFixture);

    expect(result.total).toBe(8900000);
    expect(result.details.map((row) => row.name)).toEqual([
      'Phong 2 nguoi',
      'Cham soc cap 2',
      'An tai nha an',
    ]);
    expect(result.missingRequiredCategories).toEqual([]);
  });

  it('does not fall back to INITIAL_PRICES when assignments are missing', () => {
    const result = calculateFixedCosts(residentFixture, []);

    expect(result.total).toBe(0);
    expect(result.details).toEqual([]);
    expect(result.missingRequiredCategories).toEqual(['ROOM', 'MEAL', 'CARE']);
  });
});
