import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { useMonitoringStore } from './monitoringStore';
import { supabase } from '@/src/lib/supabase';

vi.mock('@/src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const DAILY_MONITORING_COLUMNS = [
  'id',
  'resident_id',
  'record_date',
  'sp02',
  'pulse',
  'temperature',
  'bp_morning',
  'bp_afternoon',
  'bp_evening',
  'blood_sugar',
  'bowel_movements',
  'notes',
  'created_at',
  'updated_at',
  'created_by',
].join(',');

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
};

describe('useMonitoringStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMonitoringStore.setState({
      records: [],
      recordsByMonth: {},
      isLoading: false,
      currentMonth: new Date(2026, 0, 1),
    });
  });

  it('uses the actual last day of the selected month and an explicit projection when fetching records', async () => {
    const query = {
      select: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
    };

    query.select.mockReturnValue(query);
    query.gte.mockReturnValue(query);
    query.lte.mockResolvedValue({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(query as never);

    await useMonitoringStore.getState().fetchDailyRecords(new Date(2026, 3, 12));

    expect(supabase.from).toHaveBeenCalledWith('daily_monitoring');
    expect(query.select).toHaveBeenCalledWith(DAILY_MONITORING_COLUMNS);
    expect(query.gte).toHaveBeenCalledWith('record_date', '2026-04-01');
    expect(query.lte).toHaveBeenCalledWith('record_date', '2026-04-30');
  });

  it('queries the latest_daily_monitoring view without client-side dedupe', async () => {
    const latestRows = [
      { id: 'latest-1', resident_id: 'resident-1', record_date: '2026-04-10' },
      { id: 'latest-2', resident_id: 'resident-2', record_date: '2026-04-11' },
    ];

    const query = {
      select: vi.fn(),
    };

    query.select.mockResolvedValue({ data: latestRows, error: null });
    vi.mocked(supabase.from).mockReturnValue(query as never);

    const rows = await useMonitoringStore.getState().fetchLatestReadings();

    expect(supabase.from).toHaveBeenCalledWith('latest_daily_monitoring');
    expect(query.select).toHaveBeenCalledWith(DAILY_MONITORING_COLUMNS);
    expect(rows).toEqual(latestRows);
  });

  it('returns cached month data synchronously and then revalidates in the background', async () => {
    const aprilRows = [{ id: 'april-1', resident_id: 'resident-1', record_date: '2026-04-01' }];
    const refreshedRows = [{ id: 'april-2', resident_id: 'resident-1', record_date: '2026-04-02' }];

    const firstQuery = {
      select: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
    };
    firstQuery.select.mockReturnValue(firstQuery);
    firstQuery.gte.mockReturnValue(firstQuery);
    firstQuery.lte.mockResolvedValue({ data: aprilRows, error: null });

    const secondQueryDeferred = createDeferred<{ data: typeof refreshedRows; error: null }>();
    const secondQuery = {
      select: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
    };
    secondQuery.select.mockReturnValue(secondQuery);
    secondQuery.gte.mockReturnValue(secondQuery);
    secondQuery.lte.mockReturnValue(secondQueryDeferred.promise);

    vi.mocked(supabase.from)
      .mockReturnValueOnce(firstQuery as never)
      .mockReturnValueOnce(secondQuery as never);

    await useMonitoringStore.getState().fetchDailyRecords(new Date(2026, 3, 12));

    const revalidation = useMonitoringStore.getState().fetchDailyRecords(new Date(2026, 3, 20));

    expect(useMonitoringStore.getState().records).toEqual(aprilRows);
    expect(useMonitoringStore.getState().isLoading).toBe(false);

    secondQueryDeferred.resolve({ data: refreshedRows, error: null });
    await revalidation;

    expect(useMonitoringStore.getState().records).toEqual(refreshedRows);
    expect(useMonitoringStore.getState().recordsByMonth['2026-04']).toEqual(refreshedRows);
  });

  it('keeps only the three most recent month cache entries', async () => {
    const makeQuery = (rows: Array<{ id: string; resident_id: string; record_date: string }>) => {
      const query = {
        select: vi.fn(),
        gte: vi.fn(),
        lte: vi.fn(),
      };

      query.select.mockReturnValue(query);
      query.gte.mockReturnValue(query);
      query.lte.mockResolvedValue({ data: rows, error: null });
      return query;
    };

    vi.mocked(supabase.from)
      .mockReturnValueOnce(makeQuery([{ id: 'apr', resident_id: 'resident-1', record_date: '2026-04-01' }]) as never)
      .mockReturnValueOnce(makeQuery([{ id: 'may', resident_id: 'resident-1', record_date: '2026-05-01' }]) as never)
      .mockReturnValueOnce(makeQuery([{ id: 'jun', resident_id: 'resident-1', record_date: '2026-06-01' }]) as never)
      .mockReturnValueOnce(makeQuery([{ id: 'jul', resident_id: 'resident-1', record_date: '2026-07-01' }]) as never);

    await useMonitoringStore.getState().fetchDailyRecords(new Date(2026, 3, 12));
    await useMonitoringStore.getState().fetchDailyRecords(new Date(2026, 4, 12));
    await useMonitoringStore.getState().fetchDailyRecords(new Date(2026, 5, 12));
    await useMonitoringStore.getState().fetchDailyRecords(new Date(2026, 6, 12));

    await waitFor(() => {
      expect(Object.keys(useMonitoringStore.getState().recordsByMonth).sort()).toEqual(['2026-05', '2026-06', '2026-07']);
    });
  });
});
