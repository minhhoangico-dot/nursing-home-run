import { residentService } from './residentService';
import { financeService } from './financeService';
import { inventoryService } from './inventoryService';
import { medicalService } from './medicalService';

/**
 * Global Database Service
 * Aggregates all modular services for backward compatibility
 */
export const db = {
  residents: residentService,
  users: medicalService.users,
  inventory: inventoryService,
  finance: financeService,
  incidents: medicalService.incidents,
  schedules: medicalService.schedules,
  handovers: medicalService.handovers,
  visitors: medicalService.visitors,
  maintenance: medicalService.maintenance,
  activities: medicalService.activities,
  medication: medicalService.medication,
  nutrition: medicalService.nutrition
};