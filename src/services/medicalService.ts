import { supabase } from '../lib/supabase';
import { Incident, StaffSchedule, HandoverReport, VisitorLog, MaintenanceRequest, ActivityEvent, MedicationLog, User } from '../types';

const mapVisitorToDb = (v: VisitorLog) => ({
    id: v.id,
    visitor_name: v.visitorName,
    id_card: v.idCard,
    phone: v.phone,
    resident_id: v.residentId,
    resident_name: v.residentName,
    relationship: v.relationship,
    check_in_time: v.checkInTime,
    check_out_time: v.checkOutTime,
    status: v.status,
    note: v.note,
    item_brought: v.itemBrought
});

const mapVisitorFromDb = (d: any): VisitorLog => ({
    ...d,
    visitorName: d.visitor_name,
    idCard: d.id_card,
    residentId: d.resident_id,
    residentName: d.resident_name,
    checkInTime: d.check_in_time,
    checkOutTime: d.check_out_time,
    itemBrought: d.item_brought
});

const mapMaintenanceToDb = (r: MaintenanceRequest) => ({
    ...r,
    created_at: r.createdAt,
    completed_at: r.completedAt
});

const mapMaintenanceFromDb = (d: any): MaintenanceRequest => ({
    ...d,
    createdAt: d.created_at,
    completedAt: d.completed_at,
    cost: d.cost ? Number(d.cost) : undefined
});

const mapActivityToDb = (a: ActivityEvent) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    date: a.date,
    start_time: a.startTime,
    end_time: a.endTime,
    location: a.location,
    host: a.host,
    description: a.description,
    status: a.status
});

const mapActivityFromDb = (d: any): ActivityEvent => ({
    ...d,
    startTime: d.start_time,
    endTime: d.end_time
});

export const medicalService = {
    incidents: {
        getAll: async () => {
            const { data, error } = await supabase.from('incidents').select('*').order('date', { ascending: false });
            if (error) throw error;
            return (data || []).map(d => ({ ...d, residentId: d.resident_id, residentName: d.resident_name, immediateAction: d.immediate_action })) as Incident[];
        },
        upsert: async (i: Incident) => {
            const { error } = await supabase.from('incidents').upsert({
                ...i, resident_id: i.residentId, resident_name: i.residentName, immediate_action: i.immediateAction
            });
            if (error) throw error;
        },
        bulkUpsert: async (list: Incident[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('incidents').upsert(list.map(i => ({
                ...i, resident_id: i.residentId, resident_name: i.residentName, immediate_action: i.immediateAction
            })));
            if (error) throw error;
        }
    },

    schedules: {
        getAll: async () => {
            const { data, error } = await supabase.from('staff_schedules').select('*');
            if (error) throw error;
            const mapped = (data || []).map(d => {
                const rawShifts = d.shifts || {};
                const normalizedShifts = Object.fromEntries(
                    Object.entries(rawShifts).map(([date, val]) => [
                        date,
                        Array.isArray(val) ? val : [val]
                    ])
                );
                return {
                    userId: d.user_id,
                    userName: d.user_name,
                    role: d.role,
                    shifts: normalizedShifts
                };
            }) as StaffSchedule[];

            const seen = new Set<string>();
            return mapped.filter(s => {
                if (seen.has(s.userId)) return false;
                seen.add(s.userId);
                return true;
            });
        },
        upsert: async (s: StaffSchedule) => {
            const { error } = await supabase.from('staff_schedules').upsert({
                user_id: s.userId,
                user_name: s.userName,
                role: s.role,
                shifts: s.shifts
            });
            if (error) throw error;
        },
        delete: async (userId: string) => {
            const { error } = await supabase.from('staff_schedules').delete().eq('user_id', userId);
            if (error) throw error;
        },
        bulkUpsert: async (list: StaffSchedule[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('staff_schedules').upsert(list.map(s => ({
                user_id: s.userId,
                user_name: s.userName,
                role: s.role,
                shifts: s.shifts
            })));
            if (error) throw error;
        }
    },

    handovers: {
        getAll: async () => {
            const { data, error } = await supabase.from('handovers').select('*').order('date', { ascending: false });
            if (error) throw error;
            return (data || []).map(d => ({
                ...d, totalResidents: d.total_residents, newAdmissions: d.new_admissions,
                medicalAlerts: d.medical_alerts, equipmentIssues: d.equipment_issues, generalNotes: d.general_notes, createdAt: d.created_at
            })) as HandoverReport[];
        },
        insert: async (h: HandoverReport) => {
            const { error } = await supabase.from('handovers').insert({
                id: h.id, date: h.date, shift: h.shift, leader: h.leader, total_residents: h.totalResidents,
                new_admissions: h.newAdmissions, discharges: h.discharges, transfers: h.transfers,
                medical_alerts: h.medicalAlerts, equipment_issues: h.equipmentIssues, general_notes: h.generalNotes, created_at: h.createdAt
            });
            if (error) throw error;
        },
        bulkUpsert: async (list: HandoverReport[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('handovers').upsert(list.map(h => ({
                id: h.id, date: h.date, shift: h.shift, leader: h.leader, total_residents: h.totalResidents,
                new_admissions: h.newAdmissions, discharges: h.discharges, transfers: h.transfers,
                medical_alerts: h.medicalAlerts, equipment_issues: h.equipmentIssues, general_notes: h.generalNotes, created_at: h.createdAt
            })));
            if (error) throw error;
        }
    },

    visitors: {
        getAll: async () => {
            const { data, error } = await supabase.from('visitors').select('*').order('check_in_time', { ascending: false });
            if (error) throw error;
            return (data || []).map(mapVisitorFromDb);
        },
        upsert: async (v: VisitorLog) => {
            const { error } = await supabase.from('visitors').upsert(mapVisitorToDb(v));
            if (error) throw error;
        },
        bulkUpsert: async (list: VisitorLog[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('visitors').upsert(list.map(mapVisitorToDb));
            if (error) throw error;
        }
    },

    maintenance: {
        getAll: async () => {
            const { data, error } = await supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(mapMaintenanceFromDb);
        },
        upsert: async (r: MaintenanceRequest) => {
            const { error } = await supabase.from('maintenance_requests').upsert(mapMaintenanceToDb(r));
            if (error) throw error;
        },
        bulkUpsert: async (list: MaintenanceRequest[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('maintenance_requests').upsert(list.map(mapMaintenanceToDb));
            if (error) throw error;
        }
    },

    activities: {
        getAll: async () => {
            const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: true });
            if (error) throw error;
            return (data || []).map(mapActivityFromDb);
        },
        insert: async (a: ActivityEvent) => {
            const { error } = await supabase.from('activities').insert(mapActivityToDb(a));
            if (error) throw error;
        },
        bulkUpsert: async (list: ActivityEvent[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('activities').upsert(list.map(mapActivityToDb));
            if (error) throw error;
        }
    },

    medication: {
        getLogs: async () => {
            const { data, error } = await supabase.from('medication_logs').select('*').order('date', { ascending: false });
            if (error) throw error;
            return (data || []).map(d => ({
                ...d,
                residentId: d.resident_id,
                prescriptionId: d.prescription_id,
                medicationName: d.medication_name
            })) as MedicationLog[];
        },
        addLog: async (l: MedicationLog) => {
            const { error } = await supabase.from('medication_logs').insert({
                id: l.id,
                resident_id: l.residentId,
                prescription_id: l.prescriptionId,
                medication_name: l.medicationName,
                dose: l.dose,
                time: l.time,
                date: l.date,
                status: l.status,
                performer: l.performer,
                note: l.note
            });
            if (error) throw error;
        },
        bulkUpsertLogs: async (list: MedicationLog[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('medication_logs').upsert(list.map(l => ({
                id: l.id,
                resident_id: l.residentId,
                prescription_id: l.prescriptionId,
                medication_name: l.medicationName,
                dose: l.dose,
                time: l.time,
                date: l.date,
                status: l.status,
                performer: l.performer,
                note: l.note
            })));
            if (error) throw error;
        }
    },

    nutrition: {
        getOrders: async (date: string) => {
            const { data, error } = await supabase.from('meal_orders').select('*').eq('date', date);
            if (error) throw error;
            return (data || []).map(d => ({
                residentId: d.resident_id,
                date: d.date,
                mealType: d.meal_type,
                dietType: d.diet_type,
                note: d.note
            }));
        },
        upsertOrder: async (o: any) => {
            const { error } = await supabase.from('meal_orders').upsert({
                resident_id: o.residentId,
                date: o.date,
                meal_type: o.mealType,
                diet_type: o.dietType,
                note: o.note
            });
            if (error) throw error;
        }
    },

    users: {
        getAll: async () => {
            const { data, error } = await supabase.from('users').select('*');
            if (error) throw error;
            return data as User[];
        },
        upsert: async (u: User) => {
            const { error } = await supabase.from('users').upsert(u);
            if (error) throw error;
        },
        bulkUpsert: async (list: User[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('users').upsert(list);
            if (error) throw error;
        }
    }
};
