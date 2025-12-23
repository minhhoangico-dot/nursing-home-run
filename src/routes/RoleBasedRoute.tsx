import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types';

interface RoleBasedRouteProps {
    allowedRoles: Role[];
    children?: React.ReactNode;
}

export const RoleBasedRoute = ({ allowedRoles, children }: RoleBasedRouteProps) => {
    const { user } = useAuthStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Or render a "Not Authorized" component
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                <h2 className="text-2xl font-bold mb-2">Không có quyền truy cập</h2>
                <p>Bạn không có quyền truy cập vào trang này.</p>
            </div>
        );
    }

    return children ? <>{children}</> : <Outlet />;
};
