import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBloodSugarStore } from './bloodSugarStore';
import { supabase } from '@/src/lib/supabase';

vi.mock('@/src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const BLOOD_SUGAR_COLUMNS = [
  'id',
  'resident_id',
  'record_date',
  'morning_before_meal',
  'morning_after_meal',
  'lunch_before_meal',
  'lunch_after_meal',
  'dinner_before_meal',
  'dinner_after_meal',
  'insulin_units',
  'insulin_time',
  'administered_by',
  'notes',
  'created_at',
  'created_by',
].join(',');

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
};

describe('useBloodSugarStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBloodSugarStore.setState({
      records: [],
      recordsByMonth: {},
      isLoading: false,
      error: null,
    });
  });

  it('uses the actual last day of the requested month and an explicit projection when fetching all records', async () => {
    const query = {
      select: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
      order: vi.fn(),
    };

    query.select.mockReturnValue(query);
    query.gte.mockReturnValue(query);
    query.lte.mockReturnValue(query);
    query.order.mockResolvedValue({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(query as never);

    await useBloodSugarStore.getState().fetchAllRecords('2026-04');

    expect(supabase.from).toHaveBeenCalledWith('blood_sugar_records');
    expect(query.select).toHaveBeenCalledWith(BLOOD_SUGAR_COLUMNS);
    expect(query.gte).toHaveBeenCalledWith('record_date', '2026-04-01');
    expect(query.lte).toHaveBeenCalledWith('record_date', '2026-04-30');
  });

  it('uses the explicit projection when fetching a resident blood sugar history', async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
    };

    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.order.mockResolvedValue({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(query as never);

    await useBloodSugarStore.getState().fetchRecords('resident-1');

    expect(query.select).toHaveBeenCalledWith(BLOOD_SUGAR_COLUMNS);
    expect(query.eq).toHaveBeenCalledWith('resident_id', 'resident-1');
  });

  it('returns cached month data synchronously and then revalidates in the background', async () => {
    const aprilRows = [{ id: 'april-1', resident_id: 'resident-1', record_date: '2026-04-01', created_at: '2026-04-01T00:00:00.000Z' }];
    const refreshedRows = [{ id: 'april-2', resident_id: 'resident-1', record_date: '2026-04-02', created_at: '2026-04-02T00:00:00.000Z' }];

    const firstQuery = {
      select: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
      order: vi.fn(),
    };
    firstQuery.select.mockReturnValue(firstQuery);
    firstQuery.gte.mockReturnValue(firstQuery);
    firstQuery.lte.mockReturnValue(firstQuery);
    firstQuery.order.mockResolvedValue({ data: aprilRows, error: null });

    const secondQueryDeferred = createDeferred<{ data: typeof refreshedRows; error: null }>();
    const secondQuery = {
      select: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
      order: vi.fn(),
    };
    secondQuery.select.mockReturnValue(secondQuery);
    secondQuery.gte.mockReturnValue(secondQuery);
    secondQuery.lte.mockReturnValue(secondQuery);
    secondQuery.order.mockReturnValue(secondQueryDeferred.promise);

    vi.mocked(supabase.from)
      .mockReturnValueOnce(firstQuery as never)
      .mockReturnValueOnce(secondQuery as never);

    await useBloodSugarStore.getState().fetchAllRecords('2026-04');

    const revalidation = useBloodSugarStore.getState().fetchAllRecords('2026-04');

    expect(useBloodSugarStore.getState().records.map((record) => record.id)).toEqual(['april-1']);
    expect(useBloodSugarStore.getState().isLoading).toBe(false);

    secondQueryDeferred.resolve({ data: refreshedRows, error: null });
    await revalidation;

    expect(useBloodSugarStore.getState().records.map((record) => record.id)).toEqual(['april-2']);
    expect(useBloodSugarStore.getState().recordsByMonth['2026-04'].map((record) => record.id)).toEqual(['april-2']);
  });

  it('keeps only the three most recent month cache entries', async () => {
    const makeQuery = (rows: Array<{ id: string; resident_id: string; record_date: string; created_at: string }>) => {
      const query = {
        select: vi.fn(),
        gte: vi.fn(),
        lte: vi.fn(),
        order: vi.fn(),
      };

      query.select.mockReturnValue(query);
      query.gte.mockReturnValue(query);
      query.lte.mockReturnValue(query);
      query.order.mockResolvedValue({ data: rows, error: null });
      return query;
    };

    vi.mocked(supabase.from)
      .mockReturnValueOnce(makeQuery([{ id: 'apr', resident_id: 'resident-1', record_date: '2026-04-01', created_at: '2026-04-01T00:00:00.000Z' }]) as never)
      .mockReturnValueOnce(makeQuery([{ id: 'may', resident_id: 'resident-1', record_date: '2026-05-01', created_at: '2026-05-01T00:00:00.000Z' }]) as never)
      .mockReturnValueOnce(makeQuery([{ id: 'jun', resident_id: 'resident-1', record_date: '2026-06-01', created_at: '2026-06-01T00:00:00.000Z' }]) as never)
      .mockReturnValueOnce(makeQuery([{ id: 'jul', resident_id: 'resident-1', record_date: '2026-07-01', created_at: '2026-07-01T00:00:00.000Z' }]) as never);

    await useBloodSugarStore.getState().fetchAllRecords('2026-04');
    await useBloodSugarStore.getState().fetchAllRecords('2026-05');
    await useBloodSugarStore.getState().fetchAllRecords('2026-06');
    await useBloodSugarStore.getState().fetchAllRecords('2026-07');

    expect(Object.keys(useBloodSugarStore.getState().recordsByMonth).sort()).toEqual(['2026-05', '2026-06', '2026-07']);
  });
});
