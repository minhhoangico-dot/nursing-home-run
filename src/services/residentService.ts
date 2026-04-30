import { supabase } from '../lib/supabase';
import { Resident, ResidentListItem } from '../types';

export const normalizeResidentId = (id: unknown): string | null => {
    if (typeof id !== 'string') {
        return null;
    }

    const residentId = id.trim();
    if (!residentId) {
        return null;
    }

    const lowerResidentId = residentId.toLowerCase();
    if (lowerResidentId === 'undefined' || lowerResidentId === 'null') {
        return null;
    }

    return residentId;
};

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
    'id_card',
    'guardian_address',
    'guardian_id_card',
    'guardian_relation',
    'contract_number',
    'contract_signed_date',
    'contract_monthly_fee',
    'diet_note',
    'height',
    'guardian_dob',
    'id_card_front_path',
    'id_card_back_path',
    'guardian_id_card_front_path',
    'guardian_id_card_back_path',
    'bhyt_card_path',
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
    guardianAddress: resident.guardianAddress,
    guardianIdCard: resident.guardianIdCard,
    guardianRelation: resident.guardianRelation,
    idCard: resident.idCard,
    contractNumber: resident.contractNumber,
    contractSignedDate: resident.contractSignedDate,
    contractMonthlyFee: resident.contractMonthlyFee,
    balance: Number(resident.balance ?? 0),
    currentConditionNote: resident.currentConditionNote || '',
    lastMedicalUpdate: resident.lastMedicalUpdate || '',
    lastUpdatedBy: resident.lastUpdatedBy,
    roomType: resident.roomType || '2 Giường',
    dietType: resident.dietType || 'Normal',
    dietNote: resident.dietNote,
    isDiabetic: resident.isDiabetic || false,
    height: resident.height,
    guardianDob: resident.guardianDob,
    idCardFrontPath: resident.idCardFrontPath,
    idCardBackPath: resident.idCardBackPath,
    guardianIdCardFrontPath: resident.guardianIdCardFrontPath,
    guardianIdCardBackPath: resident.guardianIdCardBackPath,
    bhytCardPath: resident.bhytCardPath,
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
    guardian_address: resident.guardianAddress || null,
    guardian_id_card: resident.guardianIdCard || null,
    guardian_relation: resident.guardianRelation || null,
    id_card: resident.idCard || null,
    contract_number: resident.contractNumber || null,
    contract_signed_date: resident.contractSignedDate || null,
    contract_monthly_fee: resident.contractMonthlyFee ?? null,
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
    last_medical_update: resident.lastMedicalUpdate || null,
    last_updated_by: resident.lastUpdatedBy,
    room_type: resident.roomType,
    diet_type: resident.dietType,
    diet_note: resident.dietNote,
    is_diabetic: resident.isDiabetic,
    height: resident.height,
    location_status: resident.locationStatus,
    absent_start_date: resident.absentStartDate,
    guardian_dob: resident.guardianDob || null,
    id_card_front_path: resident.idCardFrontPath || null,
    id_card_back_path: resident.idCardBackPath || null,
    guardian_id_card_front_path: resident.guardianIdCardFrontPath || null,
    guardian_id_card_back_path: resident.guardianIdCardBackPath || null,
    bhyt_card_path: resident.bhytCardPath || null,
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
    guardianAddress: dbResident.guardian_address || undefined,
    guardianIdCard: dbResident.guardian_id_card || undefined,
    guardianRelation: dbResident.guardian_relation || undefined,
    idCard: dbResident.id_card || undefined,
    contractNumber: dbResident.contract_number || undefined,
    contractSignedDate: dbResident.contract_signed_date || undefined,
    contractMonthlyFee: dbResident.contract_monthly_fee === null || dbResident.contract_monthly_fee === undefined
        ? undefined
        : Number(dbResident.contract_monthly_fee),
    balance: Number(dbResident.balance ?? 0),
    currentConditionNote: dbResident.current_condition_note || '',
    lastMedicalUpdate: dbResident.last_medical_update || '',
    lastUpdatedBy: dbResident.last_updated_by,
    roomType: dbResident.room_type || '2 Giường',
    dietType: dbResident.diet_type || 'Normal',
    dietNote: dbResident.diet_note,
    isDiabetic: dbResident.is_diabetic || false,
    height: dbResident.height === null || dbResident.height === undefined ? undefined : Number(dbResident.height),
    guardianDob: dbResident.guardian_dob || undefined,
    idCardFrontPath: dbResident.id_card_front_path || undefined,
    idCardBackPath: dbResident.id_card_back_path || undefined,
    guardianIdCardFrontPath: dbResident.guardian_id_card_front_path || undefined,
    guardianIdCardBackPath: dbResident.guardian_id_card_back_path || undefined,
    bhytCardPath: dbResident.bhyt_card_path || undefined,
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
        const residentId = normalizeResidentId(id);
        if (!residentId) {
            throw new Error('Invalid resident id');
        }

        const { data, error } = await supabase.from('residents').select('*').eq('id', residentId).single();
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
