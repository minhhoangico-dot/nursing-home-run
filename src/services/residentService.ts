import { supabase } from '../lib/supabase';
import { Resident, ResidentListItem } from '../types';

export const RESIDENT_LIST_COLUMNS = [
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

export const mapResidentToListItem = (resident: Resident | ResidentListItem): ResidentListItem => ({
    id: resident.id,
    clinicCode: resident.clinicCode,
    name: resident.name,
    dob: resident.dob,
    gender: resident.gender,
    room: resident.room,
    bed: resident.bed,
    floor: resident.floor,
    building: resident.building,
    careLevel: resident.careLevel,
    status: resident.status,
    admissionDate: resident.admissionDate,
    guardianName: resident.guardianName,
    guardianPhone: resident.guardianPhone,
    balance: Number(resident.balance ?? 0),
    currentConditionNote: resident.currentConditionNote || '',
    lastMedicalUpdate: resident.lastMedicalUpdate || '',
    lastUpdatedBy: resident.lastUpdatedBy,
    roomType: resident.roomType || '2 Giường',
    dietType: resident.dietType || 'Normal',
    dietNote: resident.dietNote,
    isDiabetic: resident.isDiabetic || false,
    height: resident.height,
});

const mapResidentToDb = (resident: Resident) => ({
    id: resident.id,
    clinic_code: resident.clinicCode,
    name: resident.name,
    dob: resident.dob,
    gender: resident.gender,
    room: resident.room,
    bed: resident.bed,
    floor: resident.floor,
    building: resident.building,
    care_level: resident.careLevel,
    status: resident.status,
    admission_date: resident.admissionDate,
    guardian_name: resident.guardianName,
    guardian_phone: resident.guardianPhone,
    balance: resident.balance,
    assessments: resident.assessments,
    prescriptions: resident.prescriptions,
    medical_visits: resident.medicalVisits,
    special_monitoring: resident.specialMonitoring,
    medical_history: resident.medicalHistory,
    allergies: resident.allergies,
    vital_signs: resident.vitalSigns,
    care_logs: resident.careLogs,
    current_condition_note: resident.currentConditionNote,
    last_medical_update: resident.lastMedicalUpdate,
    last_updated_by: resident.lastUpdatedBy,
    room_type: resident.roomType,
    diet_type: resident.dietType,
    diet_note: resident.dietNote,
    is_diabetic: resident.isDiabetic,
    height: resident.height,
    location_status: resident.locationStatus,
    absent_start_date: resident.absentStartDate,
});

const mapResidentListItemFromDb = (dbResident: any): ResidentListItem => ({
    id: dbResident.id,
    clinicCode: dbResident.clinic_code ?? dbResident.clinicCode,
    name: dbResident.name,
    dob: dbResident.dob,
    gender: dbResident.gender,
    room: dbResident.room,
    bed: dbResident.bed,
    floor: dbResident.floor,
    building: dbResident.building,
    careLevel: dbResident.care_level,
    status: dbResident.status,
    admissionDate: dbResident.admission_date,
    guardianName: dbResident.guardian_name,
    guardianPhone: dbResident.guardian_phone,
    balance: Number(dbResident.balance ?? 0),
    currentConditionNote: dbResident.current_condition_note || '',
    lastMedicalUpdate: dbResident.last_medical_update || '',
    lastUpdatedBy: dbResident.last_updated_by,
    roomType: dbResident.room_type || '2 Giường',
    dietType: dbResident.diet_type || 'Normal',
    dietNote: dbResident.diet_note,
    isDiabetic: dbResident.is_diabetic || false,
    height: dbResident.height === null || dbResident.height === undefined ? undefined : Number(dbResident.height),
});

const mapResidentFromDb = (dbResident: any): Resident => ({
    ...mapResidentListItemFromDb(dbResident),
    assessments: dbResident.assessments || [],
    prescriptions: dbResident.prescriptions || [],
    medicalVisits: dbResident.medical_visits || [],
    specialMonitoring: dbResident.special_monitoring || [],
    medicalHistory: dbResident.medical_history || [],
    allergies: dbResident.allergies || [],
    vitalSigns: dbResident.vital_signs || [],
    careLogs: dbResident.care_logs || [],
    locationStatus: dbResident.location_status,
    absentStartDate: dbResident.absent_start_date,
});

export const residentService = {
    getAll: async (): Promise<ResidentListItem[]> => {
        const { data, error } = await supabase.from('residents').select(RESIDENT_LIST_COLUMNS).order('name');
        if (error) throw error;
        return (data || []).map(mapResidentListItemFromDb);
    },
    getById: async (id: string): Promise<Resident> => {
        const { data, error } = await supabase.from('residents').select('*').eq('id', id).single();
        if (error) throw error;
        return mapResidentFromDb(data);
    },
    upsert: async (resident: Resident) => {
        const { error } = await supabase.from('residents').upsert(mapResidentToDb(resident));
        if (error) throw error;
    },
    bulkUpsert: async (list: Resident[]) => {
        if (!list.length) return;
        const { error } = await supabase.from('residents').upsert(list.map(mapResidentToDb));
        if (error) throw error;
    }
};
