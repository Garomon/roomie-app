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
import ServicesTracker from "./ServicesTracker";
import { generateMonthlyReport } from "@/lib/pdfGenerator";
import { Download } from "lucide-react";
import { APP_CONFIG, formatCurrency } from "@/lib/appConfig";

const FinanceCharts = dynamic(() => import('./FinanceCharts'), { ssr: false });

export default function FinanceTracker() {
    const { roomie: currentRoomie } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [serviceTotal, setServiceTotal] = useState("");
    const [boss, setBoss] = useState<Roomie | null>(null);

    const [services, setServices] = useState({
        electricity: "",
        gas: "",
        water: "",
        internet: ""
    });

    const handleExport = () => {
        const currentMonth = new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' });

        // Convert services object to array for PDF generator if needed, or just pass the totals
        // The generateMonthlyReport function expects: roomies, payments, expenses, monthName
        // We might need to adjust generateMonthlyReport to accept services data or we can pass it as "expenses"
        // For now, let's assume we want to include services in the report.
        // We'll create "Expense" objects for the services to pass them in.

        const serviceExpenses = [
            { name: 'Luz (CFE)', amount: parseFloat(services.electricity) || 0 },
            { name: 'Gas', amount: parseFloat(services.gas) || 0 },
            { name: 'Agua', amount: parseFloat(services.water) || 0 },
            { name: 'Internet', amount: parseFloat(services.internet) || 0 },
        ].filter(e => e.amount > 0);

        generateMonthlyReport(ROOMIES, payments, serviceExpenses, currentMonth);
        toast.success("Reporte descargado");
    };

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

    const markAsPaid = async (roomieId: string, amount: number, type: 'rent' | 'pool' | 'landlord') => {
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

            // Broadcast Push Notification
            const roomieName = ROOMIES.find(r => r.id === roomieId)?.name || "Alguien";
            const typeLabel = type === 'rent' ? 'Renta' : type === 'pool' ? 'Caja Común' : 'Pago al Casero';

            fetch("/api/push/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: currentRoomie?.id,
                    title: "Pago Registrado 💸",
                    message: `${roomieName} pagó $${amount} de ${typeLabel}`,
                    url: "/finance"
                })
            }).catch(err => console.error("Error broadcasting push:", err));
        } catch (error) {
            toast.error("Error al registrar pago");
        }
    };

    const getPaymentStatus = (roomieId: string, type: 'rent' | 'pool' | 'landlord') => {
        const currentMonth = new Date().toISOString().slice(0, 8) + '01';
        return payments.find(p =>
            p.roomie_id === roomieId &&
            p.type === type &&
            p.month_date === currentMonth
        );
    };

    const servicePerPerson = serviceTotal ? (parseFloat(serviceTotal) / 3).toFixed(2) : "0.00";
    const isBoss = currentRoomie?.id === boss?.id;

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
                <div className="flex gap-2 items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 hover:bg-white/10"
                        onClick={handleExport}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Reporte PDF
                    </Button>
                    {boss && (
                        <Badge variant="vibra" className="text-sm py-1 px-3">
                            Boss Actual: {boss.name}
                        </Badge>
                    )}
                </div>
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
                    {/* Boss Landlord Payment Section */}
                    {boss && currentRoomie?.id === boss.id && (
                        <Card className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border-purple-500/50 shadow-lg shadow-purple-900/20 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <CardHeader className="relative z-10">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                                        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                                    </div>
                                    Panel del Boss: Pago al Casero
                                </CardTitle>
                                <CardDescription className="text-gray-300 text-lg">
                                    Misión: Juntar los <span className="font-bold text-white">{formatCurrency(APP_CONFIG.finance.totalRent)}</span> y pagar antes del día {APP_CONFIG.finance.landlordPaymentDay}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                {getPaymentStatus(boss.id, 'landlord') ? (
                                    <div className="flex items-center gap-4 text-emerald-400 bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="font-bold text-xl">¡Renta Pagada al Casero! Misión Cumplida.</span>
                                        {getPaymentStatus(boss.id, 'landlord')?.receipt_url && (
                                            <a
                                                href={getPaymentStatus(boss.id, 'landlord')?.receipt_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-auto text-sm underline hover:text-emerald-300 font-medium"
                                            >
                                                Ver Comprobante
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center justify-between p-6 bg-black/40 rounded-xl border border-white/10">
                                            <span className="text-gray-300 text-lg">Monto Total a Pagar:</span>
                                            <span className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                                {formatCurrency(APP_CONFIG.finance.totalRent)}
                                            </span>
                                        </div>
                                        <div className="flex items-end gap-4">
                                            <div className="flex-1">
                                                <ReceiptUpload onUploadComplete={setReceiptUrl} bucketName="receipts" />
                                            </div>
                                            <Button
                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-12 px-8 shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                                                disabled={!receiptUrl}
                                                onClick={() => markAsPaid(boss.id, APP_CONFIG.finance.totalRent, 'landlord')}
                                            >
                                                Confirmar Pago al Casero 🏠
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-white/10 bg-black/20">
                        <CardHeader>
                            <CardTitle>Desglose de Renta</CardTitle>
                            <CardDescription>Total a recaudar: {formatCurrency(APP_CONFIG.finance.totalRent)} MXN (Día {APP_CONFIG.finance.paymentDeadlineDay})</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-gray-400">Roomie</TableHead>
                                        <TableHead className="text-right text-gray-400">Monto</TableHead>
                                        <TableHead className="text-center text-gray-400">Estado</TableHead>
                                        <TableHead className="text-right text-gray-400">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ROOMIES.map((roomie) => {
                                        const status = getPaymentStatus(roomie.id, 'rent');

                                        return (
                                            <TableRow key={roomie.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                                <TableCell className="font-medium text-white flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-cyan-500/50 transition-all">
                                                        <AvatarImage src={roomie.avatar} />
                                                        <AvatarFallback>{roomie.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="group-hover:text-cyan-400 transition-colors">{roomie.name}</span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-white text-lg">${roomie.rent.toLocaleString()}</TableCell>
                                                <TableCell className="text-center">
                                                    {status ? (
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-3 py-1">Pagado</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500 border-gray-700 px-3 py-1">Pendiente</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!status && isBoss && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-white text-black hover:bg-gray-200 font-medium"
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
                            <CardTitle>Caja Común ({formatCurrency(APP_CONFIG.finance.commonFund)}/mes)</CardTitle>
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
                                            ) : isBoss ? (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => markAsPaid(roomie.id, APP_CONFIG.finance.commonFund, 'pool')}
                                                >
                                                    Marcar Pagado
                                                </Button>
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
                    <ServicesTracker services={services} setServices={setServices} />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
