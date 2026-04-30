import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useResidentsStore } from './residentsStore';
import type { Resident } from '../types';

const { residentsDb } = vi.hoisted(() => ({
  residentsDb: {
    getAll: vi.fn(),
    getById: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('../services/databaseService', () => ({
  db: {
    residents: residentsDb,
  },
}));

describe('useResidentsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useResidentsStore.setState({
      residents: [],
      residentDetails: {},
      selectedResident: null,
      isLoading: false,
      isSyncing: false,
      error: null,
    });
  });

  it('returns a cached resident detail immediately and revalidates in the background', async () => {
    const cachedResident: Resident = {
      id: 'resident-1',
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
      admissionDate: '2026-01-15',
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
      currentConditionNote: 'Cached note',
      lastMedicalUpdate: '2026-04-01',
      lastUpdatedBy: 'BS A',
      roomType: '2 Giường',
      dietType: 'Normal',
      dietNote: '',
      isDiabetic: false,
      height: 1.58,
    };

    residentsDb.getById.mockResolvedValue({
      ...cachedResident,
      currentConditionNote: 'Fresh note',
    });

    useResidentsStore.setState({
      residents: [
        {
          id: 'resident-1',
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
          admissionDate: '2026-01-15',
          guardianName: 'Nguyen Van B',
          guardianPhone: '0900000000',
          balance: 0,
          currentConditionNote: 'Cached note',
          lastMedicalUpdate: '2026-04-01',
          lastUpdatedBy: 'BS A',
          roomType: '2 Giường',
          dietType: 'Normal',
          dietNote: '',
          isDiabetic: false,
          height: 1.58,
        },
      ],
      residentDetails: {
        'resident-1': cachedResident,
      },
    });

    const resident = await useResidentsStore.getState().fetchResidentDetail('resident-1');

    expect(resident).toEqual(cachedResident);

    await waitFor(() => {
      expect(residentsDb.getById).toHaveBeenCalledWith('resident-1');
      expect(useResidentsStore.getState().residentDetails['resident-1'].currentConditionNote).toBe('Fresh note');
    });
  });

  it('fetches and caches a resident detail when it is missing', async () => {
    const resident: Resident = {
      id: 'resident-2',
      clinicCode: 'NCT-002',
      name: 'Le Thi B',
      dob: '1952-02-02',
      gender: 'Nữ',
      room: '102',
      bed: 'B',
      floor: 'Tang 1',
      building: 'Toa A',
      careLevel: 3,
      status: 'Active',
      admissionDate: '2026-02-01',
      guardianName: 'Tran Van C',
      guardianPhone: '0911111111',
      balance: 300000,
      assessments: [],
      prescriptions: [],
      medicalVisits: [],
      specialMonitoring: [],
      medicalHistory: [],
      allergies: [],
      vitalSigns: [],
      careLogs: [],
      currentConditionNote: 'Theo doi',
      lastMedicalUpdate: '2026-04-05',
      lastUpdatedBy: 'BS B',
      roomType: '1 Giường',
      dietType: 'Soup',
      dietNote: 'An mem',
      isDiabetic: true,
      height: 1.52,
    };

    residentsDb.getById.mockResolvedValue(resident);

    const fetchedResident = await useResidentsStore.getState().fetchResidentDetail('resident-2');

    expect(residentsDb.getById).toHaveBeenCalledWith('resident-2');
    expect(fetchedResident).toEqual(resident);
    expect(useResidentsStore.getState().residentDetails['resident-2']).toEqual(resident);
  });

  it('rejects an invalid resident detail id before querying the database', async () => {
    await expect(useResidentsStore.getState().fetchResidentDetail('undefined')).rejects.toThrow('Invalid resident id');

    expect(residentsDb.getById).not.toHaveBeenCalled();
  });
});
