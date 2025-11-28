"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Payment } from "@/types";
import { ROOMIES } from "@/lib/bossLogic";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Calendar } from "lucide-react";

export default function PaymentHistory() {
    const { roomie: currentRoomie } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>("all");

    useEffect(() => {
        if (currentRoomie) fetchHistory();
    }, [currentRoomie]);

    const fetchHistory = async () => {
        try {
            // 1. Fetch Standard Payments (Rent, Pool)
            const { data: payments } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            // 2. Fetch Shared Expenses (Paid by anyone)
            const { data: expenses } = await supabase
                .from('expenses')
                .select('*')
                .order('created_at', { ascending: false });

            // 3. Fetch Splits (Debts paid by me or to me)
            // Actually, showing the main expense is usually enough context, 
            // but let's show "Paid Debt" if I paid a split.
            const { data: myPaidSplits } = await supabase
                .from('expense_splits')
                .select('*, expense:expenses(*)')
                .eq('owed_by', currentRoomie?.id)
                .eq('is_paid', true);

            // Normalize Data
            const normalizedPayments = (payments || []).map(p => ({
                id: `pay-${p.id}`,
                date: p.created_at,
                month: p.month_date,
                type: p.type,
                description: p.type === 'rent' ? 'Renta Mensual' : p.type === 'pool' ? 'Caja Común' : 'Pago',
                amount: p.amount,
                roomie_id: p.roomie_id,
                status: 'paid'
            }));

            const normalizedExpenses = (expenses || []).map(e => ({
                id: `exp-${e.id}`,
                date: e.created_at,
                month: e.date.slice(0, 7) + '-01',
                type: 'shared',
                description: e.description,
                amount: e.amount,
                roomie_id: e.paid_by,
                status: 'paid' // The expense itself is "paid" by the payer
            }));

            // Merge and Sort
            const allItems = [...normalizedPayments, ...normalizedExpenses].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setHistory(allItems);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique months for filter
    const months = Array.from(new Set(history.map(h => h.month))).sort().reverse();

    const filteredHistory = selectedMonth === "all"
        ? history
        : history.filter(h => h.month === selectedMonth);

    const getRoomieName = (id: string) => ROOMIES.find(r => r.id === id)?.name || "Desconocido";

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'rent': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Renta</Badge>;
            case 'pool': return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Caja</Badge>;
            case 'shared': return <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">Gasto</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <Card className="bg-black/20 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    Historial Global
                </CardTitle>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                        <SelectValue placeholder="Filtrar por mes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los meses</SelectItem>
                        {months.map(month => (
                            <SelectItem key={month} value={month}>
                                {month ? format(new Date(month), "MMMM yyyy", { locale: es }) : 'Sin fecha'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay movimientos registrados.
                    </div>
                ) : (
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Fecha</TableHead>
                                    <TableHead className="text-gray-400">Quién</TableHead>
                                    <TableHead className="text-gray-400">Concepto</TableHead>
                                    <TableHead className="text-right text-gray-400">Monto</TableHead>
                                    <TableHead className="text-center text-gray-400">Tipo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHistory.map((item) => (
                                    <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="text-gray-300">
                                            {format(new Date(item.date), "d MMM, h:mm a", { locale: es })}
                                        </TableCell>
                                        <TableCell className="font-medium text-white">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${ROOMIES.find(r => r.id === item.roomie_id)?.color || 'from-gray-500 to-gray-600'}`} />
                                                {getRoomieName(item.roomie_id)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {item.description}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-white">
                                            ${item.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getTypeBadge(item.type)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
