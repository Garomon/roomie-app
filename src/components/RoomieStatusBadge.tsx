"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { APP_CONFIG } from "@/lib/appConfig";
import { StatusType, RoomieStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoomieStatusBadgeProps {
    roomieId: string;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export default function RoomieStatusBadge({
    roomieId,
    size = "md",
    showLabel = false
}: RoomieStatusBadgeProps) {
    const [status, setStatus] = useState<StatusType>("available");

    useEffect(() => {
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
                    if (payload.new) {
                        setStatus((payload.new as RoomieStatus).status as StatusType);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomieId]);

    const fetchStatus = async () => {
        const { data } = await supabase
            .from("roomie_status")
            .select("status")
            .eq("roomie_id", roomieId)
            .single();

        if (data) {
            setStatus(data.status as StatusType);
        }
    };

    const statusOption = APP_CONFIG.statusOptions.find(s => s.id === status);

    const sizeClasses = {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
    };

    const pulseClass = status === "lady_alert" ? "animate-pulse" : "";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5">
                        <span
                            className={cn(
                                "rounded-full inline-block",
                                sizeClasses[size],
                                statusOption?.color || "bg-gray-500",
                                pulseClass
                            )}
                        />
                        {showLabel && (
                            <span className="text-xs text-gray-400">
                                {statusOption?.label}
                            </span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{statusOption?.emoji} {statusOption?.label}</p>
                    <p className="text-xs text-gray-400">{statusOption?.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
