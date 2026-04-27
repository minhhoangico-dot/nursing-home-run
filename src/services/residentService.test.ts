import { beforeEach, describe, expect, it, vi } from 'vitest';

import { residentService } from './residentService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const LEAN_RESIDENT_COLUMNS = [
  'id',
  'name',
  'dob',
  'gender',
  'room',
  'bed',
  'floor',
  'building',
  'care_level',
  'status',
  'admission_date',
  'guardian_name',
  'guardian_phone',
  'balance',
  'current_condition_note',
  'last_medical_update',
  'last_updated_by',
  'is_diabetic',
  'room_type',
  'diet_type',
  'clinic_code',
  'diet_note',
  'height',
].join(',');

describe('residentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the resident list with an explicit lean projection', async () => {
    const query = {
      select: vi.fn(),
      order: vi.fn(),
    };

    query.select.mockReturnValue(query);
    query.order.mockResolvedValue({
      data: [
        {
          id: 'resident-1',
          name: 'Nguyen Van A',
          dob: '1950-01-01',
          gender: 'Nam',
          room: '101',
          bed: 'A',
          floor: 'Tang 1',
          building: 'Toa A',
          care_level: 2,
          status: 'Active',
          admission_date: '2026-01-15',
          guardian_name: 'Nguyen Van B',
          guardian_phone: '0900000000',
          balance: '125000',
          current_condition_note: 'On dinh',
          last_medical_update: '2026-04-01',
          last_updated_by: 'BS A',
          is_diabetic: true,
          room_type: '2 Giuong',
          diet_type: 'Normal',
          clinic_code: 'NCT-001',
          diet_note: 'It duong',
          height: 1.58,
        },
      ],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue(query as never);

    const residents = await residentService.getAll();

    expect(supabase.from).toHaveBeenCalledWith('residents');
    expect(query.select).toHaveBeenCalledWith(LEAN_RESIDENT_COLUMNS);
    expect(query.order).toHaveBeenCalledWith('name');
    expect(residents).toEqual([
      {
        id: 'resident-1',
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
        balance: 125000,
        currentConditionNote: 'On dinh',
        lastMedicalUpdate: '2026-04-01',
        lastUpdatedBy: 'BS A',
        isDiabetic: true,
        roomType: '2 Giuong',
        dietType: 'Normal',
        clinicCode: 'NCT-001',
        dietNote: 'It duong',
        height: 1.58,
      },
    ]);
  });

  it('fetches and maps a full resident record by id', async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
    };

    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.single.mockResolvedValue({
      data: {
        id: 'resident-1',
        clinic_code: 'NCT-001',
        name: 'Nguyen Van A',
        dob: '1950-01-01',
        gender: 'Nam',
        room: '101',
        bed: 'A',
        floor: 'Tang 1',
        building: 'Toa A',
        care_level: 2,
        status: 'Active',
        admission_date: '2026-01-15',
        guardian_name: 'Nguyen Van B',
        guardian_phone: '0900000000',
        balance: '125000',
        assessments: [{ id: 'assessment-1' }],
        prescriptions: [{ id: 'prescription-1' }],
        medical_visits: [{ id: 'visit-1' }],
        special_monitoring: [{ id: 'monitor-1' }],
        medical_history: [{ id: 'condition-1', name: 'Tang huyet ap' }],
        allergies: [{ id: 'allergy-1', allergen: 'Tom', severity: 'High' }],
        vital_signs: [{ date: '2026-04-01', temperature: 37 }],
        care_logs: [{ id: 'log-1', timestamp: '2026-04-01T07:00:00.000Z', category: 'Other', note: 'Theo doi', performer: 'NV A' }],
        current_condition_note: 'On dinh',
        last_medical_update: '2026-04-01',
        last_updated_by: 'BS A',
        room_type: '2 Giuong',
        diet_type: 'Soup',
        diet_note: 'It muoi',
        is_diabetic: true,
        height: 1.58,
        location_status: 'Present',
        absent_start_date: null,
      },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue(query as never);

    const resident = await residentService.getById('resident-1');

    expect(query.select).toHaveBeenCalledWith('*');
    expect(query.eq).toHaveBeenCalledWith('id', 'resident-1');
    expect(query.single).toHaveBeenCalled();
    expect(resident.clinicCode).toBe('NCT-001');
    expect(resident.height).toBe(1.58);
    expect(resident.medicalHistory).toEqual([{ id: 'condition-1', name: 'Tang huyet ap' }]);
    expect(resident.allergies).toEqual([{ id: 'allergy-1', allergen: 'Tom', severity: 'High' }]);
    expect(resident.prescriptions).toEqual([{ id: 'prescription-1' }]);
  });
});
