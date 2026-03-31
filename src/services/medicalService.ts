import { supabase } from '../lib/supabase';
import { Incident, StaffSchedule, HandoverReport, VisitorLog, MaintenanceRequest, ActivityEvent, MedicationLog, User, Role, RolePermission, RolePermissionMap, MANAGED_MODULE_KEYS } from '../types';
import { Medicine, Prescription, PrescriptionItem } from '../types/medical';
import {
    mapPrescriptionFromDb,
    mapPrescriptionItemToDb,
    mapPrescriptionToDb,
} from '../features/prescriptions/utils/prescriptionMappers';

const mapIncidentToDb = (i: Incident) => ({
    id: i.id,
    date: i.date,
    time: i.time,
    type: i.type,
    severity: i.severity,
    resident_id: i.residentId,
    resident_name: i.residentName,
    location: i.location,
    description: i.description,
    immediate_action: i.immediateAction,
    reporter: i.reporter,
    status: i.status,
    witnesses: i.witnesses,
    notes: i.notes
});

const mapIncidentFromDb = (d: any): Incident => ({
    id: d.id,
    date: d.date,
    time: d.time,
    type: d.type,
    severity: d.severity,
    residentId: d.resident_id,
    residentName: d.resident_name,
    location: d.location,
    description: d.description,
    immediateAction: d.immediate_action,
    reporter: d.reporter,
    status: d.status,
    witnesses: d.witnesses,
    notes: d.notes
});

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
    id: r.id,
    title: r.title,
    description: r.description,
    location: r.location,
    priority: r.priority,
    status: r.status,
    reporter: r.reporter,
    assignee: r.assignee,
    created_at: r.createdAt,
    completed_at: r.completedAt,
    cost: r.cost,
    note: r.note
});

const mapMaintenanceFromDb = (d: any): MaintenanceRequest => ({
    id: d.id,
    title: d.title,
    description: d.description,
    location: d.location,
    priority: d.priority,
    status: d.status,
    reporter: d.reporter,
    assignee: d.assignee,
    createdAt: d.created_at,
    completedAt: d.completed_at,
    cost: d.cost ? Number(d.cost) : undefined,
    note: d.note
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
    id: d.id,
    title: d.title,
    type: d.type,
    date: d.date,
    location: d.location,
    host: d.host,
    description: d.description,
    status: d.status,
    startTime: d.start_time,
    endTime: d.end_time
});

const mapUserFromDb = (d: any): User => ({
    id: String(d.id),
    name: d.name ?? d.full_name ?? '',
    username: d.username ?? '',
    password: d.password,
    role: d.role,
    floor: d.floor,
    avatar: d.avatar ?? d.avatar_url
});

const mapUserToDb = (u: User) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    password: u.password,
    role: u.role,
    floor: u.floor,
    avatar: u.avatar
});

const mapMedicineFromDb = (row: any): Medicine => ({
    id: row.id,
    name: row.name,
    activeIngredient: row.active_ingredient,
    unit: row.unit,
    defaultDosage: row.default_dosage,
    price: row.price ? Number(row.price) : undefined,
    strength: row.strength ?? undefined,
    route: row.route ?? undefined,
    therapeuticGroup: row.therapeutic_group ?? undefined,
    source: row.source ?? undefined,
});

const mapMedicineToDb = (medicine: Partial<Medicine>) => ({
    name: medicine.name,
    active_ingredient: medicine.activeIngredient,
    unit: medicine.unit,
    default_dosage: medicine.defaultDosage,
    price: medicine.price,
    strength: medicine.strength,
    route: medicine.route,
    therapeutic_group: medicine.therapeuticGroup,
    source: medicine.source,
});

const createEmptyRolePermissions = (): RolePermission =>
    MANAGED_MODULE_KEYS.reduce((permissions, moduleKey) => {
        permissions[moduleKey] = false;
        return permissions;
    }, {} as RolePermission);

const createEmptyRolePermissionMap = (): RolePermissionMap => ({
    ADMIN: createEmptyRolePermissions(),
    DOCTOR: createEmptyRolePermissions(),
    SUPERVISOR: createEmptyRolePermissions(),
    ACCOUNTANT: createEmptyRolePermissions(),
    NURSE: createEmptyRolePermissions(),
    CAREGIVER: createEmptyRolePermissions(),
});

const mapRolePermissionsFromDb = (rows: any[]): RolePermissionMap => {
    const permissions = createEmptyRolePermissionMap();

    rows.forEach((row) => {
        const role = row.role as Role;
        const moduleKey = row.module_key as typeof MANAGED_MODULE_KEYS[number];

        if (!(role in permissions) || !MANAGED_MODULE_KEYS.includes(moduleKey)) {
            return;
        }

        permissions[role][moduleKey] = Boolean(row.is_enabled);
    });

    permissions.ADMIN.settings = true;
    return permissions;
};

export const medicalService = {
    incidents: {
        getAll: async () => {
            const { data, error } = await supabase.from('incidents').select('*').order('date', { ascending: false });
            if (error) throw error;
            return (data || []).map(mapIncidentFromDb);
        },
        upsert: async (i: Incident) => {
            const { error } = await supabase.from('incidents').upsert(mapIncidentToDb(i));
            if (error) throw error;
        },
        bulkUpsert: async (list: Incident[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('incidents').upsert(list.map(mapIncidentToDb));
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

    medicines: {
        getAll: async () => {
            const { data, error } = await supabase.from('medicines').select('*').order('name');
            if (error) throw error;
            return (data || []).map(mapMedicineFromDb);
        },
        insert: async (medicine: Partial<Medicine>) => {
            const { data, error } = await supabase.from('medicines').insert(mapMedicineToDb(medicine)).select().single();
            if (error) throw error;
            return mapMedicineFromDb(data);
        },
        update: async (id: string, medicine: Partial<Medicine>) => {
            const { data, error } = await supabase
                .from('medicines')
                .update(mapMedicineToDb(medicine))
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return mapMedicineFromDb(data);
        },
        remove: async (id: string) => {
            const { error } = await supabase.from('medicines').delete().eq('id', id);
            if (error) throw error;
        }
    },

    prescriptions: {
        getAll: async (residentId?: string) => {
            let query = supabase
                .from('prescriptions')
                .select(`
                    *,
                    items:prescription_items(*)
                `)
                .order('prescription_date', { ascending: false });

            if (residentId) {
                query = query.eq('resident_id', residentId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []).map(mapPrescriptionFromDb);
        },
        insert: async (prescription: Omit<Prescription, 'id'>, items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[]) => {
            const { data: inserted, error: prescriptionError } = await supabase
                .from('prescriptions')
                .insert(mapPrescriptionToDb(prescription))
                .select()
                .single();
            if (prescriptionError) throw prescriptionError;

            if (items.length > 0) {
                const { error: itemError } = await supabase
                    .from('prescription_items')
                    .insert(items.map((item) => mapPrescriptionItemToDb(item, inserted.id)));
                if (itemError) throw itemError;
            }

            return inserted.id as string;
        },
        update: async (id: string, prescription: Omit<Prescription, 'id'>, items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[]) => {
            const { error: prescriptionError } = await supabase
                .from('prescriptions')
                .update(mapPrescriptionToDb(prescription))
                .eq('id', id);
            if (prescriptionError) throw prescriptionError;

            const { error: deleteError } = await supabase.from('prescription_items').delete().eq('prescription_id', id);
            if (deleteError) throw deleteError;

            if (items.length > 0) {
                const { error: itemError } = await supabase
                    .from('prescription_items')
                    .insert(items.map((item) => mapPrescriptionItemToDb(item, id)));
                if (itemError) throw itemError;
            }
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
            return (data || []).map(mapUserFromDb);
        },
        upsert: async (u: User) => {
            const { error } = await supabase.from('users').upsert(mapUserToDb(u));
            if (error) throw error;
        },
        bulkUpsert: async (list: User[]) => {
            if (!list.length) return;
            const { error } = await supabase.from('users').upsert(list.map(mapUserToDb));
            if (error) throw error;
        }
    },

    permissions: {
        getRolePermissions: async () => {
            const { data, error } = await supabase.from('role_permissions').select('*').order('role', { ascending: true });
            if (error) throw error;
            return mapRolePermissionsFromDb(data || []);
        },
        replaceRolePermissions: async (role: Role, permissions: RolePermission) => {
            const records = MANAGED_MODULE_KEYS.map((moduleKey) => ({
                role,
                module_key: moduleKey,
                is_enabled: role === 'ADMIN' && moduleKey === 'settings' ? true : permissions[moduleKey]
            }));

            const { error } = await supabase.from('role_permissions').upsert(records);
            if (error) throw error;

            const { data: refreshedData, error: refreshedError } = await supabase.from('role_permissions').select('*').order('role', { ascending: true });
            if (refreshedError) throw refreshedError;

            return mapRolePermissionsFromDb(refreshedData || []);
        }
    }
};
