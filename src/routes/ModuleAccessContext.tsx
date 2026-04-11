import React, { createContext, useContext } from 'react';
import type { ModuleAccessMode } from '../types/appSettings';

const ModuleAccessContext = createContext<ModuleAccessMode | null>(null);

interface ModuleAccessProviderProps {
  value: ModuleAccessMode;
  children: React.ReactNode;
}

export const ModuleAccessProvider = ({ value, children }: ModuleAccessProviderProps) => (
  <ModuleAccessContext.Provider value={value}>{children}</ModuleAccessContext.Provider>
);

export const useModuleAccessMode = (): ModuleAccessMode => {
  const accessMode = useContext(ModuleAccessContext);

  if (!accessMode) {
    throw new Error('useModuleAccessMode must be used within a ModuleAccessProvider');
  }

  return accessMode;
};

export const useModuleReadOnly = (): boolean => useModuleAccessMode() === 'readOnly';
