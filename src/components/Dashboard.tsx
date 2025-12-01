"use client";

import { useEffect, useState } from "react";
import { getBossOfTheMonth, getDaysUntilRentDue, RentStatus, ROOMIES } from "@/lib/bossLogic";
import { Crown, Clock, PiggyBank, ArrowRight, Sparkles, Shield, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Roomie } from "@/types";
import { toast } from "sonner";
import ActivityFeed from "@/components/ActivityFeed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useRoomies } from "@/hooks/useRoomies";

export default function Dashboard() {
    const [boss, setCurrentBoss] = useState<Roomie | null>(null);
    const [rentInfo, setRentInfo] = useState<RentStatus | null>(null);
    const [commonBoxTotal, setCommonBoxTotal] = useState(0);
    const [rentCollected, setRentCollected] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [hasPaidRent, setHasPaidRent] = useState(false);
    const [paidPoolRoomies, setPaidPoolRoomies] = useState<string[]>([]);
    const [debugError, setDebugError] = useState<string | null>(null);

    const { roomie: currentRoomie, user, loading, signInWithGoogle, linkRoomie } = useAuth();
    const { roomies } = useRoomies();
    const [myPendingChores, setMyPendingChores] = useState(0);
    const [myDebt, setMyDebt] = useState(0);
    const [reliabilityScore, setReliabilityScore] = useState(100);

    const RENT_GOAL = 32000;
    const rentProgress = (rentCollected / RENT_GOAL) * 100;

    useEffect(() => {
        const boss = getBossOfTheMonth();
        const rent = getDaysUntilRentDue();

        setCurrentBoss(boss);
        setRentInfo(rent);
        setMounted(true);

        const fetchFinancials = async () => {
            const now = new Date();
            const currentMonthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

            // Calculate date range for the current month
            const year = now.getFullYear();
            const month = now.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 1).toISOString().split('T')[0];

            console.log("Checking rent for:", currentRoomie?.id, "Month:", currentMonthStr);

            // 1. Fetch Total Rent Collected
            const { data: rentPayments, error: rentError } = await supabase
                .from('payments')
                .select('amount')
                .eq('type', 'rent')
                .gte('month_date', startDate)
                .lt('month_date', endDate);

            if (rentError) {
                console.error("Rent Error:", rentError);
                setDebugError(rentError.message);
            }

            const totalRent = rentPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
            setRentCollected(totalRent);

            // 2. Fetch Common Box
            const { data: poolPayments, error: poolError } = await supabase
                .from('payments')
                .select('amount, roomie_id')
                .eq('type', 'pool')
                .gte('month_date', startDate)
                .lt('month_date', endDate);

            if (poolError) {
                console.error("Pool Error:", poolError);
                setDebugError(poolError.message);
            }

            const totalPool = poolPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
            setCommonBoxTotal(totalPool);

            // Store who has paid the pool
            const paidPoolIds = poolPayments?.map(p => p.roomie_id) || [];
            setPaidPoolRoomies(paidPoolIds);

            // 3. Check if *I* have paid rent this month
            if (currentRoomie) {
                const { data: myPayments } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('type', 'rent')
                    .eq('roomie_id', currentRoomie.id);

                const paidThisMonth = myPayments?.some(p => {
                    if (!p.month_date) return false;
                    return p.month_date.includes(currentMonthStr);
                });

                console.log("Has paid rent?", paidThisMonth);
                setHasPaidRent(!!paidThisMonth);

                fetchUserData(currentRoomie.id);
            }
        };

        fetchFinancials();

        const channel = supabase
            .channel('dashboard_payments')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'payments' },
                () => {
                    console.log("Payment change detected, refreshing dashboard...");
                    fetchFinancials();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentRoomie]);

    const fetchUserData = async (userId: string) => {
        const { count: choresCount } = await supabase
            .from('chores')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', userId)
            .eq('completed', false);

        setMyPendingChores(choresCount || 0);

        const { data: debts } = await supabase
            .from('expense_splits')
            .select('amount')
            .eq('owed_by', userId)
            .eq('is_paid', false);

        const totalDebt = debts?.reduce((sum, d) => sum + d.amount, 0) || 0;
        setMyDebt(totalDebt);

        // Calculate Reliability Score
        // Base: 100
        // -5 per overdue chore (assuming all pending are overdue for simplicity, or we check due_date)
        // For now, let's just say pending chores reduce score by 5.
        const score = Math.max(0, 100 - ((choresCount || 0) * 5));
        setReliabilityScore(score);
    };

    if (loading || !mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    // Case 1: Not Logged In
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <Card className="w-full max-w-md bg-white/5 border-white/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Roomie App V2</CardTitle>
                        <p className="text-gray-400">Inicia sesión para ver tu dashboard</p>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full bg-white text-black hover:bg-gray-200 font-bold"
                            onClick={signInWithGoogle}
                        >
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                            Continuar con Google
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Case 2: Logged In but Not Linked
    if (user && !currentRoomie) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <Card className="w-full max-w-md bg-white/5 border-white/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                            <UserCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">¡Casi listo!</CardTitle>
                        <CardDescription className="text-gray-400">
                            Para continuar, identifica quién eres en el departamento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {ROOMIES.map((r) => (
                            <Button
                                key={r.id}
                                variant="outline"
                                className="h-auto py-4 justify-start gap-4 border-white/10 hover:bg-white/5 hover:border-cyan-500/50 group"
                                onClick={() => linkRoomie(r.id)}
                            >
                                <Avatar className="h-10 w-10 border border-white/10 group-hover:border-cyan-500">
                                    <AvatarImage src={r.avatar} />
                                    <AvatarFallback>{r.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="font-bold text-white group-hover:text-cyan-400">{r.name}</p>
                                    <p className="text-xs text-gray-500">Seleccionar perfil</p>
                                </div>
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Manifesto Enforcement - DISABLED FOR BETA
    // if (typeof window !== 'undefined' && !localStorage.getItem("manifesto_signed")) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-black p-4">
    //             <Card className="w-full max-w-md bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
    //                 <CardHeader className="text-center">
    //                     <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/50">
    //                         <Shield className="w-8 h-8 text-red-400" />
    //                     </div>
    //                     <CardTitle className="text-2xl font-bold text-white">Acción Requerida</CardTitle>
    //                     <CardDescription className="text-gray-300">
    //                         Para acceder al Dashboard, primero debes leer y aceptar el <strong>Manifiesto Anzures</strong>.
    //                     </CardDescription>
    //                 </CardHeader>
    //                 <CardContent>
    //                     <Link href="/manifesto">
    //                         <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold">
    //                             Ir al Manifiesto 📜
    //                         </Button>
    //                     </Link>
    //                 </CardContent>
    //             </Card>
    //         </div>
    //     );
    // }

    if (!boss || !rentInfo) return null;

    const getUrgencyColor = (urgency: string) => {
        if (hasPaidRent) return 'text-emerald-400';
        switch (urgency) {
            case 'critical': return 'text-rose-500';
            case 'warning': return 'text-amber-500';
            default: return 'text-emerald-400';
        }
    };

    const getUrgencyBg = (urgency: string) => {
        if (hasPaidRent) return 'bg-emerald-500/10 border-emerald-500/20';
        switch (urgency) {
            case 'critical': return 'bg-rose-500/10 border-rose-500/20';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20';
            default: return 'bg-emerald-500/10 border-emerald-500/20';
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Hero Section */}
            <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/50 via-black to-cyan-900/50 p-8 border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <Badge variant="vibra" className="mb-4">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Vibra Alta
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-2 tracking-tight">
                            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{currentRoomie?.name || 'Roomie'}</span> (v2.5)
                        </h1>
                        <p className="text-gray-400 text-lg max-w-md">
                            {myPendingChores > 0
                                ? `Tienes ${myPendingChores} tareas pendientes y debes $${myDebt.toFixed(0)}.`
                                : "Todo al día. ¡Eres el MVP del departamento!"}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant="outline" className={`bg-white/5 border-white/10 ${reliabilityScore >= 90 ? 'text-emerald-400' : reliabilityScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                                Reliability Score: {reliabilityScore}%
                            </Badge>
                            {reliabilityScore < 80 && (
                                <span className="text-xs text-red-400 animate-pulse">¡Ponte las pilas!</span>
                            )}
                            {reliabilityScore === 100 && (
                                <div className="flex items-center gap-1 text-orange-500 animate-pulse">
                                    <span className="text-xs font-bold">Racha Perfecta</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177c-.342 2.558.46 5.233 2.173 7.019 1.712 1.79 4.152 2.519 6.579 1.992a1 1 0 00.717-1.529 7.175 7.175 0 01-1.386-4.777l.002-.018a1.902 1.902 0 01.292-1.156c.056-.092.109-.19.154-.292a7.65 7.65 0 00-2.09-8.165.75.75 0 00-.831-.115z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M7.838 10.588A3.75 3.75 0 0112 9a3.75 3.75 0 013.25 4.875 1.5 1.5 0 00-2.25 1.5c0 .414.336.75.75.75a.75.75 0 01.75.75v.75a2.25 2.25 0 11-4.5 0v-.75a.75.75 0 01.75-.75.75.75 0 00.75-.75 1.5 1.5 0 00-2.25-1.5 3.75 3.75 0 01-.912-2.037z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Boss Card */}
                    <div className="glass-card rounded-2xl p-6 w-full md:w-auto min-w-[300px] border-l-4 border-l-purple-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <Avatar className="h-16 w-16 border-2 border-purple-500 shadow-lg shadow-purple-500/20">
                                    <AvatarImage src={boss.avatar} />
                                    <AvatarFallback className="bg-purple-900 text-purple-200 text-xl">
                                        {boss.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 shadow-lg border border-black">
                                    <Crown className="w-4 h-4 text-black fill-black" />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">Boss del Mes</p>
                                <h3 className="text-xl font-bold text-white">{boss.name}</h3>
                                <p className="text-xs text-gray-500">Encargado de consolidar</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Meta Mensual</span>
                                <span className="text-white font-mono">${RENT_GOAL.toLocaleString()}</span>
                            </div>
                            <Progress value={rentProgress} className="h-2 bg-gray-800" />
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Recaudado: ${rentCollected.toLocaleString()}</span>
                                <span className="text-cyan-400">{rentProgress.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rent Countdown */}
                <motion.div
                    variants={item}
                    className="md:col-span-1"
                >
                    <Card className={`h-full relative overflow-hidden border ${getUrgencyBg(rentInfo.urgency)}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Clock className={`w-4 h-4 ${getUrgencyColor(rentInfo.urgency)}`} />
                                {hasPaidRent ? "Estatus Renta" : "Tiempo Restante"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-bold font-heading ${getUrgencyColor(rentInfo.urgency)}`}>
                                    {hasPaidRent ? "PAGADO" : rentInfo.daysLeft}
                                </span>
                                {!hasPaidRent && <span className="text-gray-400">días</span>}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {hasPaidRent ? "¡Ya pagaste! Todo cool." : rentInfo.statusMessage}
                            </p>
                            <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${hasPaidRent ? 'bg-emerald-500' : rentInfo.urgency === 'critical' ? 'bg-rose-500' : rentInfo.urgency === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: hasPaidRent ? "100%" : `${Math.max(0, Math.min(100, (rentInfo.daysLeft / 30) * 100))}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Common Box */}
                <motion.div variants={item} className="md:col-span-1">
                    <Card className="bg-white/5 border-white/10 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PiggyBank className="w-5 h-5 text-emerald-400" />
                                Caja Común
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-bold text-white">${commonBoxTotal.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Total acumulado este mes</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Progreso ($500 x 3)</span>
                                        <span>{((commonBoxTotal / 1500) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (commonBoxTotal / 1500) * 100)}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {roomies.map((roomie) => {
                                        const isPaid = paidPoolRoomies.includes(roomie.id);
                                        return (
                                            <div key={roomie.id} className="bg-white/5 p-2 rounded text-center border border-white/5">
                                                <div className={`w-2 h-2 rounded-full mx-auto mb-1 shadow-[0_0_8px_rgba(16,185,129,0.5)] ${isPaid ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-gray-600 shadow-none'}`} />
                                                <span className={`text-xs ${isPaid ? 'text-gray-300' : 'text-gray-600'}`}>{roomie.name.split(' ')[0]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item} className="md:col-span-1 flex flex-col h-full gap-6">
                    <Card className="bg-white/5 border-dashed border-white/10 flex-none">
                        <CardHeader>
                            <CardTitle className="text-lg text-white">Acciones Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/finance" className="block">
                                <Button className="w-full justify-between group" variant="secondary">
                                    Registrar Pago
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </Link>
                            <Link href="/manifesto" className="block">
                                <Button className="w-full justify-between group" variant="ghost">
                                    Leer Manifiesto
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <div className="h-[300px] min-h-0">
                        <ActivityFeed />
                    </div>
                </motion.div>
            </div>

        </motion.div>
    );
}
