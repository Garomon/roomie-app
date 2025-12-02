import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Roomie } from "@/types";

export interface FinancialData {
    rentCollected: number;
    commonBoxTotal: number;
    paidPoolRoomies: string[];
    hasPaidRent: boolean;
    myPendingChores: number;
    myDebt: number;
    reliabilityScore: number;
    loading: boolean;
    error: string | null;
}

export function useFinancials(currentRoomie: Roomie | null) {
    const [data, setData] = useState<FinancialData>({
        rentCollected: 0,
        commonBoxTotal: 0,
        paidPoolRoomies: [],
        hasPaidRent: false,
        myPendingChores: 0,
        myDebt: 0,
        reliabilityScore: 100,
        loading: true,
        error: null
    });

    const fetchFinancials = useCallback(async () => {
        if (!currentRoomie) return;

        try {
            const now = new Date();
            // Calculate date range for the current month
            const year = now.getFullYear();
            const month = now.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 1).toISOString().split('T')[0];
            const currentMonthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

            // 1. Fetch Total Rent Collected
            const { data: rentPayments, error: rentError } = await supabase
                .from('payments')
                .select('amount')
                .eq('type', 'rent')
                .gte('month_date', startDate)
                .lt('month_date', endDate);

            if (rentError) throw rentError;

            const totalRent = rentPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

            // 2. Fetch Common Box
            const { data: poolPayments, error: poolError } = await supabase
                .from('payments')
                .select('amount, roomie_id')
                .eq('type', 'pool')
                .gte('month_date', startDate)
                .lt('month_date', endDate);

            if (poolError) throw poolError;

            const totalPool = poolPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
            const paidPoolIds = poolPayments?.map(p => p.roomie_id) || [];

            // 3. Check if *I* have paid rent this month
            const { data: myPayments } = await supabase
                .from('payments')
                .select('*')
                .eq('type', 'rent')
                .eq('roomie_id', currentRoomie.id);

            const paidThisMonth = myPayments?.some(p => {
                if (!p.month_date) return false;
                return p.month_date.includes(currentMonthStr);
            });

            // 4. Fetch User Specific Data (Chores & Debt)
            const { count: choresCount } = await supabase
                .from('chores')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_to', currentRoomie.id)
                .eq('completed', false);

            const { data: debts } = await supabase
                .from('expense_splits')
                .select('amount')
                .eq('owed_by', currentRoomie.id)
                .eq('is_paid', false);

            const totalDebt = debts?.reduce((sum, d) => sum + d.amount, 0) || 0;

            // Calculate Reliability Score
            const score = Math.max(0, 100 - ((choresCount || 0) * 5));

            setData({
                rentCollected: totalRent,
                commonBoxTotal: totalPool,
                paidPoolRoomies: paidPoolIds,
                hasPaidRent: !!paidThisMonth,
                myPendingChores: choresCount || 0,
                myDebt: totalDebt,
                reliabilityScore: score,
                loading: false,
                error: null
            });

        } catch (error: any) {
            console.error("Error fetching financials:", error);
            setData(prev => ({ ...prev, loading: false, error: error.message }));
        }
    }, [currentRoomie]);

    useEffect(() => {
        if (currentRoomie) {
            fetchFinancials();

            const channel = supabase
                .channel('dashboard_payments_v2')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'payments' },
                    () => {
                        console.log("Payment change detected, refreshing financials...");
                        fetchFinancials();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            // If no roomie is logged in, we are not loading financials
            setData(prev => ({ ...prev, loading: false }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRoomie?.id, fetchFinancials]);

    return { ...data, refresh: fetchFinancials };
}
