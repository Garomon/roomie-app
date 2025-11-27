"use client";

import { useEffect, useState } from "react";
import { getBossOfTheMonth, getDaysUntilRentDue, ROOMIES } from "@/lib/bossLogic";
import { Crown, Calendar, Wallet, ArrowRight } from "lucide-react";

export default function Dashboard() {
    const [boss, setBoss] = useState<any>(null);
    const [rentInfo, setRentInfo] = useState<any>(null);

    useEffect(() => {
        setBoss(getBossOfTheMonth());
        setRentInfo(getDaysUntilRentDue());
    }, []);

    if (!boss || !rentInfo) return <div className="p-8 text-center">Cargando Vibra Alta...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Boss Card */}
            <div className="glass-card p-6 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${boss.color} opacity-20 blur-2xl rounded-full -mr-10 -mt-10 transition-opacity group-hover:opacity-30`}></div>

                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Boss del Mes</h3>
                        <p className="text-2xl font-bold mt-1">{boss.name}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-br ${boss.color} shadow-lg shadow-purple-500/20`}>
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-300 mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Responsable de recolección
                    </div>
                    <p className="text-xs text-gray-500">Recibe pagos el día 30</p>
                </div>
            </div>

            {/* Rent Countdown */}
            <div className="glass-card p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 opacity-10 blur-2xl rounded-full -mr-10 -mt-10"></div>

                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Próximo Pago</h3>
                        <p className="text-4xl font-bold mt-1 text-gradient">{rentInfo.daysLeft} Días</p>
                    </div>
                    <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="mt-4">
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                        <div
                            className="bg-cyan-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.max(0, 100 - (rentInfo.daysLeft * 3.3))}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">Deadline: {rentInfo.dueDate.toLocaleDateString()}</p>
                </div>
            </div>

            {/* Common Box Status */}
            <div className="glass-card p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-10 blur-2xl rounded-full -mr-10 -mt-10"></div>

                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Caja Común</h3>
                        <p className="text-2xl font-bold mt-1">$1,500.00</p>
                    </div>
                    <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Wallet className="w-6 h-6" />
                    </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <p className="text-xs text-gray-500">3/3 Aportaciones</p>
                    <button className="text-xs flex items-center text-emerald-400 hover:text-emerald-300 transition-colors">
                        Ver Detalles <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
