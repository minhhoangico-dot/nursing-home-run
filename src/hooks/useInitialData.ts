import { useEffect, useState } from 'react';
import { useResidentsStore } from '../stores/residentsStore';
import { useAuthStore } from '../stores/authStore';
import { usePermissionStore } from '../stores/permissionStore';
import { useAppSettingsStore } from '../stores/appSettingsStore';

export const useInitialData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { fetchResidents } = useResidentsStore();
    const { fetchUsers, user } = useAuthStore();
    const { fetchPermissions } = usePermissionStore();
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
        fetchPermissions,
        fetchResidents,
        fetchSettings,
        fetchUsers,
        userId,
    ]);

    return { isLoading, error };
};
