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
            content: "Vivir juntos con buena vibra, claridad desde el inicio y cero malentendidos. La idea es que el departamento sea un HOGAR funcional donde todos podamos descansar y crecer profesionalmente."
        },
        {
            title: "The Finance Game",
            icon: <Zap className="w-5 h-5 text-yellow-400" />,
            content: (
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li><strong>Renta:</strong> Se paga a tiempo, no excuses. Día 30 deadline.</li>
                    <li><strong>Boss del Mes:</strong> Rota cada 3 meses. Recolecta $32,000 y paga el día 1.</li>
                    <li><strong>Regla de Oro:</strong> Pago final e irrevocable. No 'pon mi parte'.</li>
                    <li><strong>Servicios:</strong> Se dividen entre 3 (Luz, Gas, Agua, Internet).</li>
                    <li><strong>Caja Común:</strong> $500/mes los primeros 5 días. Intocable para insumos.</li>
                </ul>
            )
        },
        {
            title: "Código de Orden",
            icon: <Shield className="w-5 h-5 text-purple-400" />,
            content: (
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li><strong>Limpieza:</strong> Si lo usas, lo levantas. Si lo ensucias, lo limpias.</li>
                    <li><strong>Cocina:</strong> Trastes se lavan INMEDIATAMENTE. Cero 'dejar para después'.</li>
                    <li><strong>Refrigerador:</strong> Comida marcada con nombre. Descarte los domingos.</li>
                    <li><strong>Limpieza Pro:</strong> Se paga con la Caja Común.</li>
                </ul>
            )
        },
        {
            title: "Cero Drama",
            icon: <Heart className="w-5 h-5 text-pink-400" />,
            content: (
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li><strong>Comunicación Directa:</strong> Si hay problema, háblalo directo. Cero chismes.</li>
                    <li><strong>Mediación:</strong> El tercer roomie actúa como juez neutral si es necesario.</li>
                    <li><strong>Check-In:</strong> Revisión oficial a los 6 meses.</li>
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
