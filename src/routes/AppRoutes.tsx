import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuthStore } from '../stores/authStore';

// Lazy load pages
const LoginPage = React.lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const DashboardPage = React.lazy(() => import('../features/dashboard/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ResidentListPage = React.lazy(() => import('../features/residents/pages/ResidentListPage').then(module => ({ default: module.ResidentListPage })));
const ResidentDetailPage = React.lazy(() => import('../features/residents/pages/ResidentDetailPage').then(module => ({ default: module.ResidentDetailPage })));
const RoomMapPage = React.lazy(() => import('../features/rooms/pages/RoomMapPage').then(module => ({ default: module.RoomMapPage })));
const IncidentsPage = React.lazy(() => import('../features/incidents/pages/IncidentsPage').then(module => ({ default: module.IncidentsPage })));
const SchedulePage = React.lazy(() => import('../features/schedule/pages/SchedulePage').then(module => ({ default: module.SchedulePage })));
const MedicationPage = React.lazy(() => import('../features/medication/pages/MedicationPage').then(module => ({ default: module.MedicationPage })));
const HandoverPage = React.lazy(() => import('../features/handover/pages/HandoverPage').then(module => ({ default: module.HandoverPage })));
const NutritionPage = React.lazy(() => import('../features/nutrition/pages/NutritionPage').then(module => ({ default: module.NutritionPage })));
const VisitorsPage = React.lazy(() => import('../features/visitors/pages/VisitorsPage').then(module => ({ default: module.VisitorsPage })));
const MaintenancePage = React.lazy(() => import('../features/maintenance/pages/MaintenancePage').then(module => ({ default: module.MaintenancePage })));
const PrintFormsPage = React.lazy(() => import('../features/print-forms/pages/PrintFormsPage').then(module => ({ default: module.PrintFormsPage })));
const FinancePage = React.lazy(() => import('../features/finance/pages/FinancePage').then(module => ({ default: module.FinancePage })));
const StockPage = React.lazy(() => import('../features/inventory/pages/StockPage').then(module => ({ default: module.StockPage })));
const ReportsPage = React.lazy(() => import('../features/reports/pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const SettingsPage = React.lazy(() => import('../features/settings/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const ActivitiesPage = React.lazy(() => import('../features/activities/pages/ActivitiesPage').then(module => ({ default: module.ActivitiesPage })));

// New Modules
const ShiftHandoverPage = React.lazy(() => import('../features/shift-handover').then(module => ({ default: module.ShiftHandoverPage })));
const DiabetesMonitoringPage = React.lazy(() => import('../features/diabetes').then(module => ({ default: module.DiabetesMonitoringPage })));
const ProceduresPage = React.lazy(() => import('../features/procedures').then(module => ({ default: module.ProceduresPage })));
const WeightTrackingPage = React.lazy(() => import('../features/weight-tracking').then(module => ({ default: module.WeightTrackingPage })));

import { LoadingScreen } from '../components/ui';

const LoadingFallback = () => <LoadingScreen message="Đang tải..." />;

export const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />

                        <Route path="/residents" element={<ResidentListPage />} />
                        <Route path="/residents/:id" element={<ResidentDetailPage />} />

                        <Route path="/rooms" element={<RoomMapPage />} />
                        <Route path="/activities" element={<ActivitiesPage />} />
                        <Route path="/nutrition" element={<NutritionPage />} />
                        <Route path="/medication" element={<MedicationPage />} />
                        <Route path="/visitors" element={<VisitorsPage />} />

                        {/* NEW MODULES */}
                        <Route path="/shift-handover" element={
                            <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERVISOR']}>
                                <ShiftHandoverPage />
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

                        <Route path="/handover" element={<HandoverPage />} />

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

                        <Route path="/reports" element={
                            <RoleBasedRoute allowedRoles={['ADMIN', 'ACCOUNTANT', 'SUPERVISOR']}>
                                <ReportsPage />
                            </RoleBasedRoute>
                        } />

                        <Route path="/settings" element={
                            <RoleBasedRoute allowedRoles={['ADMIN']}>
                                <SettingsPage />
                            </RoleBasedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    );
};
