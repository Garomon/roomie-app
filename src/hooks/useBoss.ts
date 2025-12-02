import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateBoss, BossConfig, DEFAULT_BOSS_CONFIG, ROOMIES } from '@/lib/bossLogic';
import { Roomie } from '@/types';
import { toast } from 'sonner';

export function useBoss() {
    const [config, setConfig] = useState<BossConfig>(DEFAULT_BOSS_CONFIG);
    const [currentBoss, setCurrentBoss] = useState<Roomie>(calculateBoss(DEFAULT_BOSS_CONFIG));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();

        // Subscribe to changes
        const channel = supabase
            .channel('app_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'app_settings',
                    filter: 'key=eq.boss_config'
                },
                (payload) => {
                    const newConfig = payload.new.value as BossConfig;
                    setConfig(newConfig);
                    setCurrentBoss(calculateBoss(newConfig));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'boss_config')
                .single();

            if (error) throw error;

            if (data) {
                const fetchedConfig = data.value as BossConfig;
                setConfig(fetchedConfig);
                setCurrentBoss(calculateBoss(fetchedConfig));
            }
        } catch (error) {
            console.error('Error fetching boss config:', error);
            // Fallback to default is already set
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async (newConfig: BossConfig) => {
        // Optimistic update
        setConfig(newConfig);
        setCurrentBoss(calculateBoss(newConfig));

        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({
                    key: 'boss_config',
                    value: newConfig,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success("Configuración del Boss actualizada");
        } catch (error) {
            console.error('Error updating boss config:', error);
            toast.error("Error al actualizar configuración");
            // Revert on error
            fetchConfig();
        }
    };

    return {
        currentBoss,
        config,
        updateConfig,
        loading,
        roomies: ROOMIES
    };
}
