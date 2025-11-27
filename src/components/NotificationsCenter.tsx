"use client";

import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
    read: boolean;
    timestamp: Date;
}

// Mock initial notifications
const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        title: "Renta Próxima",
        message: "Faltan 5 días para el corte de renta.",
        type: "warning",
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
        id: "2",
        title: "Pago Recibido",
        message: "Edgardo ha pagado su parte de la renta.",
        type: "success",
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
        id: "3",
        title: "Nueva Tarea",
        message: "Se ha asignado 'Limpiar Baño' a James.",
        type: "info",
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
];

export function NotificationsCenter() {
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-black/95 border-white/10 backdrop-blur-xl" align="end">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h4 className="font-semibold text-white">Notificaciones</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-cyan-400 hover:text-cyan-300 h-auto p-0"
                            onClick={markAllAsRead}
                        >
                            Marcar leídas
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No tienes notificaciones</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 transition-colors hover:bg-white/5 ${!notification.read ? "bg-cyan-500/5" : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium ${!notification.read ? "text-white" : "text-gray-400"}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-gray-500">
                                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: es })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
