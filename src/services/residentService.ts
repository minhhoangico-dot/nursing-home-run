import { supabase } from '../lib/supabase';
import { Resident } from '../types';

const mapResidentToDb = (r: Resident) => ({
    id: r.id,
    name: r.name,
    dob: r.dob,
    gender: r.gender,
    room: r.room,
    bed: r.bed,
    floor: r.floor,
    building: r.building,
    care_level: r.careLevel,
    status: r.status,
    admission_date: r.admissionDate,
    guardian_name: r.guardianName,
    guardian_phone: r.guardianPhone,
    balance: r.balance,
    assessments: r.assessments,
    prescriptions: r.prescriptions,
    medical_visits: r.medicalVisits,
    special_monitoring: r.specialMonitoring,
    medical_history: r.medicalHistory,
    allergies: r.allergies,
    vital_signs: r.vitalSigns,
    care_logs: r.careLogs,
    current_condition_note: r.currentConditionNote,
    last_medical_update: r.lastMedicalUpdate,
    last_updated_by: r.lastUpdatedBy,
    room_type: r.roomType,
    diet_type: r.dietType,
    diet_note: r.dietNote,
    is_diabetic: r.isDiabetic
});

const mapResidentFromDb = (d: any): Resident => ({
    ...d,
    careLevel: d.care_level,
    admissionDate: d.admission_date,
    guardianName: d.guardian_name,
    guardianPhone: d.guardian_phone,
    balance: Number(d.balance),
    assessments: d.assessments || [],
    prescriptions: d.prescriptions || [],
    medicalVisits: d.medical_visits || [],
    specialMonitoring: d.special_monitoring || [],
    medicalHistory: d.medical_history || [],
    allergies: d.allergies || [],
    vitalSigns: d.vital_signs || [],
    careLogs: d.care_logs || [],
    currentConditionNote: d.current_condition_note || '',
    lastMedicalUpdate: d.last_medical_update || '',
    lastUpdatedBy: d.last_updated_by,
    roomType: d.room_type || '2 Giường',
    dietType: d.diet_type || 'Normal',
    dietNote: d.diet_note,
    isDiabetic: d.is_diabetic || false
});

export const residentService = {
    getAll: async () => {
        const { data, error } = await supabase.from('residents').select('*').order('name');
        if (error) throw error;
        return (data || []).map(mapResidentFromDb);
    },
    upsert: async (r: Resident) => {
        const { error } = await supabase.from('residents').upsert(mapResidentToDb(r));
        if (error) throw error;
    },
    bulkUpsert: async (list: Resident[]) => {
        if (!list.length) return;
        const { error } = await supabase.from('residents').upsert(list.map(mapResidentToDb));
        if (error) throw error;
    }
};