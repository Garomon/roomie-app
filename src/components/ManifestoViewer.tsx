"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Heart, Shield, Zap, Users } from "lucide-react";

export default function ManifestoViewer() {
    const sections = [
        {
            title: "Propósito",
            icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
            content: (
                <div className="space-y-2">
                    <p>Vivir juntos con buena vibra, claridad desde el inicio y cero malentendidos. La idea es que el departamento sea un HOGAR funcional donde todos podamos descansar y crecer profesionalmente.</p>
                    <p className="text-sm text-gray-400">Fecha de Lanzamiento: 25 de Noviembre de 2025 (Lets gooo!!)</p>
                    <p className="text-sm text-gray-400">Integrantes: Edgardo Montoya De Tellitu, James Thomas Kennedy y Alejandro Dorantes Andrade.</p>
                </div>
            )
        },
        {
            title: "I. The Finance Game: Renta y Billete",
            icon: <Zap className="w-5 h-5 text-yellow-400" />,
            content: (
                <div className="space-y-4">
                    <p>La renta se paga a tiempo, no excuses. El cobro se hace por el 'Boss' del Mes (Responsable de Consolidación) que rota para que el karma sea parejo.</p>

                    <div className="grid gap-2 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="flex justify-between border-b border-white/10 pb-1">
                            <span>Edgardo (Habitación con Baño y Estudio)</span>
                            <span className="font-mono text-cyan-400">$14,500.00</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1">
                            <span>James (Habitación con Clóset)</span>
                            <span className="font-mono text-cyan-400">$10,500.00</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1">
                            <span>Alejandro (Habitación sin Clóset)</span>
                            <span className="font-mono text-cyan-400">$7,000.00</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1">
                            <span>TOTAL RENTA MENSUAL</span>
                            <span className="font-mono text-emerald-400">$32,000.00</span>
                        </div>
                    </div>

                    <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                        <li><strong>Boss del Mes:</strong> Rota cada 3 meses. Recolecta $32,000 y paga el día 1.</li>
                        <li><strong>Deadline:</strong> El pago individual es el Día 30. Final e irrevocable.</li>
                        <li><strong>Servicios (1/3):</strong> Luz, Gas, Agua e Internet se dividen en partes iguales.</li>
                        <li><strong>Caja Común ($500):</strong> Primeros 5 días del mes. Intocable (Limpieza, insumos, básicos).</li>
                    </ul>
                </div>
            )
        },
        {
            title: "II. El Código de Orden y La Cocina",
            icon: <Shield className="w-5 h-5 text-purple-400" />,
            content: (
                <div className="space-y-3">
                    <p className="italic text-gray-400">"No Seas Roomie Mamon. Si lo usas, lo levantas. Si lo ensucias, lo limpias."</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                        <li><strong>Limpieza Pro:</strong> Semanal/Quincenal (se paga con la Caja Común).</li>
                        <li><strong>Cuarto de Servicio:</strong> Área Chill común. No es bodega ni habitación privada.</li>
                        <li><strong>Trastes:</strong> Se lavan INMEDIATAMENTE. Cero "dejar para después".</li>
                        <li><strong>Refrigerador:</strong> Comida marcada con nombre. Descarte obligatorio los domingos.</li>
                    </ul>
                </div>
            )
        },
        {
            title: "III. Cómo Evitar el Drama",
            icon: <Heart className="w-5 h-5 text-pink-400" />,
            content: (
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li><strong>Regla de Oro (No Drama):</strong> Háblalo directo y pronto. Cero chismes.</li>
                    <li><strong>Mediación Neutral:</strong> El tercero actúa como mediador si hay conflicto.</li>
                    <li><strong>Documento Vivo:</strong> Check-In oficial a los 6 meses para ajustes.</li>
                </ul>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <Badge variant="vibra" className="mb-2">Manifiesto Anzures</Badge>
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-white">
                    Vibra Alta
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Calle Leibnitz 37, Depto 3. El depa más cool de Anzures.
                </p>
            </div>

            <div className="grid gap-6">
                {sections.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:border-white/20 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                        {section.icon}
                                    </div>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-gray-300 leading-relaxed">
                                    {section.content}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <div className="flex -space-x-4">
                    {['A', 'E', 'J'].map((initial, i) => (
                        <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 border-4 border-black flex items-center justify-center font-bold text-white shadow-lg z-10 hover:z-20 hover:scale-110 transition-transform cursor-default">
                            {initial}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
