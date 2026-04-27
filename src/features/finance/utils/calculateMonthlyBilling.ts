import { ResidentListItem, ServiceUsage } from '@/src/types/index';
import { INITIAL_PRICES } from '@/src/data/index';

export interface FixedCostBreakdown {
  total: number;
  details: { name: string; amount: number }[];
}

export const calculateFixedCosts = (resident: ResidentListItem): FixedCostBreakdown => {
  const details: { name: string; amount: number }[] = [];
  let total = 0;

  const roomPrice =
    INITIAL_PRICES.find(p => p.category === 'ROOM' && p.name.includes(resident.roomType))?.price || 0;
  if (roomPrice > 0) {
    total += roomPrice;
    details.push({ name: `Phòng ${resident.roomType}`, amount: roomPrice });
  }

  const carePrice =
    INITIAL_PRICES.find(p => p.category === 'CARE' && p.name.includes(`Cấp độ ${resident.careLevel}`))?.price || 0;
  if (carePrice > 0) {
    total += carePrice;
    details.push({ name: `CS Cấp độ ${resident.careLevel}`, amount: carePrice });
  }

  const mealPrice =
    INITIAL_PRICES.find(p => p.category === 'MEAL' && p.name.includes('Suất ăn tiêu chuẩn'))?.price || 0;
  if (resident.dietType !== 'Tube' && mealPrice > 0) {
    total += mealPrice;
    details.push({ name: 'Suất ăn tiêu chuẩn', amount: mealPrice });
  }

  return { total, details };
};

export const getMonthlyUsage = (
  usageRecords: ServiceUsage[],
  residentId: string,
  month: string,
): ServiceUsage[] => usageRecords.filter(u => u.residentId === residentId && u.date.startsWith(month));
