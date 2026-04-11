import React from 'react';
import { ReadOnlyBanner } from '@/src/components/ui/ReadOnlyBanner';
import { RestrictedAccessPanel } from '@/src/components/ui/RestrictedAccessPanel';
import { useModuleAccess } from '@/src/hooks/useModuleAccess';
import type { ModuleKey } from '@/src/types/appSettings';
import { ModuleAccessProvider } from './ModuleAccessContext';

export const PermissionRoute = ({
  moduleKey,
  children,
}: {
  moduleKey: ModuleKey;
  children: React.ReactNode;
}) => {
  const access = useModuleAccess(moduleKey);

  if (access.mode === 'restricted') {
    return <RestrictedAccessPanel moduleKey={moduleKey} />;
  }

  return (
    <ModuleAccessProvider value={access.mode}>
      {access.mode === 'readOnly' && <ReadOnlyBanner />}
      {children}
    </ModuleAccessProvider>
  );
};
