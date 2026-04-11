import type { ModuleKey } from '../types/appSettings';

export interface ModuleRegistryItem {
  key: ModuleKey;
  path: string;
  nav: boolean;
}

export const MODULE_REGISTRY: Record<ModuleKey, ModuleRegistryItem> = {
  settings: { key: 'settings', path: '/settings', nav: true },
  finance: { key: 'finance', path: '/finance', nav: true },
  residents: { key: 'residents', path: '/residents', nav: true },
  rooms: { key: 'rooms', path: '/rooms', nav: true },
  visitors: { key: 'visitors', path: '/visitors', nav: true },
  dailyMonitoring: {
    key: 'dailyMonitoring',
    path: '/daily-monitoring',
    nav: true,
  },
  medications: { key: 'medications', path: '/medications', nav: true },
  procedures: { key: 'procedures', path: '/procedures', nav: true },
  nutrition: { key: 'nutrition', path: '/nutrition', nav: true },
  maintenance: { key: 'maintenance', path: '/maintenance', nav: true },
  incidents: { key: 'incidents', path: '/incidents', nav: true },
  forms: { key: 'forms', path: '/forms', nav: true },
  weightTracking: {
    key: 'weightTracking',
    path: '/weight-tracking',
    nav: false,
  },
};

export const MODULE_KEYS = Object.keys(MODULE_REGISTRY) as ModuleKey[];
