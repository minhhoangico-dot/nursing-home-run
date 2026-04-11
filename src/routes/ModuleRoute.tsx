import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { LoadingScreen } from '../components/ui';
import { getDefaultModulePathForRole } from '../constants/modules';
import { useAuthStore } from '../stores/authStore';
import { usePermissionStore } from '../stores/permissionStore';
import type { ManagedModuleKey } from '../types';
import { ModuleAccessProvider } from './ModuleAccessContext';

interface ModuleRouteProps {
  moduleKey: ManagedModuleKey;
  children?: React.ReactNode;
}

const PermissionErrorState = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <div className="flex h-full min-h-[50vh] flex-col items-center justify-center p-8 text-center text-slate-500">
    <h2 className="mb-2 text-2xl font-bold text-slate-800">{title}</h2>
    <p>{message}</p>
  </div>
);

const useEnsurePermissions = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { permissions, isLoading, error, fetchPermissions } = usePermissionStore();

  useEffect(() => {
    if (isAuthenticated && user && !permissions && !isLoading && !error) {
      fetchPermissions().catch(() => undefined);
    }
  }, [error, fetchPermissions, isAuthenticated, isLoading, permissions, user]);

  return { permissions, isLoading, error };
};

export const DefaultModuleRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { permissions, isLoading, error } = useEnsurePermissions();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || !permissions) {
    if (error) {
      return (
        <PermissionErrorState
          title="Không thể tải quyền truy cập"
          message="Hệ thống không thể xác định module bạn được phép truy cập. Vui lòng tải lại hoặc đăng nhập lại."
        />
      );
    }

    return <LoadingScreen message="Đang kiểm tra quyền truy cập..." />;
  }

  return <Navigate to={getDefaultModulePathForRole(permissions, user.role)} replace />;
};

export const ModuleRoute = ({ moduleKey, children }: ModuleRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const { getModuleAccess } = usePermissionStore();
  const { permissions, isLoading, error } = useEnsurePermissions();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || !permissions) {
    if (error) {
      return (
        <PermissionErrorState
          title="Không thể tải quyền truy cập"
          message="Trang này đang bị khóa vì hệ thống không thể tải ma trận phân quyền."
        />
      );
    }

    return <LoadingScreen message="Đang kiểm tra quyền truy cập..." />;
  }

  const access = getModuleAccess(user.role, moduleKey);

  if (access === 'none') {
    return (
      <PermissionErrorState
        title="Không có quyền truy cập"
        message="Bạn không có quyền truy cập vào module này."
      />
    );
  }

  return (
    <ModuleAccessProvider value={access === 'read_only' ? 'readOnly' : 'full'}>
      {children ? <>{children}</> : <Outlet />}
    </ModuleAccessProvider>
  );
};
