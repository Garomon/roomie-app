import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ROOMIES } from "@/lib/bossLogic";
import { Roomie } from "@/types";

export function useRoomies() {
    const [roomies, setRoomies] = useState<Roomie[]>(ROOMIES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoomies();

        // Subscribe to changes in profiles
        const channel = supabase
            .channel('roomies-update')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => {
                    fetchRoomies();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchRoomies = async () => {
        try {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('roomie_id, nickname, avatar_url, bio');

            if (profiles) {
                const updatedRoomies = ROOMIES.map(staticRoomie => {
                    // Find matching profile in DB
                    const profile = profiles.find(p => p.roomie_id === staticRoomie.id);

                    if (profile) {
                        return {
                            ...staticRoomie,
                            name: profile.nickname || staticRoomie.name,
                            avatar: profile.avatar_url || staticRoomie.avatar,
                            // We can add bio to the Roomie type if needed, or handle it separately
                            // For now, we just update name and avatar which are in the Roomie interface
                        };
                    }
                    return staticRoomie;
                });
                setRoomies(updatedRoomies);
            }
        } catch (error) {
            console.error("Error fetching roomies:", error);
        } finally {
            setLoading(false);
        }
    };

    return { roomies, loading, refreshRoomies: fetchRoomies };
}
