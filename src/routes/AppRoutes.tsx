import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuthStore } from '../stores/authStore';

// Lazy load pages
const LoginPage = React.lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
// const DashboardPage = React.lazy(() => import('../features/dashboard/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ResidentListPage = React.lazy(() => import('../features/residents/pages/ResidentListPage').then(module => ({ default: module.ResidentListPage })));
const ResidentDetailPage = React.lazy(() => import('../features/residents/pages/ResidentDetailPage').then(module => ({ default: module.ResidentDetailPage })));
const RoomMapPage = React.lazy(() => import('../features/rooms/pages/RoomMapPage').then(module => ({ default: module.RoomMapPage })));
const IncidentsPage = React.lazy(() => import('../features/incidents/pages/IncidentsPage').then(module => ({ default: module.IncidentsPage })));
const SchedulePage = React.lazy(() => import('../features/schedule/pages/SchedulePage').then(module => ({ default: module.SchedulePage })));
const NutritionPage = React.lazy(() => import('../features/nutrition/pages/NutritionPage').then(module => ({ default: module.NutritionPage })));
const VisitorsPage = React.lazy(() => import('../features/visitors/pages/VisitorsPage').then(module => ({ default: module.VisitorsPage })));
const DailyMonitoringPage = React.lazy(() => import('../features/monitoring/pages/DailyMonitoringPage').then(module => ({ default: module.DailyMonitoringPage })));
const MaintenancePage = React.lazy(() => import('../features/maintenance/pages/MaintenancePage').then(module => ({ default: module.MaintenancePage })));
const PrintFormsPage = React.lazy(() => import('../features/print-forms/pages/PrintFormsPage').then(module => ({ default: module.PrintFormsPage })));
const FinancePage = React.lazy(() => import('../features/finance/pages/FinancePage').then(module => ({ default: module.FinancePage })));
const StockPage = React.lazy(() => import('../features/inventory/pages/StockPage').then(module => ({ default: module.StockPage })));
const SettingsPage = React.lazy(() => import('../features/settings/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const ActivitiesPage = React.lazy(() => import('../features/activities/pages/ActivitiesPage').then(module => ({ default: module.ActivitiesPage })));

// New Modules
const ShiftHandoverPage = React.lazy(() => import('../features/shift-handover').then(module => ({ default: module.ShiftHandoverPage })));
const DiabetesMonitoringPage = React.lazy(() => import('../features/diabetes').then(module => ({ default: module.DiabetesMonitoringPage })));
const ProceduresPage = React.lazy(() => import('../features/procedures').then(module => ({ default: module.ProceduresPage })));
const WeightTrackingPage = React.lazy(() => import('../features/weight-tracking').then(module => ({ default: module.WeightTrackingPage })));

import { LoadingScreen, ErrorBoundary } from '../components/ui';

const LoadingFallback = () => <LoadingScreen message="Đang tải..." />;

export const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Navigate to="/residents" replace />} />
                            {/* <Route path="/dashboard" element={<DashboardPage />} /> */}

                            <Route path="/residents" element={<ResidentListPage />} />
                            <Route path="/residents/:id" element={<ResidentDetailPage />} />

                            <Route path="/rooms" element={<RoomMapPage />} />
                            <Route path="/activities" element={<ActivitiesPage />} />
                            <Route path="/nutrition" element={<NutritionPage />} />
                            <Route path="/visitors" element={<VisitorsPage />} />

                            {/* NEW MODULES */}
                            <Route path="/shift-handover" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERVISOR']}>
                                    <ShiftHandoverPage />
                                </RoleBasedRoute>
                            } />

                            <Route path="/daily-monitoring" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE']}>
                                    <DailyMonitoringPage />
                                </RoleBasedRoute>
                            } />


                            <Route path="/diabetes-monitoring" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE']}>
                                    <DiabetesMonitoringPage />
                                </RoleBasedRoute>
                            } />

                            <Route path="/procedures" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE']}>
                                    <ProceduresPage />
                                </RoleBasedRoute>
                            } />

                            <Route path="/weight-tracking" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE']}>
                                    <WeightTrackingPage />
                                </RoleBasedRoute>
                            } />

                            <Route path="/incidents" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'DOCTOR', 'SUPERVISOR', 'NURSE']}>
                                    <IncidentsPage />
                                </RoleBasedRoute>
                            } />

                            <Route path="/schedule" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERVISOR']}>
                                    <SchedulePage />
                                </RoleBasedRoute>
                            } />


                            <Route path="/maintenance" element={<MaintenancePage />} />

                            <Route path="/forms" element={<PrintFormsPage />} />

                            <Route path="/finance" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                                    <FinancePage />
                                </RoleBasedRoute>
                            } />

                            <Route path="/inventory" element={
                                <RoleBasedRoute allowedRoles={['ADMIN', 'ACCOUNTANT', 'SUPERVISOR']}>
                                    <StockPage />
                                </RoleBasedRoute>
                            } />


                            <Route path="/settings" element={
                                <RoleBasedRoute allowedRoles={['ADMIN']}>
                                    <SettingsPage />
                                </RoleBasedRoute>
                            } />

                            <Route path="*" element={<Navigate to="/residents" replace />} />
                        </Route>
                    </Route>
                </Routes>
            </ErrorBoundary>
        </Suspense>
    );
};
