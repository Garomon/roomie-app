"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Roomie } from "@/types";
import { calculateReliabilityScore } from "@/lib/bossLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, DollarSign, Trophy, Sparkles, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { Pencil } from "lucide-react";

interface RoommateProfileProps {
    roomie: Roomie;
}

export default function RoommateProfile({ roomie }: RoommateProfileProps) {
    const { roomie: currentRoomie } = useAuth();
    const [stats, setStats] = useState({
        choresCompleted: 0,
        paymentsOnTime: 0,
        reliabilityScore: 95,
        nextChore: "Ninguna",
        debt: 0
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        nickname: roomie.name,
        avatar: roomie.avatar,
        bio: ''
    });

    const handleSaveProfile = async () => {
        if (!currentRoomie) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    nickname: editForm.nickname,
                    avatar_url: editForm.avatar,
                })
                .eq('roomie_id', roomie.id);

            if (error) throw error;

            toast.success("Perfil actualizado");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error al actualizar perfil");
        }
    };

    const fetchStats = async () => {
        // Fetch completed chores
        const { count: choresCount } = await supabase
            .from('chores')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', roomie.id)
            .eq('completed', true);

        // Fetch overdue chores
        const { count: overdueCount } = await supabase
            .from('chores')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', roomie.id)
            .eq('completed', false)
            .lt('due_date', new Date().toISOString());

        // Fetch NEXT pending chore
        const { data: nextChore } = await supabase
            .from('chores')
            .select('title, due_date')
            .eq('assigned_to', roomie.id)
            .eq('completed', false)
            .order('due_date', { ascending: true })
            .limit(1)
            .single();

        // Fetch payments
        const { count: paymentsCount } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('roomie_id', roomie.id)
            .eq('status', 'paid');

        // Fetch Debt (Expense Splits)
        const { data: debts } = await supabase
            .from('expense_splits')
            .select('amount')
            .eq('owed_by', roomie.id)
            .eq('is_paid', false);

        const totalDebt = debts?.reduce((sum, d) => sum + d.amount, 0) || 0;

        // Calculate real score
        const realScore = calculateReliabilityScore(overdueCount || 0);

        setStats({
            choresCompleted: choresCount || 0,
            paymentsOnTime: paymentsCount || 0,
            reliabilityScore: realScore,
            nextChore: nextChore?.title || "¡Todo limpio!",
            debt: totalDebt
        });
    };

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomie.id]);

    useEffect(() => {
        setEditForm({
            nickname: roomie.name,
            avatar: roomie.avatar,
            bio: ''
        });
    }, [roomie]);

    const isMe = currentRoomie?.id === roomie.id;

    return (
        <Card className="bg-black/40 backdrop-blur-md border-white/10 overflow-hidden relative group hover:border-cyan-500/50 transition-all duration-300 shadow-2xl">
            {/* Dynamic Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${roomie.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

            <CardHeader className="relative z-10 pb-2">
                <div className="flex justify-between items-start">
                    <div className="relative">
                        <Avatar className="h-20 w-20 border-2 border-white/20 shadow-xl ring-4 ring-black/50">
                            <AvatarImage src={roomie.avatar} className="object-cover" />
                            <AvatarFallback>{roomie.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            Lvl {Math.floor(stats.reliabilityScore / 10)}
                        </div>
                    </div>

                    {isMe && (
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle>Editar Perfil</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Apodo / Nombre</Label>
                                        <Input
                                            value={editForm.nickname}
                                            onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                                            className="bg-white/5 border-white/10 focus:border-cyan-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Avatar URL</Label>
                                        <Input
                                            value={editForm.avatar}
                                            onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                                            className="bg-white/5 border-white/10 focus:border-cyan-500"
                                        />
                                        <p className="text-xs text-gray-500">Usa una URL de imagen (ej. DiceBear)</p>
                                    </div>
                                    <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold">
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="mt-4">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        {roomie.name}
                        {stats.reliabilityScore === 100 && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400 bg-black/20">
                            {roomie.hasCloset ? "Master Suite" : "Habitación Standard"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6">
                {/* Reliability Bar */}
                <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-yellow-400" /> Reliability
                        </span>
                        <span className={`font-bold ${stats.reliabilityScore >= 90 ? 'text-emerald-400' : stats.reliabilityScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {stats.reliabilityScore}%
                        </span>
                    </div>
                    <Progress value={stats.reliabilityScore} className="h-2 bg-black/40" />
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-white/5 to-white/0 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1 uppercase tracking-wider">
                            <CalendarClock className="w-3 h-3 text-cyan-400" />
                            Siguiente Tarea
                        </div>
                        <p className="text-sm font-medium text-white line-clamp-2 leading-tight">
                            {stats.nextChore}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-white/5 to-white/0 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1 uppercase tracking-wider">
                            <DollarSign className="w-3 h-3 text-rose-400" />
                            Deuda Total
                        </div>
                        <p className={`text-lg font-bold ${stats.debt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ${stats.debt.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <div className="text-center w-1/2 border-r border-white/10">
                        <p className="text-xs text-gray-500 uppercase">Tareas Completadas</p>
                        <p className="text-lg font-bold text-white">{stats.choresCompleted}</p>
                    </div>
                    <div className="text-center w-1/2">
                        <p className="text-xs text-gray-500 uppercase">Pagos a Tiempo</p>
                        <p className="text-lg font-bold text-white">{stats.paymentsOnTime}</p>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
