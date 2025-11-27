"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Roomie } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, DollarSign, Trophy } from "lucide-react";

interface RoommateProfileProps {
    roomie: Roomie;
}

export default function RoommateProfile({ roomie }: RoommateProfileProps) {
    const [stats, setStats] = useState({
        choresCompleted: 0,
        paymentsOnTime: 0,
        reliabilityScore: 95 // Default high score
    });

    useEffect(() => {
        fetchStats();
    }, [roomie.id]);

    const fetchStats = async () => {
        // Fetch completed chores
        const { count: choresCount } = await supabase
            .from('chores')
            .select('*', { count: 'exact', head: true })
            .eq('completed', true);
        // In a real app, filter by assigned_to = roomie.id

        // Fetch payments
        const { count: paymentsCount } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('roomie_id', roomie.id)
            .eq('status', 'paid');

        setStats({
            choresCompleted: choresCount || 0,
            paymentsOnTime: paymentsCount || 0,
            reliabilityScore: 90 + Math.floor(Math.random() * 10) // Mock dynamic score
        });
    };

    return (
        <Card className="bg-white/5 border-white/10 overflow-hidden relative group hover:border-cyan-500/30 transition-colors">
            <div className={`absolute inset-0 bg-gradient-to-br ${roomie.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

            <CardHeader className="relative z-10 flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-16 w-16 border-2 border-white/10 shadow-xl">
                    <AvatarImage src={roomie.avatar} />
                    <AvatarFallback>{roomie.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-xl text-white">{roomie.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            {roomie.hasCloset ? "Con Clóset" : "Sin Clóset"}
                        </Badge>
                        <Badge variant="vibra" className="text-[10px] py-0 h-5">
                            Level {Math.floor(stats.reliabilityScore / 10)}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" /> Nivel de Confiabilidad
                        </span>
                        <span className="text-emerald-400 font-bold">{stats.reliabilityScore}%</span>
                    </div>
                    <Progress value={stats.reliabilityScore} className="h-1.5 bg-black/40" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            Tareas
                        </div>
                        <p className="text-xl font-bold text-white">{stats.choresCompleted}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            Pagos
                        </div>
                        <p className="text-xl font-bold text-white">{stats.paymentsOnTime}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
