export interface FinancialTransaction {
  id: string;
  date: string;
  residentName: string;
  description: string;
  amount: number;
  type: 'IN' | 'OUT';
  performer: string;
  status: 'Success' | 'Pending' | 'Failed';
}

// Basic normalized ServicePrice for compatibility/usage records
export interface ServicePrice {
  id: string; // generated or mapped from code
  name: string;
  category: 'ROOM' | 'CARE' | 'MEAL' | 'OTHER';
  price: number;
  unit: string;
  billingType: 'FIXED' | 'ONE_OFF';
  // Original references
  originalId?: number | string;
  code?: string;
  description?: string;
}

// New specific types matching DB tables
export interface RoomPrice {
  id: number;
  roomType: string; // '1-bed', '2-bed'...
  roomTypeVi: string;
  priceMonthly: number;
  description?: string;
}

export interface CareLevelPrice {
  id: number;
  careLevel: number; // 1-4
  careLevelVi: string;
  scoreMin: number;
  scoreMax: number;
  roomType: string;
  priceMonthly: number;
}

export interface MealPrice {
  id: number;
  mealType: string; // 'standard', 'in_room'
  mealTypeVi: string;
  priceMonthly: number;
  priceDaily: number;
  description?: string;
}

export interface AdditionalService {
  id: number;
  code: string; // SVC001...
  serviceName: string;
  serviceNameVi: string;
  unit: string;
  unitVi: string;
  price: number;
  category: string; // 'special_care', 'wound_care'...
  billingType?: 'ONE_OFF' | 'FIXED'; // Derived
  description?: string;
}

export interface AbsenceDeduction {
  id: number;
  absenceType: string;
  absenceTypeVi: string;
  deductionDaily: number;
  description?: string;
}

export interface HolidaySurcharge {
  id: number;
  holidayType: string;
  holidayTypeVi: string;
  surchargeDaily: number;
  datesDescription: string;
}


export interface ServiceUsage {
  id: string;
  residentId: string;
  serviceId: string;
  serviceName: string;
  date: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  description?: string;
  status: 'Unbilled' | 'Billed';
}