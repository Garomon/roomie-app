"use client";

import { useEffect, useState } from "react";
import { getBossOfTheMonth, getDaysUntilRentDue } from "@/lib/bossLogic";
import { Crown, Calendar, Wallet, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Roomie, RentInfo } from "@/types";

export default function Dashboard() {
    const [boss, setBoss] = useState<Roomie | null>(null);
    const [rentInfo, setRentInfo] = useState<RentInfo | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setBoss(getBossOfTheMonth());
        setRentInfo(getDaysUntilRentDue());
        setMounted(true);
    }, []);

    if (!mounted) return null;

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
                    {boss && (
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
                    )}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rent Countdown */}
                <motion.div variants={item}>
                    <Card className="h-full hover:border-cyan-500/30 transition-colors group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                                Próxima Renta
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-white mb-1">
                                {rentInfo?.daysLeft} <span className="text-lg font-normal text-gray-500">días</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Fecha límite: {rentInfo?.dueDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    No excuses
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Common Box */}
                <motion.div variants={item}>
                    <Card className="h-full hover:border-emerald-500/30 transition-colors group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">
                                Caja Común
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-white mb-1">
                                $1,500
                            </div>
                            <p className="text-xs text-gray-500">
                                $500 por persona / mes
                            </p>
                            <div className="mt-4">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Al corriente
                                </Badge>
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
