"use client";

import { useState, useEffect } from "react";
import { ROOMIES, getBossOfTheMonth } from "@/lib/bossLogic";
import { DollarSign, CheckCircle2, ArrowUpRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Payment, Roomie } from "@/types";
import confetti from "canvas-confetti";

export default function FinanceTracker() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [serviceTotal, setServiceTotal] = useState("");
    const [boss, setBoss] = useState<Roomie | null>(null);

    useEffect(() => {
        fetchPayments();
        setBoss(getBossOfTheMonth());
    }, []);

    const fetchPayments = async () => {
        try {
            const { data, error } = await supabase.from('payments').select('*');
            if (data) setPayments(data as Payment[]);
        } catch (error) {
            console.error("Error fetching payments", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (roomieId: string, amount: number, type: 'rent' | 'pool') => {
        try {
            await supabase.from('payments').insert([{
                roomie_id: roomieId,
                amount,
                status: 'paid',
                type,
                month_date: new Date().toISOString().slice(0, 8) + '01'
            }]);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#06B6D4', '#10B981', '#A855F7']
            });

            fetchPayments();
        } catch (error) {
            alert("Error al registrar pago");
        }
    };

    const getPaymentStatus = (roomieId: string, type: 'rent' | 'pool') => {
        const currentMonth = new Date().toISOString().slice(0, 8) + '01';
        return payments.find(p =>
            p.roomie_id === roomieId &&
            p.type === type &&
            p.month_date === currentMonth
        );
    };

    const servicePerPerson = serviceTotal ? (parseFloat(serviceTotal) / 3).toFixed(2) : "0.00";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-white">The Finance Game</h2>
                    <p className="text-gray-400">Regla de Oro: El pago es final e irrevocable.</p>
                </div>
                {boss && (
                    <Badge variant="vibra" className="text-sm py-1 px-3">
                        Boss Actual: {boss.name}
                    </Badge>
                )}
            </div>

            <Tabs defaultValue="rent" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10">
                    <TabsTrigger value="rent">Renta Mensual</TabsTrigger>
                    <TabsTrigger value="services">Servicios (1/3)</TabsTrigger>
                    <TabsTrigger value="pool">Caja Común</TabsTrigger>
                </TabsList>

                <TabsContent value="rent" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Desglose de Renta</CardTitle>
                            <CardDescription>Total a recaudar: $32,000 MXN (Día 30)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-gray-400">Roomie</TableHead>
                                        <TableHead className="text-gray-400">Espacio</TableHead>
                                        <TableHead className="text-right text-gray-400">Monto</TableHead>
                                        <TableHead className="text-center text-gray-400">Estado</TableHead>
                                        <TableHead className="text-right text-gray-400">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ROOMIES.map((roomie) => {
                                        const status = getPaymentStatus(roomie.id, 'rent');
                                        return (
                                            <TableRow key={roomie.id} className="border-white/10 hover:bg-white/5">
                                                <TableCell className="font-medium text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${roomie.color}`} />
                                                        {roomie.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-400">
                                                    {roomie.hasCloset ? "Con Clóset" : "Sin Clóset"}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-white">
                                                    ${roomie.rent.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {status ? (
                                                        <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                            Pagado
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500 border-gray-700">
                                                            Pendiente
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!status && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="hover:bg-cyan-500/20 hover:text-cyan-400"
                                                            onClick={() => markAsPaid(roomie.id, roomie.rent, 'rent')}
                                                        >
                                                            Marcar Pagado
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pool" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Caja Común ($500/mes)</CardTitle>
                            <CardDescription>Fondo para insumos de limpieza y emergencias.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {ROOMIES.map((roomie) => {
                                    const status = getPaymentStatus(roomie.id, 'pool');
                                    return (
                                        <div key={roomie.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={roomie.avatar} />
                                                    <AvatarFallback>{roomie.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-white">{roomie.name}</p>
                                                    <p className="text-xs text-gray-500">Cuota Mensual</p>
                                                </div>
                                            </div>
                                            {status ? (
                                                <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                    Pagado
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => markAsPaid(roomie.id, 500, 'pool')}
                                                >
                                                    Pagar $500
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services" className="mt-6">
                    <div className="w-full max-w-4xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Calculadora de División</CardTitle>
                                <CardDescription>Ingresa el total del recibo para dividirlo entre 3.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Monto del Recibo</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="pl-9 text-lg"
                                            value={serviceTotal}
                                            onChange={(e) => setServiceTotal(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-gray-400">A pagar por persona:</span>
                                        <span className="text-3xl font-bold text-cyan-400">${servicePerPerson}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {ROOMIES.map((roomie) => {
                                            // For services, we might want a different tracking or just use 'pool' as generic shared expense?
                                            // For now, let's keep the UI simple as a calculator
                                            return (
                                                <div key={roomie.id} className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col items-center text-center gap-2">
                                                    <Avatar className="h-12 w-12 border-2 border-white/10">
                                                        <AvatarImage src={roomie.avatar} />
                                                        <AvatarFallback>{roomie.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-white">{roomie.name.split(' ')[0]}</p>
                                                        <p className="text-sm text-cyan-400">${servicePerPerson}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Tip de Convivencia
                                        </h4>
                                        <p className="text-sm text-gray-300">
                                            Suban el comprobante al grupo de WhatsApp inmediatamente después de pagar.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
