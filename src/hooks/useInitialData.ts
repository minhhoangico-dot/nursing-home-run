import { useEffect, useState } from 'react';
import { useResidentsStore } from '../stores/residentsStore';
import { useRoomsStore } from '../stores/roomsStore';
import { useFinanceStore } from '../stores/financeStore';
import { useIncidentsStore } from '../stores/incidentsStore';
import { useAuthStore } from '../stores/authStore';
import { usePermissionStore } from '../stores/permissionStore';
import { useVisitorsStore } from '../stores/visitorsStore';
import { useAppSettingsStore } from '../stores/appSettingsStore';

export const useInitialData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { fetchResidents } = useResidentsStore();
    const { fetchMaintenanceRequests } = useRoomsStore();
    const { fetchFinanceData } = useFinanceStore();
    const { fetchIncidents } = useIncidentsStore();
    const { fetchUsers, user } = useAuthStore();
    const { fetchPermissions } = usePermissionStore();
    const { fetchVisitors } = useVisitorsStore();
    const fetchSettings = useAppSettingsStore(state => state.fetchSettings);
    const userId = user?.id;

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                await Promise.allSettled([
                    fetchSettings(),
                    fetchUsers(), // Always fetch users for login
                ]);

                const { lastLoadError } = useAppSettingsStore.getState();
                if (lastLoadError) {
                    console.warn('App settings unavailable, continuing with defaults', lastLoadError);
                }

                const authenticatedUser = useAuthStore.getState().user;

                if (!authenticatedUser) {
                    return;
                }

                await fetchPermissions();

                await Promise.all([
                    fetchResidents(),
                    fetchMaintenanceRequests(),
                    fetchFinanceData(),
                    fetchIncidents(),
                    fetchVisitors(),
                ]);
            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setIsLoading(false);
            }
        };

        void initData();
    }, [
        fetchFinanceData,
        fetchIncidents,
        fetchMaintenanceRequests,
        fetchPermissions,
        fetchResidents,
        fetchSettings,
        fetchUsers,
        fetchVisitors,
        userId,
    ]);

    return { isLoading, error };
};
