import { describe, expect, it } from 'vitest';

import type { ResidentFixedServiceAssignment, ServicePrice } from '@/src/types';
import {
  calculateFixedServiceTotal,
  createFixedServiceAssignment,
  getMissingRequiredFixedCategories,
  suggestDefaultFixedServices,
} from './fixedServiceAssignments';

const catalogFixture: ServicePrice[] = [
  {
    id: 'ROOM_2',
    name: 'Phong 2 nguoi',
    category: 'ROOM',
    price: 4_500_000,
    unit: 'Thang',
    billingType: 'FIXED',
    code: '2-bed',
  },
  {
    id: 'CARE_2_2-bed',
    name: 'Cham soc cap 2 (Phong 2 nguoi)',
    category: 'CARE',
    price: 3_000_000,
    unit: 'Thang',
    billingType: 'FIXED',
    code: 'CL2_2-bed',
  },
  {
    id: 'MEAL_1',
    name: 'An tai nha an',
    category: 'MEAL',
    price: 1_400_000,
    unit: 'Thang',
    billingType: 'FIXED',
    code: 'standard',
  },
  {
    id: 'SVC_1',
    name: 'Cham soc vet thuong',
    category: 'CARE',
    price: 2_000_000,
    unit: 'Thang',
    billingType: 'FIXED',
  },
];

const assignmentsFixture: ResidentFixedServiceAssignment[] = [
  {
    id: 'RFS-ROOM',
    residentId: 'RES-1',
    serviceId: 'ROOM_2',
    serviceName: 'Phong 2 nguoi',
    category: 'ROOM',
    unitPrice: 4_500_000,
    quantity: 1,
    totalAmount: 4_500_000,
    effectiveFrom: '2026-04-30',
    status: 'Active',
  },
  {
    id: 'RFS-CARE',
    residentId: 'RES-1',
    serviceId: 'CARE_2_2-bed',
    serviceName: 'Cham soc cap 2',
    category: 'CARE',
    unitPrice: 3_000_000,
    quantity: 1,
    totalAmount: 3_000_000,
    effectiveFrom: '2026-04-30',
    status: 'Active',
  },
  {
    id: 'RFS-MEAL',
    residentId: 'RES-1',
    serviceId: 'MEAL_1',
    serviceName: 'An tai nha an',
    category: 'MEAL',
    unitPrice: 1_400_000,
    quantity: 1,
    totalAmount: 1_400_000,
    effectiveFrom: '2026-04-30',
    status: 'Active',
  },
  {
    id: 'RFS-INACTIVE',
    residentId: 'RES-1',
    serviceId: 'SVC_1',
    serviceName: 'Inactive optional',
    category: 'CARE',
    unitPrice: 999_000,
    quantity: 1,
    totalAmount: 999_000,
    effectiveFrom: '2026-04-30',
    status: 'Inactive',
  },
];

describe('fixed service assignments', () => {
  it('snapshots catalog price and name into an assignment', () => {
    const assignment = createFixedServiceAssignment({
      residentId: 'RES-1',
      service: catalogFixture[0],
      effectiveFrom: '2026-04-30',
    });

    expect(assignment).toMatchObject({
      residentId: 'RES-1',
      serviceId: 'ROOM_2',
      serviceName: 'Phong 2 nguoi',
      category: 'ROOM',
      unitPrice: 4_500_000,
      quantity: 1,
      totalAmount: 4_500_000,
      effectiveFrom: '2026-04-30',
      status: 'Active',
    });
  });

  it('reports missing required fixed categories', () => {
    expect(getMissingRequiredFixedCategories([])).toEqual(['ROOM', 'MEAL', 'CARE']);
    expect(getMissingRequiredFixedCategories(assignmentsFixture)).toEqual([]);
  });

  it('suggests room, care, and standard meal defaults from resident data', () => {
    const suggestions = suggestDefaultFixedServices({
      residentId: 'RES-1',
      roomType: '2 Giuong',
      careLevel: 2,
      servicePrices: catalogFixture,
      effectiveFrom: '2026-04-30',
    });

    expect(suggestions.map((item) => item.category).sort()).toEqual(['CARE', 'MEAL', 'ROOM']);
    expect(suggestions.map((item) => item.serviceId)).toEqual(['ROOM_2', 'CARE_2_2-bed', 'MEAL_1']);
  });

  it('sums active fixed assignments only', () => {
    expect(calculateFixedServiceTotal(assignmentsFixture)).toBe(8_900_000);
  });
});
