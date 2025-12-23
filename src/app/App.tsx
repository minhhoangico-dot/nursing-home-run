import React from 'react';
import { AppRoutes } from '../routes/AppRoutes';
import { AppProviders } from './providers';
import { useInitialData } from '../hooks/useInitialData';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingScreen } from '../components/ui';

function App() {
   const { isLoading, error } = useInitialData();

   if (isLoading) {
      return <LoadingScreen />;
   }

   if (error) {
      return (
         <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-red-500">
               Lỗi khởi tạo: {error.message}
            </div>
         </div>
      );
   }

   return (
      <AppProviders>
         <ErrorBoundary>
            <AppRoutes />
         </ErrorBoundary>
      </AppProviders>
   );
}

export default App;