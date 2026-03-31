import { useEffect, useState } from 'react';
import { useResidentsStore } from '../stores/residentsStore';
import { useRoomsStore } from '../stores/roomsStore';
import { useFinanceStore } from '../stores/financeStore';
import { useIncidentsStore } from '../stores/incidentsStore';
import { useAuthStore } from '../stores/authStore';
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
    const { fetchVisitors } = useVisitorsStore();
    const fetchSettings = useAppSettingsStore(state => state.fetchSettings);

    useEffect(() => {
        const initData = async () => {
            try {
                await Promise.allSettled([
                    fetchSettings(),
                    fetchUsers(), // Always fetch users for login
                ]);

                const { lastLoadError } = useAppSettingsStore.getState();
                if (lastLoadError) {
                    console.warn('App settings unavailable, continuing with defaults', lastLoadError);
                }

                if (user) {
                    await Promise.all([
                        fetchResidents(),
                        fetchMaintenanceRequests(),
                        fetchFinanceData(),
                        fetchIncidents(),
                        fetchVisitors(),
                    ]);
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setIsLoading(false);
            }
        };

        if (user !== undefined) {
            // Only run if user state is resolved? 
            // Zustand persist hydration? 
            // For now assuming user is available or null from start.
            initData();
        }
    }, [user]);

    return { isLoading, error };
};
