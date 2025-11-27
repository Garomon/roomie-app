import { Shield, DollarSign, Users, Home } from "lucide-react";

export default function ManifestoViewer() {
    return (
        <div className="space-y-8">
            {/* Intro */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-purple-500">
                <h2 className="text-3xl font-bold mb-4">VIBRA ALTA: EL MANIFIESTO ANZURES</h2>
                <p className="text-gray-300 leading-relaxed">
                    Propósito: Vivir juntos con buena vibra, claridad desde el inicio y cero malentendidos.
                    La idea es que el departamento sea un HOGAR funcional donde todos podamos descansar y crecer profesionalmente.
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                    <span>📍 Calle Leibnitz 37, Depto 3</span>
                    <span>🚀 Launch: 25 Nov 2025</span>
                </div>
            </div>

            {/* Section I: Finance */}
            <section className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">I. THE FINANCE GAME</h3>
                </div>

                <div className="space-y-6 text-gray-300">
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-bold text-white mb-2">Regla de Oro del Pago</h4>
                        <p>El pago de la renta individual al 'Boss' (Día 30) es final e irrevocable. No hay espacio para "pon mi parte y te repongo después".</p>
                    </div>

                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li><strong className="text-white">Servicios (1/3):</strong> Luz, Gas, Agua e Internet se dividen equitativamente.</li>
                        <li><strong className="text-white">Caja Común:</strong> $500 MXN mensuales (primeros 5 días) para insumos y limpieza.</li>
                        <li><strong className="text-white">Bonus Anual:</strong> El saldo positivo se divide o se gasta en una peda épica.</li>
                    </ul>
                </div>
            </section>

            {/* Section II: Order */}
            <section className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
                        <Home className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">II. CÓDIGO DE ORDEN</h3>
                </div>

                <div className="space-y-6 text-gray-300">
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-bold text-white mb-2">Cocina y Trastes</h4>
                        <p>Si cocinas, lavas. Los trastes sucios se lavan inmediatamente. Cero "dejar para después".</p>
                    </div>

                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li><strong className="text-white">Limpieza Pro:</strong> Se contrata limpieza semanal/quincenal.</li>
                        <li><strong className="text-white">Refrigerador:</strong> Comida marcada con nombre o uso general.</li>
                        <li><strong className="text-white">Descarte:</strong> Alimentos caducados se tiran los domingos.</li>
                    </ul>
                </div>
            </section>

            {/* Section III: Harmony */}
            <section className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">III. CERO DRAMA</h3>
                </div>

                <div className="space-y-4 text-gray-300">
                    <p>
                        <strong className="text-white">Comunicación Directa:</strong> Si hay un problema, háblalo directo. Cero chismes.
                    </p>
                    <p>
                        <strong className="text-white">Mediación:</strong> El tercer roomie actúa como mediador neutral si es necesario.
                    </p>
                    <p>
                        <strong className="text-white">Check-In:</strong> Revisión oficial a los 6 meses.
                    </p>
                </div>
            </section>
        </div>
    );
}
