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
        fetchInitialActivity();

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
                    const newActivity: ActivityItem = {
                        id: `chore-${payload.new.id}`,
                        type: 'chore',
                        user_id: payload.new.assigned_to || 'unknown',
                        title: 'Tarea Completada',
                        description: `"${payload.new.task}" fue marcada como lista`,
                        created_at: new Date().toISOString()
                    };
                    addActivity(newActivity);
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'expenses' },
                (payload) => {
                    const roomie = ROOMIES.find(r => r.id === payload.new.paid_by);
                    const newActivity: ActivityItem = {
                        id: `exp-${payload.new.id}`,
                        type: 'manifesto', // Reusing icon for generic expense
                        user_id: payload.new.paid_by,
                        title: 'Nuevo Gasto',
                        description: `${roomie?.name.split(' ')[0]} registró: ${payload.new.description}`,
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

    const fetchInitialActivity = async () => {
        // Fetch last 5 payments
        const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch last 5 completed chores
        const { data: chores } = await supabase
            .from('chores')
            .select('*')
            .eq('completed', true)
            .order('completed_at', { ascending: false })
            .limit(5);

        // Fetch last 5 expenses
        const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        const paymentActivities: ActivityItem[] = (payments || []).map(p => ({
            id: `pay-${p.id}`,
            type: 'payment',
            user_id: p.roomie_id,
            title: 'Pago Registrado',
            description: `${ROOMIES.find(r => r.id === p.roomie_id)?.name.split(' ')[0]} pagó $${p.amount}`,
            created_at: p.created_at
        }));

        const choreActivities: ActivityItem[] = (chores || []).map(c => ({
            id: `chore-${c.id}`,
            type: 'chore',
            user_id: c.assigned_to || 'unknown',
            title: 'Tarea Completada',
            description: `"${c.task}" fue marcada como lista`,
            created_at: c.completed_at || c.created_at
        }));

        const expenseActivities: ActivityItem[] = (expenses || []).map(e => ({
            id: `exp-${e.id}`,
            type: 'manifesto',
            user_id: e.paid_by,
            title: 'Nuevo Gasto',
            description: `${ROOMIES.find(r => r.id === e.paid_by)?.name.split(' ')[0]} registró: ${e.description}`,
            created_at: e.created_at
        }));

        const allActivities = [...paymentActivities, ...choreActivities, ...expenseActivities]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);

        setActivities(allActivities);
    };

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
        <Card className="h-full bg-white/5 border-white/10 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Actividad Reciente
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0 relative">
                <div className="absolute inset-0">
                    <ScrollArea className="h-full w-full pr-4">
                        <div className="space-y-4 w-full max-w-full overflow-x-hidden">
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
                </div>
            </CardContent>
        </Card>
    );
}
