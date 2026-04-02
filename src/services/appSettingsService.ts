import { supabase } from '../lib/supabase';

export const appSettingsService = {
  async fetchMany(keys: string[]) {
    const { data, error } = await supabase.from('app_settings').select('key, value').in('key', keys);

    if (error) {
      throw error;
    }

    return Object.fromEntries((data ?? []).map((row: { key: string; value: unknown }) => [row.key, row.value]));
  },

  async upsertSetting(key: string, value: unknown) {
    const { error } = await supabase.from('app_settings').upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    );

    if (error) {
      throw error;
    }
  },
};
