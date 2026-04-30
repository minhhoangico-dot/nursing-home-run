import { beforeEach, describe, expect, it, vi } from 'vitest';

import { financeService } from './financeService';
import { supabase } from '../lib/supabase';

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
});
