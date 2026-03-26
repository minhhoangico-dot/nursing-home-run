import { useEffect, useState } from 'react';
import { useResidentsStore } from '../stores/residentsStore';
import { useRoomsStore } from '../stores/roomsStore';
import { useFinanceStore } from '../stores/financeStore';
import { useIncidentsStore } from '../stores/incidentsStore';
import { useAuthStore } from '../stores/authStore';
import { usePermissionStore } from '../stores/permissionStore';
import { useVisitorsStore } from '../stores/visitorsStore';

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
    const userId = user?.id;

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                await fetchUsers();

                const authenticatedUser = useAuthStore.getState().user;

                if (!authenticatedUser) {
                    return;
                }

                const [permissionsResult, dataResult] = await Promise.allSettled([
                    fetchPermissions(),
                    Promise.all([
                        fetchResidents(),
                        fetchMaintenanceRequests(),
                        fetchFinanceData(),
                        fetchIncidents(),
                        fetchVisitors(),
                    ]),
                ]);

                if (dataResult.status === 'rejected') {
                    throw dataResult.reason;
                }

                if (permissionsResult.status === 'rejected') {
                    console.error('Error fetching role permissions:', permissionsResult.reason);
                }
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
        fetchUsers,
        fetchVisitors,
        userId,
    ]);

    return { isLoading, error };
};
