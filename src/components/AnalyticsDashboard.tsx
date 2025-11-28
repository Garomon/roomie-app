"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MonthlyData {
    month: string;
    rent: number;
    pool: number;
    expenses: number;
}

export default function AnalyticsDashboard() {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // Fetch last 6 months of data
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const { data: payments } = await supabase
                .from('payments')
                .select('*')
                .gte('month_date', sixMonthsAgo.toISOString().split('T')[0]);

            const { data: expenses } = await supabase
                .from('expenses')
                .select('amount, date')
                .gte('date', sixMonthsAgo.toISOString().split('T')[0]);

            // Group by month
            const monthlyMap = new Map<string, MonthlyData>();

            payments?.forEach(payment => {
                const month = payment.month_date?.substring(0, 7) || '';
                if (!monthlyMap.has(month)) {
                    monthlyMap.set(month, { month, rent: 0, pool: 0, expenses: 0 });
                }
                const data = monthlyMap.get(month)!;
                if (payment.type === 'rent') data.rent += Number(payment.amount);
                if (payment.type === 'pool') data.pool += Number(payment.amount);
            });

            expenses?.forEach(expense => {
                const month = expense.date?.substring(0, 7) || '';
                if (!monthlyMap.has(month)) {
                    monthlyMap.set(month, { month, rent: 0, pool: 0, expenses: 0 });
                }
                const data = monthlyMap.get(month)!;
                data.expenses += Number(expense.amount);
            });

            const sortedData = Array.from(monthlyMap.values()).sort((a, b) =>
                a.month.localeCompare(b.month)
            );

            setMonthlyData(sortedData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalRent = monthlyData.reduce((sum, d) => sum + d.rent, 0);
    const totalPool = monthlyData.reduce((sum, d) => sum + d.pool, 0);
    const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
    const grandTotal = totalRent + totalPool + totalExpenses;

    if (loading) {
        return <div className="text-center text-gray-400">Cargando analytics...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Total (6 meses)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ${grandTotal.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Renta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ${totalRent.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Caja Común
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ${totalPool.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Gastos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ${totalExpenses.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="bar" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bar">Barras</TabsTrigger>
                    <TabsTrigger value="line">Líneas</TabsTrigger>
                </TabsList>

                <TabsContent value="bar" className="mt-6">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Tendencias Mensuales</CardTitle>
                            <CardDescription>Renta, Caja Común y Gastos por mes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                    <XAxis dataKey="month" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f1f1f',
                                            border: '1px solid #ffffff20',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="rent" fill="#06b6d4" name="Renta" />
                                    <Bar dataKey="pool" fill="#10b981" name="Caja Común" />
                                    <Bar dataKey="expenses" fill="#a855f7" name="Gastos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="line" className="mt-6">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Evolución en el Tiempo</CardTitle>
                            <CardDescription>Comparación de tendencias</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                    <XAxis dataKey="month" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f1f1f',
                                            border: '1px solid #ffffff20',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="rent" stroke="#06b6d4" strokeWidth={2} name="Renta" />
                                    <Line type="monotone" dataKey="pool" stroke="#10b981" strokeWidth={2} name="Caja Común" />
                                    <Line type="monotone" dataKey="expenses" stroke="#a855f7" strokeWidth={2} name="Gastos" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
