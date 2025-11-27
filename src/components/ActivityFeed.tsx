"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle2, DollarSign, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ROOMIES } from "@/lib/bossLogic";

interface ActivityItem {
    id: string;
    type: 'payment' | 'chore' | 'manifesto';
    user_id: string; // roomie_id
    title: string;
    description: string;
    created_at: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        // Initial fetch (mock for now, or fetch from a unified view if it existed)
        // For now, we'll just listen to new events to populate the feed live
        // In a real app, we'd fetch the last 10 events from a DB view.

        const channel = supabase
            .channel('roomie-activity')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'payments' },
                (payload) => {
                    const roomie = ROOMIES.find(r => r.id === payload.new.roomie_id);
                    const newActivity: ActivityItem = {
                        id: `pay-${payload.new.id}`,
                        type: 'payment',
                        user_id: payload.new.roomie_id,
                        title: 'Pago Registrado',
                        description: `${roomie?.name.split(' ')[0]} pagó $${payload.new.amount}`,
                        created_at: new Date().toISOString()
                    };
                    addActivity(newActivity);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chores', filter: 'completed=eq.true' },
                (payload) => {
                    // Note: Chores table might not have user_id if it's generic, 
                    // but assuming we might add it or just show "Tarea Completada"
                    const newActivity: ActivityItem = {
                        id: `chore-${payload.new.id}`,
                        type: 'chore',
                        user_id: 'unknown', // or fetch from payload if available
                        title: 'Tarea Completada',
                        description: `"${payload.new.task}" fue marcada como lista`,
                        created_at: new Date().toISOString()
                    };
                    addActivity(newActivity);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addActivity = (activity: ActivityItem) => {
        setActivities(prev => [activity, ...prev].slice(0, 10));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'payment': return <DollarSign className="w-4 h-4 text-emerald-400" />;
            case 'chore': return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
            default: return <Sparkles className="w-4 h-4 text-purple-400" />;
        }
    };

    return (
        <Card className="h-full bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Actividad Reciente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {activities.length === 0 ? (
                                <div className="text-center text-gray-500 py-8 text-sm">
                                    Esperando actividad en tiempo real...
                                </div>
                            ) : (
                                activities.map((item) => {
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-3 items-start pb-4 border-b border-white/5 last:border-0"
                                        >
                                            <div className="mt-1 p-1.5 rounded-full bg-white/5 border border-white/10">
                                                {getIcon(item.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-medium text-white">{item.title}</p>
                                                    <span className="text-[10px] text-gray-500">
                                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400">{item.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
