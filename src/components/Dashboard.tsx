"use client";

import { useEffect, useState } from "react";
import { getBossOfTheMonth, getDaysUntilRentDue, RentStatus } from "@/lib/bossLogic";
import { Crown, Calendar, Wallet, ArrowRight, Sparkles, AlertCircle, CheckCircle2, Clock, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Roomie } from "@/types";
import { toast } from "sonner";

export default function Dashboard() {
    const [boss, setCurrentBoss] = useState<Roomie | null>(null);
    const [rentInfo, setRentInfo] = useState<RentStatus | null>(null);
    const [commonBoxTotal, setCommonBoxTotal] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const boss = getBossOfTheMonth();
        const rent = getDaysUntilRentDue();

        setCurrentBoss(boss);
        setRentInfo(rent);
        setCommonBoxTotal(1500); // Mock total
        setMounted(true);

        // Smart Alert System
        if (rent.urgency === 'critical') {
            toast.error(`¡Atención! Faltan ${rent.daysLeft} días para la renta.`, {
                description: "Evita ser el roomie moroso. Paga hoy.",
                duration: 5000,
            });
        } else if (rent.urgency === 'warning') {
            toast.warning(`Recordatorio: La renta vence en ${rent.daysLeft} días.`, {
                description: "Ve preparando la transferencia.",
            });
        }
    }, []);

    if (!mounted || !boss || !rentInfo) return null;

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'text-rose-500';
            case 'warning': return 'text-amber-500';
            default: return 'text-emerald-400';
        }
    };

    const getUrgencyBg = (urgency: string) => {
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
                            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Roomie</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-md">
                            Bienvenido al centro de comando del Depto 3. Aquí gestionamos el caos con estilo.
                        </p>
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
                                <span className="text-white font-mono">$32,000</span>
                            </div>
                            <Progress value={33} className="h-2 bg-gray-800" />
                            <p className="text-xs text-right text-cyan-400">En progreso...</p>
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
                                Tiempo Restante
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-bold font-heading ${getUrgencyColor(rentInfo.urgency)}`}>
                                    {rentInfo.daysLeft}
                                </span>
                                <span className="text-gray-400">días</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {rentInfo.statusMessage}
                            </p>
                            <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${rentInfo.urgency === 'critical' ? 'bg-rose-500' : rentInfo.urgency === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(0, Math.min(100, (rentInfo.daysLeft / 30) * 100))}%` }}
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
                                        <p className="text-sm text-gray-400">Total Acumulado</p>
                                        <p className="text-3xl font-bold font-heading text-white">$1,500</p>
                                    </div>
                                    <Badge variant="success">Meta Alcanzada</Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Progreso ($500 x 3)</span>
                                        <span>100%</span>
                                    </div>
                                    <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {['Alejandro', 'Edgardo', 'James'].map((name) => (
                                        <div key={name} className="bg-white/5 p-2 rounded text-center border border-white/5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto mb-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-xs text-gray-300">{name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item} className="md:col-span-1">
                    <Card className="h-full bg-white/5 border-dashed border-white/10">
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
                </motion.div>
            </div>
        </motion.div>
    );
}
