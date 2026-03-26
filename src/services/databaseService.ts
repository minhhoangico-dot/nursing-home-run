import { residentService } from './residentService';
import { financeService } from './financeService';
import { medicalService } from './medicalService';

/**
 * Global Database Service
 * Aggregates all modular services for backward compatibility
 */
export const db = {
  residents: residentService,
  users: medicalService.users,
  permissions: medicalService.permissions,
  finance: financeService,
  incidents: medicalService.incidents,
  visitors: medicalService.visitors,
  maintenance: medicalService.maintenance,
  medication: medicalService.medication,
  nutrition: medicalService.nutrition
};
