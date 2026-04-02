import React, { createContext, useContext } from 'react';
import type { ModuleAccessLevel } from '../lib/moduleAccess';

const ModuleAccessContext = createContext<ModuleAccessLevel | null>(null);

interface ModuleAccessProviderProps {
  value: ModuleAccessLevel;
  children: React.ReactNode;
}

export const ModuleAccessProvider = ({ value, children }: ModuleAccessProviderProps) => (
  <ModuleAccessContext.Provider value={value}>{children}</ModuleAccessContext.Provider>
);

export const useModuleAccessMode = (): ModuleAccessLevel => {
  const accessMode = useContext(ModuleAccessContext);

  if (!accessMode) {
    throw new Error('useModuleAccessMode must be used within a ModuleAccessProvider');
  }

  return accessMode;
};

export const useModuleReadOnly = (): boolean => useModuleAccessMode() === 'read_only';
