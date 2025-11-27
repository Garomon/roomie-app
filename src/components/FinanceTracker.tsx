"use client";

import { useState, useEffect } from "react";
import { ROOMIES } from "@/lib/bossLogic";
import { DollarSign, CheckCircle, XCircle, Calculator, Wallet, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FinanceTracker() {
    const [serviceTotal, setServiceTotal] = useState("");
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const calculateServiceSplit = () => {
        const total = parseFloat(serviceTotal);
        if (isNaN(total)) return 0;
        return (total / 3).toFixed(2);
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*');

            if (error) throw error;
            if (data) setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (roomieId: string, amount: number, type: 'rent' | 'pool') => {
        try {
            const { error } = await supabase
                .from('payments')
                .insert([
                    {
                        roomie_id: roomieId,
                        amount: amount,
                        status: 'paid',
                        type: type,
                        month_date: new Date().toISOString().slice(0, 8) + '01' // First of current month
                    }
                ]);

            if (error) throw error;
            fetchPayments(); // Refresh
        } catch (error) {
            alert("Error al registrar pago");
            console.error(error);
        }
    };

    const getPaymentStatus = (roomieId: string, type: 'rent' | 'pool') => {
        // Simple check for current month
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        return payments.find(p =>
            p.roomie_id === roomieId &&
            p.type === type &&
            p.month_date.startsWith(currentMonth)
        );
    };

    return (
        <div className="space-y-8">
            {/* Rent Breakdown */}
            <section className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-green-400" />
                    Control de Renta
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-700">
                                <th className="p-3">Roomie</th>
                                <th className="p-3">Monto</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ROOMIES.map((roomie) => {
                                const payment = getPaymentStatus(roomie.id, 'rent');
                                const isPaid = !!payment;

                                return (
                                    <tr key={roomie.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                        <td className="p-3 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roomie.color}`}></div>
                                            {roomie.name}
                                        </td>
                                        <td className="p-3 font-mono">${roomie.rent.toLocaleString()}</td>
                                        <td className="p-3">
                                            {isPaid ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                                    Pagado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {!isPaid && (
                                                <button
                                                    onClick={() => markAsPaid(roomie.id, roomie.rent, 'rent')}
                                                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded transition-colors"
                                                >
                                                    Marcar Pagado
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="font-bold bg-white/5">
                                <td className="p-3">TOTAL</td>
                                <td className="p-3 font-mono">$32,000</td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Services Splitter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Calculator className="w-5 h-5 mr-2 text-cyan-400" />
                        Calculadora de Servicios
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">Ingresa el total de Luz, Agua, Gas e Internet.</p>

                    <div className="flex gap-4 mb-4">
                        <input
                            type="number"
                            placeholder="Total del recibo"
                            value={serviceTotal}
                            onChange={(e) => setServiceTotal(e.target.value)}
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {serviceTotal && (
                        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 text-center">
                            <p className="text-sm text-cyan-300 mb-1">A pagar por persona:</p>
                            <p className="text-3xl font-bold text-white">${calculateServiceSplit()}</p>
                        </div>
                    )}
                </section>

                {/* Common Box */}
                <section className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-purple-400" />
                        Caja Común (Pool)
                    </h2>

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-sm text-gray-400">Saldo Actual</p>
                            <p className="text-3xl font-bold text-white">$1,500.00</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Meta Mensual</p>
                            <p className="text-xl font-mono text-gray-300">$1,500.00</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {ROOMIES.map((roomie) => {
                            const isPaid = !!getPaymentStatus(roomie.id, 'pool');
                            return (
                                <div key={roomie.id} className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${roomie.color}`}></div>
                                        {roomie.name}
                                    </span>
                                    {isPaid ? (
                                        <span className="flex items-center text-green-400">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Pagado ($500)
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => markAsPaid(roomie.id, 500, 'pool')}
                                            className="text-xs text-gray-400 hover:text-white underline"
                                        >
                                            Marcar Pagado
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
