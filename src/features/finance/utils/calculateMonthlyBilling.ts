import { ResidentFixedServiceAssignment, ResidentListItem, ServiceUsage } from '@/src/types/index';
import { getMissingRequiredFixedCategories } from './fixedServiceAssignments';

export interface FixedCostBreakdown {
  total: number;
  details: { name: string; amount: number }[];
  missingRequiredCategories: string[];
}

export const calculateFixedCosts = (
  resident: ResidentListItem,
  fixedServices: ResidentFixedServiceAssignment[] = [],
): FixedCostBreakdown => {
  const residentFixedServices = fixedServices.filter(
    (assignment) => assignment.residentId === resident.id && assignment.status === 'Active',
  );
  const details = residentFixedServices.map((assignment) => ({
    name: assignment.serviceName,
    amount: assignment.totalAmount,
  }));

  return {
    total: details.reduce((sum, detail) => sum + detail.amount, 0),
    details,
    missingRequiredCategories: getMissingRequiredFixedCategories(residentFixedServices),
  };
};

export const getMonthlyUsage = (
  usageRecords: ServiceUsage[],
  residentId: string,
  month: string,
): ServiceUsage[] => usageRecords.filter(u => u.residentId === residentId && u.date.startsWith(month));
