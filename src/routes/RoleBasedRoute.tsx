import React from 'react';
import { Outlet } from 'react-router-dom';
import type { ManagedModuleKey } from '../types';
import { ModuleRoute } from './ModuleRoute';

interface RoleBasedRouteProps {
  moduleKey: ManagedModuleKey;
  children?: React.ReactNode;
}

export const RoleBasedRoute = ({ moduleKey, children }: RoleBasedRouteProps) => {
  if (!moduleKey) {
    return children ? <>{children}</> : <Outlet />;
  }

  return <ModuleRoute moduleKey={moduleKey}>{children}</ModuleRoute>;
};
