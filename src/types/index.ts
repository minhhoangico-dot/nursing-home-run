export * from './user';
export * from './medical';
export * from './resident';
export * from './room';
export * from './inventory';
export * from './finance';
export * from './incident';
export * from './schedule';
export * from './handover';
export * from './visitor';
// =============================================
// BLOOD SUGAR MONITORING
// =============================================
export interface BloodSugarRecord {
    id: string;
    residentId: string;
    recordDate: string;
    morningBeforeMeal?: number;
    morningAfterMeal?: number;
    lunchBeforeMeal?: number;
    lunchAfterMeal?: number;
    dinnerBeforeMeal?: number;
    dinnerAfterMeal?: number;
    insulinUnits?: number;
    insulinTime?: 'morning' | 'noon' | 'evening';
    administeredBy?: string;
    notes?: string;
    createdAt: string;
    createdBy?: string;
}

// =============================================
// SHIFT HANDOVER
// =============================================
export interface ShiftHandover {
    id: string;
    shiftDate: string;
    shiftTime: string;
    floorId: string;
    handoverStaff: string[];
    receiverStaff: string[];
    totalResidents: number;
    notes: ShiftNote[];
    createdAt: string;
    createdBy?: string;
}

export interface ShiftNote {
    id: string;
    handoverId: string;
    residentId?: string;
    residentName?: string;
    content: string;
    createdAt: string;
}

// =============================================
// MEDICAL PROCEDURES
// =============================================
export interface ProcedureRecord {
    id: string;
    residentId: string;
    recordDate: string;
    injection: boolean;
    ivDrip: boolean;
    gastricTube: boolean;
    urinaryCatheter: boolean;
    bladderWash: boolean;
    bloodSugarTest: boolean;
    bloodPressure: boolean;
    oxygenTherapy: boolean;
    woundDressing: boolean;
    injectionCount: number;
    ivDripCount: number;
    performedBy?: string;
    notes?: string;
    createdAt: string;
    createdBy?: string;
}

export type ProcedureType =
    | 'injection' | 'ivDrip' | 'gastricTube' | 'urinaryCatheter'
    | 'bladderWash' | 'bloodSugarTest' | 'bloodPressure'
    | 'oxygenTherapy' | 'woundDressing';

export const PROCEDURE_LABELS: Record<ProcedureType, string> = {
    injection: 'Tiêm',
    ivDrip: 'Truyền dịch',
    gastricTube: 'Đặt sonde dạ dày',
    urinaryCatheter: 'Đặt sonde bàng quang',
    bladderWash: 'Rửa bàng quang',
    bloodSugarTest: 'Test tiểu đường',
    bloodPressure: 'Đo huyết áp',
    oxygenTherapy: 'Thở Oxy',
    woundDressing: 'Thay băng',
};

// =============================================
// WEIGHT TRACKING
// =============================================
export interface WeightRecord {
    id: string;
    residentId: string;
    recordMonth: string;
    weightKg: number;
    notes?: string;
    recordedBy?: string;
    createdAt: string;
    createdBy?: string;
}

export * from './maintenance';
export * from './activity';