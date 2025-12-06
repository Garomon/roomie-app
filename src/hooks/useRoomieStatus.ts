import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { APP_CONFIG } from "@/lib/appConfig";
import { RoomieStatus, StatusType } from "@/types";

export function useRoomieStatus(roomieId: string) {
    const [status, setStatus] = useState<StatusType>("available");
    const [statusData, setStatusData] = useState<RoomieStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchStatus = async () => {
            try {
                const { data } = await supabase
                    .from("roomie_status")
                    .select("*")
                    .eq("roomie_id", roomieId)
                    .single();

                if (data && mounted) {
                    setStatus(data.status as StatusType);
                    setStatusData(data);
                }
            } catch (error) {
                console.error("Error fetching status:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchStatus();

        const channel = supabase
            .channel(`status_${roomieId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "roomie_status",
                    filter: `roomie_id=eq.${roomieId}`
                },
                (payload) => {
                    if (mounted && payload.new) {
                        setStatus((payload.new as RoomieStatus).status as StatusType);
                        setStatusData(payload.new as RoomieStatus);
                    }
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [roomieId]);

    const statusOption = APP_CONFIG.statusOptions.find(s => s.id === status);

    return {
        status,
        statusData,
        statusOption,
        loading
    };
}
