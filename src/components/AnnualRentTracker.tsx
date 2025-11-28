"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { Roomie } from "@/types";
import { TrendingDown, Calendar } from "lucide-react";

interface AnnualRentTrackerProps {
    roomie: Roomie;
}

export default function AnnualRentTracker({ roomie }: AnnualRentTrackerProps) {
    const [paidAmount, setPaidAmount] = useState(0);
    const [loading, setLoading] = useState(true);

    const annualRent = roomie.rent * 12;
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchAnnualPayments = async () => {
            const { data } = await supabase
                .from('payments')
                .select('amount')
                .eq('roomie_id', roomie.id)
                .eq('type', 'rent')
                .ilike('month_date', `${currentYear}%`);

            const total = data?.reduce((sum, p) => sum + p.amount, 0) || 0;
            setPaidAmount(total);
            setLoading(false);
        };

        fetchAnnualPayments();
    }, [roomie.id, currentYear]);

    const remaining = annualRent - paidAmount;
    const progress = (paidAmount / annualRent) * 100;

    if (loading) return <div className="h-24 animate-pulse bg-white/5 rounded-xl" />;

    return (
        <Card className="bg-black/20 border-white/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Meta Anual {currentYear}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-2xl font-bold text-white">${remaining.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Restante por pagar</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-emerald-400 font-medium flex items-center justify-end gap-1">
                                <TrendingDown className="w-3 h-3" />
                                {progress.toFixed(0)}%
                            </p>
                            <p className="text-xs text-gray-500">Completado</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Progress value={progress} className="h-2 bg-gray-800" />
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider">
                            <span>Enero</span>
                            <span>Diciembre</span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-between text-xs">
                        <span className="text-gray-400">Total Anual:</span>
                        <span className="text-white font-mono">${annualRent.toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
