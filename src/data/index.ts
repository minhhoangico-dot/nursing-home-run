export * from './mockUsers';
export * from './mockResidents';
export * from './mockInventory';
export * from './mockRooms';
export * from './mockPrescriptions';
export * from './mockIncidents';
export * from './mockSchedule';
export * from './mockHandovers';
export * from './mockVisitors';
export * from './mockMaintenance';
export * from './mockActivities';
export { formatCurrency, formatDate } from '../utils/formatters';
import { ServicePrice } from '../types/index';

export const INITIAL_PRICES: ServicePrice[] = [
  { id: '1', name: 'Phòng 1 Giường', category: 'ROOM', price: 15000000, unit: 'tháng', billingType: 'FIXED' },
  { id: '2', name: 'Phòng 2 Giường', category: 'ROOM', price: 10000000, unit: 'tháng', billingType: 'FIXED' },
  { id: '3', name: 'Phòng 4 Giường', category: 'ROOM', price: 6000000, unit: 'tháng', billingType: 'FIXED' },
  { id: '4', name: 'Chăm sóc Cấp độ 1', category: 'CARE', price: 3000000, unit: 'tháng', billingType: 'FIXED' },
  { id: '5', name: 'Chăm sóc Cấp độ 2', category: 'CARE', price: 5000000, unit: 'tháng', billingType: 'FIXED' },
  { id: '6', name: 'Chăm sóc Cấp độ 3', category: 'CARE', price: 7000000, unit: 'tháng', billingType: 'FIXED' },
  { id: '7', name: 'Chăm sóc Cấp độ 4', category: 'CARE', price: 10000000, unit: 'tháng', billingType: 'FIXED' },
  { id: '8', name: 'Suất ăn tiêu chuẩn', category: 'MEAL', price: 3900000, unit: 'tháng', billingType: 'FIXED' },
];