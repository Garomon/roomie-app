"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ROOMIES } from "@/lib/bossLogic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Loader2, PieChart as PieIcon, BarChart3 } from "lucide-react";

export default function FinanceCharts() {
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [roomieData, setRoomieData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Expenses
            const { data: expenses } = await supabase
                .from('expenses')
                .select('*');

            // Process Category Data
            const categories: Record<string, number> = {};
            expenses?.forEach((exp: any) => {
                const cat = exp.category || 'other';
                categories[cat] = (categories[cat] || 0) + exp.amount;
            });

            const pieData = Object.keys(categories).map(key => ({
                name: formatCategory(key),
                value: categories[key]
            }));
            setCategoryData(pieData);

            // Process Roomie Spending Data (Who paid what)
            const roomieSpending: Record<string, number> = {};
            expenses?.forEach((exp: any) => {
                roomieSpending[exp.paid_by] = (roomieSpending[exp.paid_by] || 0) + exp.amount;
            });

            const barData = ROOMIES.map(r => ({
                name: r.name.split(' ')[0],
                amount: roomieSpending[r.id] || 0,
                fill: getRoomieColorHex(r.id)
            }));
            setRoomieData(barData);

        } catch (error) {
            console.error("Error fetching chart data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCategory = (cat: string) => {
        const map: Record<string, string> = {
            'food': 'Comida',
            'services': 'Servicios',
            'fun': 'Diversión',
            'other': 'Otros'
        };
        return map[cat] || cat;
    };

    const getRoomieColorHex = (id: string) => {
        // Approximate hex colors matching the tailwind gradients
        switch (id) {
            case 'alejandro': return '#3B82F6'; // Blue
            case 'edgardo': return '#A855F7'; // Purple
            case 'james': return '#EF4444'; // Red
            default: return '#10B981';
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart: Categories */}
            <Card className="bg-black/20 border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <PieIcon className="w-5 h-5 text-purple-400" />
                        Gastos por Categoría
                    </CardTitle>
                    <CardDescription>¿En qué se nos va el dinero?</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No hay datos suficientes
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bar Chart: Roomie Spending */}
            <Card className="bg-black/20 border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        ¿Quién ha pagado más?
                    </CardTitle>
                    <CardDescription>Total aportado en gastos compartidos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={roomieData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Aportado']}
                            />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {roomieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
