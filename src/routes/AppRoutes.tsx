import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary, LoadingScreen } from '../components/ui';
import { MainLayout } from '../components/layout/MainLayout';
import { ModuleRoute, DefaultModuleRedirect } from './ModuleRoute';
import { ProtectedRoute } from './ProtectedRoute';

const LoginPage = React.lazy(() =>
  import('../features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const ResidentListPage = React.lazy(() =>
  import('../features/residents/pages/ResidentListPage').then((module) => ({
    default: module.ResidentListPage,
  }))
);
const ResidentDetailPage = React.lazy(() =>
  import('../features/residents/pages/ResidentDetailPage').then((module) => ({
    default: module.ResidentDetailPage,
  }))
);
const RoomMapPage = React.lazy(() =>
  import('../features/rooms/pages/RoomMapPage').then((module) => ({ default: module.RoomMapPage }))
);
const IncidentsPage = React.lazy(() =>
  import('../features/incidents/pages/IncidentsPage').then((module) => ({
    default: module.IncidentsPage,
  }))
);
const NutritionPage = React.lazy(() =>
  import('../features/nutrition/pages/NutritionPage').then((module) => ({
    default: module.NutritionPage,
  }))
);
const VisitorsPage = React.lazy(() =>
  import('../features/visitors/pages/VisitorsPage').then((module) => ({ default: module.VisitorsPage }))
);
const DailyMonitoringPage = React.lazy(() =>
  import('../features/monitoring/pages/DailyMonitoringPage').then((module) => ({
    default: module.DailyMonitoringPage,
  }))
);
const MaintenancePage = React.lazy(() =>
  import('../features/maintenance/pages/MaintenancePage').then((module) => ({
    default: module.MaintenancePage,
  }))
);
const PrintFormsPage = React.lazy(() =>
  import('../features/print-forms/pages/PrintFormsPage').then((module) => ({
    default: module.PrintFormsPage,
  }))
);
const FinancePage = React.lazy(() =>
  import('../features/finance/pages/FinancePage').then((module) => ({ default: module.FinancePage }))
);
const SettingsPage = React.lazy(() =>
  import('../features/settings/pages/SettingsPage').then((module) => ({ default: module.SettingsPage }))
);
const ProfilePage = React.lazy(() =>
  import('../features/profile').then((module) => ({ default: module.ProfilePage }))
);
const ProceduresPage = React.lazy(() =>
  import('../features/procedures').then((module) => ({ default: module.ProceduresPage }))
);
const WeightTrackingPage = React.lazy(() =>
  import('../features/weight-tracking').then((module) => ({ default: module.WeightTrackingPage }))
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
              <Route path="/" element={<DefaultModuleRedirect />} />

              <Route
                path="/residents"
                element={
                  <ModuleRoute moduleKey="residents">
                    <ResidentListPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/residents/:id"
                element={
                  <ModuleRoute moduleKey="residents">
                    <ResidentDetailPage />
                  </ModuleRoute>
                }
              />

              <Route
                path="/rooms"
                element={
                  <ModuleRoute moduleKey="rooms">
                    <RoomMapPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/nutrition"
                element={
                  <ModuleRoute moduleKey="nutrition">
                    <NutritionPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/visitors"
                element={
                  <ModuleRoute moduleKey="visitors">
                    <VisitorsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/daily-monitoring"
                element={
                  <ModuleRoute moduleKey="daily_monitoring">
                    <DailyMonitoringPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/procedures"
                element={
                  <ModuleRoute moduleKey="procedures">
                    <ProceduresPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/weight-tracking"
                element={
                  <ModuleRoute moduleKey="weight_tracking">
                    <WeightTrackingPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/incidents"
                element={
                  <ModuleRoute moduleKey="incidents">
                    <IncidentsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <ModuleRoute moduleKey="maintenance">
                    <MaintenancePage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/forms"
                element={
                  <ModuleRoute moduleKey="forms">
                    <PrintFormsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/finance"
                element={
                  <ModuleRoute moduleKey="finance">
                    <FinancePage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ModuleRoute moduleKey="settings">
                    <SettingsPage />
                  </ModuleRoute>
                }
              />

              <Route path="/profile" element={<ProfilePage />} />

              <Route path="*" element={<DefaultModuleRedirect />} />
            </Route>
          </Route>
        </Routes>
      </ErrorBoundary>
    </Suspense>
  );
};
