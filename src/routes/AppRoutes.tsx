import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ErrorBoundary, LoadingScreen } from '../components/ui';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';

const LoginPage = React.lazy(() =>
  import('../features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const DashboardPage = React.lazy(() =>
  import('../features/dashboard').then((module) => ({ default: module.DashboardPage })),
);
const ResidentListPage = React.lazy(() =>
  import('../features/residents/pages/ResidentListPage').then((module) => ({ default: module.ResidentListPage })),
);
const ResidentDetailPage = React.lazy(() =>
  import('../features/residents/pages/ResidentDetailPage').then((module) => ({ default: module.ResidentDetailPage })),
);
const RoomMapPage = React.lazy(() =>
  import('../features/rooms/pages/RoomMapPage').then((module) => ({ default: module.RoomMapPage })),
);
const IncidentsPage = React.lazy(() =>
  import('../features/incidents/pages/IncidentsPage').then((module) => ({ default: module.IncidentsPage })),
);
const NutritionPage = React.lazy(() =>
  import('../features/nutrition/pages/NutritionPage').then((module) => ({ default: module.NutritionPage })),
);
const VisitorsPage = React.lazy(() =>
  import('../features/visitors/pages/VisitorsPage').then((module) => ({ default: module.VisitorsPage })),
);
const DailyMonitoringPage = React.lazy(() =>
  import('../features/monitoring/pages/DailyMonitoringPage').then((module) => ({ default: module.DailyMonitoringPage })),
);
const MedicationsPage = React.lazy(() =>
  import('../features/prescriptions').then((module) => ({ default: module.MedicationsPage })),
);
const PrescriptionEditorPage = React.lazy(() =>
  import('../features/prescriptions').then((module) => ({ default: module.PrescriptionEditorPage })),
);
const MaintenancePage = React.lazy(() =>
  import('../features/maintenance/pages/MaintenancePage').then((module) => ({ default: module.MaintenancePage })),
);
const PrintFormsPage = React.lazy(() =>
  import('../features/print-forms/pages/PrintFormsPage').then((module) => ({ default: module.PrintFormsPage })),
);
const FinancePage = React.lazy(() =>
  import('../features/finance/pages/FinancePage').then((module) => ({ default: module.FinancePage })),
);
const SettingsPage = React.lazy(() =>
  import('../features/settings/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const ProfilePage = React.lazy(() =>
  import('../features/profile').then((module) => ({ default: module.ProfilePage })),
);
const ProceduresPage = React.lazy(() =>
  import('../features/procedures').then((module) => ({ default: module.ProceduresPage })),
);
const WeightTrackingPage = React.lazy(() =>
  import('../features/weight-tracking').then((module) => ({ default: module.WeightTrackingPage })),
);

const LoadingFallback = () => <LoadingScreen message="Đang tải..." />;

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route
                path="/residents"
                element={(
                  <PermissionRoute moduleKey="residents">
                    <ResidentListPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/residents/:id"
                element={(
                  <PermissionRoute moduleKey="residents">
                    <ResidentDetailPage />
                  </PermissionRoute>
                )}
              />

              <Route
                path="/rooms"
                element={(
                  <PermissionRoute moduleKey="rooms">
                    <RoomMapPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/nutrition"
                element={(
                  <PermissionRoute moduleKey="nutrition">
                    <NutritionPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/visitors"
                element={(
                  <PermissionRoute moduleKey="visitors">
                    <VisitorsPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/daily-monitoring"
                element={(
                  <PermissionRoute moduleKey="dailyMonitoring">
                    <DailyMonitoringPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/medications"
                element={(
                  <PermissionRoute moduleKey="medications">
                    <MedicationsPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/residents/:residentId/medications/new"
                element={(
                  <PermissionRoute moduleKey="medications">
                    <PrescriptionEditorPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/residents/:residentId/medications/:prescriptionId"
                element={(
                  <PermissionRoute moduleKey="medications">
                    <PrescriptionEditorPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/residents/:residentId/medications/:prescriptionId/duplicate"
                element={(
                  <PermissionRoute moduleKey="medications">
                    <PrescriptionEditorPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/procedures"
                element={(
                  <PermissionRoute moduleKey="procedures">
                    <ProceduresPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/weight-tracking"
                element={(
                  <PermissionRoute moduleKey="weightTracking">
                    <WeightTrackingPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/incidents"
                element={(
                  <PermissionRoute moduleKey="incidents">
                    <IncidentsPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/maintenance"
                element={(
                  <PermissionRoute moduleKey="maintenance">
                    <MaintenancePage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/forms"
                element={(
                  <PermissionRoute moduleKey="forms">
                    <PrintFormsPage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/finance"
                element={(
                  <PermissionRoute moduleKey="finance">
                    <FinancePage />
                  </PermissionRoute>
                )}
              />
              <Route
                path="/settings"
                element={(
                  <PermissionRoute moduleKey="settings">
                    <SettingsPage />
                  </PermissionRoute>
                )}
              />

              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/residents" replace />} />
            </Route>
          </Route>
        </Routes>
      </ErrorBoundary>
    </Suspense>
  );
};
