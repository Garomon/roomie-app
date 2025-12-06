"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Coffee, Moon, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { APP_CONFIG } from "@/lib/appConfig";
import { StatusType, RoomieStatus } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_ICONS = {
    available: CheckCircle2,
    lady_alert: Heart,
    busy: Coffee,
    dnd: Moon,
};

const STATUS_COLORS = {
    available: "from-green-500 to-emerald-600",
    lady_alert: "from-red-500 to-pink-600",
    busy: "from-yellow-500 to-orange-500",
    dnd: "from-gray-500 to-gray-700",
};

export default function RoomieStatusFAB() {
    const { roomie: authRoomie } = useAuth();
    // Use first roomie as default if not logged in (for demo purposes)
    const currentRoomie = authRoomie || { id: 'alejandro', name: 'Alejandro' };
    const [isOpen, setIsOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<StatusType>("available");
    const [allStatuses, setAllStatuses] = useState<RoomieStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch current status on mount
    useEffect(() => {
        fetchStatus();
        const unsubscribe = subscribeToChanges();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentRoomie.id]);

    const fetchStatus = async () => {
        const { data, error } = await supabase
            .from("roomie_status")
            .select("*");

        if (data && !error) {
            setAllStatuses(data);
            const myStatus = data.find((s) => s.roomie_id === currentRoomie?.id);
            if (myStatus) {
                setCurrentStatus(myStatus.status as StatusType);
            }
        }
    };

    const subscribeToChanges = () => {
        const channel = supabase
            .channel("roomie_status_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "roomie_status" },
                (payload) => {
                    fetchStatus();
                    // Show toast if someone else changed their status
                    if (payload.new && (payload.new as RoomieStatus).roomie_id !== currentRoomie?.id) {
                        const newStatus = payload.new as RoomieStatus;
                        const roomie = APP_CONFIG.roomies.find(r => r.id === newStatus.roomie_id);
                        const statusOption = APP_CONFIG.statusOptions.find(s => s.id === newStatus.status);
                        if (roomie && statusOption) {
                            toast.info(`${statusOption.emoji} ${roomie.name}: ${statusOption.label}`);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const updateStatus = async (newStatus: StatusType) => {
        setIsLoading(true);

        const { error } = await supabase
            .from("roomie_status")
            .upsert({
                roomie_id: currentRoomie.id,
                status: newStatus,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'roomie_id' });

        if (error) {
            toast.error("Error al actualizar status");
            console.error(error);
        } else {
            setCurrentStatus(newStatus);
            const statusOption = APP_CONFIG.statusOptions.find(s => s.id === newStatus);
            toast.success(`${statusOption?.emoji} Status: ${statusOption?.label}`);

            // Send push notification if Lady Alert
            if (newStatus === "lady_alert") {
                sendLadyAlertNotification();
            }
        }

        setIsLoading(false);
        setIsOpen(false);
    };

    const sendLadyAlertNotification = async () => {
        try {
            await fetch("/api/push/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: currentRoomie?.id,
                    title: "🔴 Lady Alert!",
                    message: `${currentRoomie?.name} activó Lady Alert 😏`,
                    url: "/",
                }),
            });
        } catch (err) {
            console.error("Failed to send push", err);
        }
    };

    const CurrentIcon = STATUS_ICONS[currentStatus];
    const currentColor = STATUS_COLORS[currentStatus];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-20 right-0 glass-panel rounded-2xl p-4 w-64 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold">Mi Status</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {APP_CONFIG.statusOptions.map((option) => {
                                const Icon = STATUS_ICONS[option.id as StatusType];
                                const isActive = currentStatus === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => updateStatus(option.id as StatusType)}
                                        disabled={isLoading}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                                            isActive
                                                ? "bg-gradient-to-r " + STATUS_COLORS[option.id as StatusType] + " text-white"
                                                : "bg-white/5 hover:bg-white/10 text-gray-300"
                                        )}
                                    >
                                        <span className="text-xl">{option.emoji}</span>
                                        <div className="text-left">
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-xs opacity-70">{option.description}</div>
                                        </div>
                                        {isActive && <Icon className="h-4 w-4 ml-auto" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Other roomies status */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-400 mb-2">Otros roomies:</p>
                            <div className="flex gap-2">
                                {allStatuses
                                    .filter(s => s.roomie_id !== currentRoomie?.id)
                                    .map(status => {
                                        const roomie = APP_CONFIG.roomies.find(r => r.id === status.roomie_id);
                                        const option = APP_CONFIG.statusOptions.find(o => o.id === status.status);
                                        return (
                                            <div
                                                key={status.roomie_id}
                                                className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-1"
                                                title={`${roomie?.name}: ${option?.label}`}
                                            >
                                                <span className="text-sm">{option?.emoji}</span>
                                                <span className="text-xs text-gray-400">
                                                    {roomie?.name.split(' ')[0]}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative h-16 w-16 rounded-full shadow-lg flex items-center justify-center",
                    "bg-gradient-to-r",
                    currentColor,
                    currentStatus === "lady_alert" && "animate-pulse"
                )}
            >
                <CurrentIcon className="h-7 w-7 text-white" />

                {/* Ping animation for lady_alert */}
                {currentStatus === "lady_alert" && (
                    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                )}
            </motion.button>
        </div>
    );
}
