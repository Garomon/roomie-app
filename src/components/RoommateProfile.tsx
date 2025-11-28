"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Roomie } from "@/types";
import { calculateReliabilityScore } from "@/lib/bossLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, DollarSign, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RoommateProfileProps {
    roomie: Roomie;
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { Pencil } from "lucide-react";
import AnnualRentTracker from "./AnnualRentTracker";

export default function RoommateProfile({ roomie }: RoommateProfileProps) {
    const { roomie: currentRoomie } = useAuth();
    const [stats, setStats] = useState({
        choresCompleted: 0,
        paymentsOnTime: 0,
        reliabilityScore: 95 // Default high score
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
                    // bio: editForm.bio 
                })
                .eq('roomie_id', roomie.id);

            if (error) throw error;

            toast.success("Perfil actualizado");
            setIsEditing(false);
            // Ideally trigger a refresh here, but AuthProvider listener should handle it
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

        // Fetch overdue chores (active and past due date)
        const { count: overdueCount } = await supabase
            .from('chores')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', roomie.id)
            .eq('completed', false)
            .lt('due_date', new Date().toISOString());

        // Fetch payments
        const { count: paymentsCount } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('roomie_id', roomie.id)
            .eq('status', 'paid');

        // Calculate real score
        const realScore = calculateReliabilityScore(overdueCount || 0);

        setStats({
            choresCompleted: choresCount || 0,
            paymentsOnTime: paymentsCount || 0,
            reliabilityScore: realScore
        });
    };

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomie.id]);

    // Update form when roomie prop changes (e.g. after save)
    useEffect(() => {
        setEditForm({
            nickname: roomie.name,
            avatar: roomie.avatar,
            bio: ''
        });
    }, [roomie]);

    const isMe = currentRoomie?.id === roomie.id;

    return (
        <Card className="bg-white/5 border-white/10 overflow-hidden relative group hover:border-cyan-500/30 transition-colors">
            <div className={`absolute inset-0 bg-gradient-to-br ${roomie.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

            <CardHeader className="relative z-10 flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-16 w-16 border-2 border-white/10 shadow-xl">
                    <AvatarImage src={roomie.avatar} />
                    <AvatarFallback>{roomie.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-white">{roomie.name}</CardTitle>
                        {isMe && (
                            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                                        <Pencil className="w-3 h-3" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-900 border-white/10 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Editar Perfil</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Apodo / Nombre</Label>
                                            <Input
                                                value={editForm.nickname}
                                                onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Avatar URL</Label>
                                            <Input
                                                value={editForm.avatar}
                                                onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                                                className="bg-black/20 border-white/10"
                                            />
                                            <p className="text-xs text-gray-500">Usa una URL de imagen (ej. DiceBear)</p>
                                        </div>
                                        <Button onClick={handleSaveProfile} className="w-full bg-purple-600 hover:bg-purple-700">
                                            Guardar Cambios
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
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

                <div className="pt-4">
                    <AnnualRentTracker roomie={roomie} />
                </div>
            </CardContent>
        </Card >
    );
}
