import { beforeEach, describe, expect, it, vi } from 'vitest';

import { financeService } from './financeService';
import { supabase } from '../lib/supabase';
import type { ResidentFixedServiceAssignment } from '../types';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const emptyResult = { data: [], error: null };

const createSelectBuilder = (result = emptyResult) => ({
  select: vi.fn(() => Promise.resolve(result)),
});

const createAdditionalServicesSelectBuilder = (rows: unknown[]) => {
  const eq = vi.fn(() => Promise.resolve({ data: rows, error: null }));
  const select = vi.fn(() => ({ eq }));

  return { select, eq };
};

describe('financeService pricing catalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps monthly additional services as fixed monthly services', async () => {
    const additionalServicesBuilder = createAdditionalServicesSelectBuilder([
      {
        id: 12,
        code: 'SVC012',
        service_name_vi: 'Giat do thang',
        unit_vi: 'Tháng',
        price: 120000,
        category: 'other',
      },
      {
        id: 13,
        code: 'SVC013',
        service_name_vi: 'Cham soc phat sinh',
        unit_vi: 'Lần',
        price: 50000,
        category: 'other',
      },
    ]);

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'additional_services') {
        return additionalServicesBuilder as never;
      }

      return createSelectBuilder() as never;
    });

    const prices = await financeService.getPrices();

    expect(additionalServicesBuilder.eq).toHaveBeenCalledWith('is_active', true);
    expect(prices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'SVC_SVC012',
          billingType: 'FIXED',
          unit: 'Tháng',
        }),
        expect.objectContaining({
          id: 'SVC_SVC013',
          billingType: 'ONE_OFF',
          unit: 'Lần',
        }),
      ]),
    );
  });

  it('upserts new catalog services into additional_services', async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: null }));

    vi.mocked(supabase.from).mockReturnValue({ upsert } as never);

    await financeService.upsertPrice({
      id: 'SVC-1234567890',
      name: 'Giat do thang',
      category: 'OTHER',
      price: 120000,
      unit: 'Tháng',
      billingType: 'FIXED',
    });

    expect(supabase.from).toHaveBeenCalledWith('additional_services');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'SVC-1234567890',
        service_name: 'Giat do thang',
        service_name_vi: 'Giat do thang',
        unit: 'month',
        unit_vi: 'Tháng',
        price: 120000,
        category: 'other',
        is_active: true,
        updated_at: expect.any(String),
      }),
      { onConflict: 'code' },
    );
  });

  it('soft-deletes custom catalog services from additional_services', async () => {
    const eq = vi.fn(() => Promise.resolve({ error: null }));
    const update = vi.fn(() => ({ eq }));

    vi.mocked(supabase.from).mockReturnValue({ update } as never);

    await financeService.deletePrice('SVC_SVC012');

    expect(supabase.from).toHaveBeenCalledWith('additional_services');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        is_active: false,
        updated_at: expect.any(String),
      }),
    );
    expect(eq).toHaveBeenCalledWith('code', 'SVC012');
  });

  it('maps resident fixed services from Supabase rows', async () => {
    const order = vi.fn(() => Promise.resolve({
      data: [
        {
          id: 'RFS-1',
          resident_id: 'RES-1',
          service_id: 'ROOM_2',
          service_name: 'Phong 2 nguoi',
          category: 'ROOM',
          unit_price: '4500000',
          quantity: '1',
          total_amount: '4500000',
          effective_from: '2026-04-30',
          status: 'Active',
        },
      ],
      error: null,
    }));
    const select = vi.fn(() => ({ order }));

    vi.mocked(supabase.from).mockReturnValue({ select } as never);

    const assignments = await financeService.getResidentFixedServices();

    expect(supabase.from).toHaveBeenCalledWith('resident_fixed_services');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('resident_id', { ascending: true });
    expect(assignments).toEqual([
      {
        id: 'RFS-1',
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
    ]);
  });

  it('replaces resident fixed services with snapshot rows', async () => {
    const eq = vi.fn(() => Promise.resolve({ error: null }));
    const deleteFn = vi.fn(() => ({ eq }));
    const upsert = vi.fn(() => Promise.resolve({ error: null }));
    const assignmentRows: ResidentFixedServiceAssignment[] = [
      {
        id: 'RFS-1',
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
    ];

    vi.mocked(supabase.from).mockReturnValue({ delete: deleteFn, upsert } as never);

    await financeService.replaceResidentFixedServices('RES-1', assignmentRows);

    expect(supabase.from).toHaveBeenCalledWith('resident_fixed_services');
    expect(deleteFn).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('resident_id', 'RES-1');
    expect(upsert).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'RFS-1',
        resident_id: 'RES-1',
        service_id: 'ROOM_2',
        service_name: 'Phong 2 nguoi',
        unit_price: 4500000,
        total_amount: 4500000,
        effective_from: '2026-04-30',
      }),
    ]);
  });
});
