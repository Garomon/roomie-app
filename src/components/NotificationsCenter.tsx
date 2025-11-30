"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    type: 'info' | 'warning' | 'success' | 'chore' | 'payment';
    created_at: string;
}

export default function NotificationsCenter() {
    const { roomie } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!roomie?.id) return;

        fetchNotifications();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `roomie_id=eq.${roomie.id}`
                },
                (payload) => {
                    console.log('Notification change:', payload);
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomie?.id]);

    const fetchNotifications = async () => {
        if (!roomie?.id) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('roomie_id', roomie.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data as Notification[]);
            setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
        }
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        if (!roomie?.id) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('roomie_id', roomie.id)
            .eq('is_read', false);

        fetchNotifications();
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'warning': return 'text-yellow-400';
            case 'success': return 'text-emerald-400';
            case 'chore': return 'text-cyan-400';
            case 'payment': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    if (!roomie) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-zinc-950 border-white/10" align="end">
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
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No hay notificaciones nuevas
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 hover:bg-white/5 transition-colors cursor-pointer",
                                        !notification.is_read && "bg-white/[0.02]"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 ${getIconColor(notification.type)}`}>
                                            <div className="h-2 w-2 rounded-full bg-current" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm font-medium text-white", !notification.is_read && "font-bold")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                            </p>
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
