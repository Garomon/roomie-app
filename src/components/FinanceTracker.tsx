"use client";

import { useState, useEffect } from "react";
import { ROOMIES, getBossOfTheMonth } from "@/lib/bossLogic";
import { DollarSign, Sparkles } from "lucide-react";
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
import { useAuth } from "@/components/AuthProvider";
import SharedExpenses from "./SharedExpenses";
import PaymentHistory from "./PaymentHistory";
import dynamic from 'next/dynamic';
import ReceiptUpload from "./ReceiptUpload";
import { toast } from "sonner";

const FinanceCharts = dynamic(() => import('./FinanceCharts'), { ssr: false });

export default function FinanceTracker() {
    const { roomie: currentRoomie } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [serviceTotal, setServiceTotal] = useState("");
    const [boss, setBoss] = useState<Roomie | null>(null);

    useEffect(() => {
        fetchPayments();
        setBoss(getBossOfTheMonth());

        const channel = supabase
            .channel('payments_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'payments' },
                (payload) => {
                    console.log('Change received!', payload);
                    fetchPayments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchPayments = async () => {
        try {
            const { data } = await supabase.from('payments').select('*');
            if (data) setPayments(data as Payment[]);
        } catch (error) {
            console.error("Error fetching payments", error);
        }
    };

    const [receiptUrl, setReceiptUrl] = useState("");

    const markAsPaid = async (roomieId: string, amount: number, type: 'rent' | 'pool') => {
        try {
            await supabase.from('payments').insert([{
                roomie_id: roomieId,
                amount,
                status: 'paid',
                type,
                month_date: new Date().toISOString().slice(0, 8) + '01',
                receipt_url: receiptUrl || null
            }]);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#06B6D4', '#10B981', '#A855F7']
            });

            fetchPayments();
            setReceiptUrl(""); // Reset receipt
            toast.success("Pago registrado con éxito");
        } catch (error) {
            toast.error("Error al registrar pago");
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
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-black/40 border border-white/10 h-auto md:h-10">
                    <TabsTrigger value="rent">Renta</TabsTrigger>
                    <TabsTrigger value="services">Servicios</TabsTrigger>
                    <TabsTrigger value="pool">Caja</TabsTrigger>
                    <TabsTrigger value="shared">Compartidos</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                    <TabsTrigger value="charts">Gráficos</TabsTrigger>
                </TabsList>

                <TabsContent value="charts" className="mt-6">
                    <FinanceCharts />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <PaymentHistory />
                </TabsContent>

                <TabsContent value="shared" className="mt-6">
                    <SharedExpenses />
                </TabsContent>

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
                                        const isMe = currentRoomie?.id === roomie.id;

                                        return (
                                            <TableRow key={roomie.id} className="border-white/5">
                                                <TableCell className="font-medium text-white flex items-center gap-2">
                                                    <Avatar className="h-8 w-8 border border-white/10">
                                                        <AvatarImage src={roomie.avatar} />
                                                        <AvatarFallback>{roomie.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    {roomie.name}
                                                </TableCell>
                                                <TableCell className="text-gray-400">{roomie.hasCloset ? "Grande" : "Pequeño"}</TableCell>
                                                <TableCell className="text-right font-mono text-white">${roomie.rent.toLocaleString()}</TableCell>
                                                <TableCell className="text-center">
                                                    {status ? (
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Pagado</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500 border-gray-700">Pendiente</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!status && isMe && (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <ReceiptUpload onUploadComplete={setReceiptUrl} />
                                                            <Button
                                                                size="sm"
                                                                className="bg-white text-black hover:bg-gray-200"
                                                                onClick={() => markAsPaid(roomie.id, roomie.rent, 'rent')}
                                                                disabled={!receiptUrl}
                                                            >
                                                                Pagar Renta
                                                            </Button>
                                                        </div>
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
                                            ) : currentRoomie?.id === roomie.id ? (
                                                <div className="flex flex-col gap-2">
                                                    <ReceiptUpload onUploadComplete={setReceiptUrl} />
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => markAsPaid(roomie.id, 500, 'pool')}
                                                        disabled={!receiptUrl}
                                                    >
                                                        Pagar $500
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">Pendiente</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services" className="mt-6">
                    <div className="w-full max-w-4xl mx-auto text-center py-10">
                        <p className="text-gray-400">La calculadora ha sido eliminada por ser "una tontería".</p>
                        <p className="text-xs text-gray-600 mt-2">Usa "Compartidos" para dividir gastos.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
