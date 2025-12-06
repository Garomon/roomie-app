import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRoomieStatus } from "@/hooks/useRoomieStatus";
import { Roomie } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface RoomieStatusCardProps {
    roomie: Roomie;
    currentUserId?: string;
}

export default function RoomieStatusCard({ roomie, currentUserId }: RoomieStatusCardProps) {
    const { statusOption, loading } = useRoomieStatus(roomie.id);
    const isMe = currentUserId === roomie.id;

    const handleClick = () => {
        if (isMe) {
            // Trigger FAB click logically or just show instruction
            const fab = document.querySelector('button[aria-label="Toggle Status Menu"]'); // Hypothetical selector or just toast
            toast.info("Usa el botón flotante ↘️ para cambiar tu status");
        } else {
            if (statusOption) {
                toast(`${statusOption.emoji} ${roomie.name} está ${statusOption.label}`, {
                    description: statusOption.description,
                });
            }
        }
    };

    if (loading) return <div className="animate-pulse h-16 w-full bg-white/5 rounded-2xl" />;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={cn(
                "relative group overflow-hidden p-3 rounded-2xl transition-all border cursor-pointer",
                "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20"
            )}
        >
            <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                    <Avatar className={cn(
                        "h-10 w-10 border-2 transition-colors",
                        statusOption?.id === 'lady_alert' ? "border-red-500 shadow-md shadow-red-500/50" : "border-white/10 group-hover:border-white/30"
                    )}>
                        <AvatarImage src={roomie.avatar} />
                        <AvatarFallback>{roomie.name[0]}</AvatarFallback>
                    </Avatar>
                    {/* Status Dot */}
                    <div className={cn(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a1b26]",
                        statusOption?.color.replace('from-', 'bg-').split(' ')[0] || "bg-gray-500", // Fallback extraction of color
                        statusOption?.id === 'lady_alert' && "animate-pulse"
                    )} />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                        {roomie.name.split(' ')[0]}
                    </span>
                    <span className={cn(
                        "text-[11px] font-medium truncate",
                        statusOption?.id === 'available' ? "text-emerald-400" :
                            statusOption?.id === 'busy' ? "text-yellow-400" :
                                statusOption?.id === 'lady_alert' ? "text-red-400 font-bold" :
                                    "text-gray-400"
                    )}>
                        {statusOption?.label || "Desconocido"}
                    </span>
                </div>
            </div>

            {/* Ambient Background Glow based on status */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                statusOption?.color || "bg-gray-500"
            )} />
        </motion.div>
    );
}
