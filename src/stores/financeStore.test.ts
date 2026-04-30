import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFinanceStore } from './financeStore';
import type { ResidentFixedServiceAssignment } from '../types';

const { financeDb } = vi.hoisted(() => ({
  financeDb: {
    getTransactions: vi.fn(),
    getPrices: vi.fn(),
    getUsage: vi.fn(),
    getResidentFixedServices: vi.fn(),
    replaceResidentFixedServices: vi.fn(),
  },
}));

vi.mock('../services/databaseService', () => ({
  db: {
    finance: financeDb,
  },
}));

const roomAssignment: ResidentFixedServiceAssignment = {
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
};

describe('useFinanceStore fixed services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFinanceStore.setState({
      transactions: [],
      servicePrices: [],
      usageRecords: [],
      residentFixedServices: [],
      isLoading: false,
      isLoaded: false,
      isSyncing: false,
      error: null,
    });

    financeDb.getTransactions.mockResolvedValue([]);
    financeDb.getPrices.mockResolvedValue([]);
    financeDb.getUsage.mockResolvedValue([]);
    financeDb.getResidentFixedServices.mockResolvedValue([roomAssignment]);
    financeDb.replaceResidentFixedServices.mockResolvedValue(undefined);
  });

  it('loads fixed service assignments with finance data', async () => {
    await useFinanceStore.getState().fetchFinanceData();

    expect(financeDb.getResidentFixedServices).toHaveBeenCalled();
    expect(useFinanceStore.getState().residentFixedServices).toEqual([roomAssignment]);
  });

  it('replaces assignments for one resident without touching other residents', async () => {
    const otherResidentAssignment: ResidentFixedServiceAssignment = {
      ...roomAssignment,
      id: 'RFS-OTHER',
      residentId: 'RES-2',
    };
    const nextRows: ResidentFixedServiceAssignment[] = [
      {
        ...roomAssignment,
        serviceId: 'ROOM_1',
        serviceName: 'Phong 1 nguoi',
        unitPrice: 6000000,
        totalAmount: 6000000,
      },
    ];

    useFinanceStore.setState({
      residentFixedServices: [roomAssignment, otherResidentAssignment],
    });

    await useFinanceStore.getState().replaceResidentFixedServices('RES-1', nextRows);

    expect(financeDb.replaceResidentFixedServices).toHaveBeenCalledWith('RES-1', nextRows);
    expect(useFinanceStore.getState().residentFixedServices).toEqual([
      otherResidentAssignment,
      ...nextRows,
    ]);
  });
});
