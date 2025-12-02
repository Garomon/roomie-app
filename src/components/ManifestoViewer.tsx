"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Shield, Zap } from "lucide-react";
import BiometricCommitment from "@/components/BiometricCommitment";
import { APP_CONFIG, formatCurrency } from "@/lib/appConfig";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ManifestoViewer() {
    const { user } = useAuth();

    const handleCommit = async () => {
        try {
            // Always set local storage for immediate feedback/offline
            localStorage.setItem("manifesto_signed", "true");

            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ manifesto_signed_at: new Date().toISOString() })
                    .eq('id', user.id);

                if (error) {
                    console.error("Error updating profile:", error);
                    // Don't block the user if backend fails, just log it
                }
            }

            toast.success("¡Compromiso sellado! Bienvenido a la tribu.");

            // Small delay for the toast to be seen
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);

        } catch (error) {
            console.error("Error in commitment:", error);
            window.location.href = "/";
        }
    };

    const sections = [
        {
            title: "Propósito",
            icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
            content: (
                <div className="space-y-4">
                    <p>Vivir juntos con buena vibra, claridad desde el inicio y cero malentendidos. La idea es que el departamento sea un HOGAR funcional donde todos podamos descansar y crecer profesionalmente.</p>
                    <div className="text-sm text-gray-400 space-y-1">
                        <p><strong>Fecha de Lanzamiento:</strong> {APP_CONFIG.launchDate} (Lets gooo!!)</p>
                        <p><strong>Integrantes:</strong> {APP_CONFIG.roomies.map(r => r.fullName).join(", ")}.</p>
                    </div>
                </div>
            )
        },
        {
            title: "I. THE FINANCE GAME: RENTA Y BILLETE",
            icon: <Zap className="w-5 h-5 text-yellow-400" />,
            content: (
                <div className="space-y-6">
                    <p>La renta se paga a tiempo, no excuses. El cobro se hace por el &apos;Boss&apos; del Mes (Responsable de Consolidación) que rota para que el karma sea parejo.</p>

                    <div className="grid gap-3 text-sm bg-black/20 p-4 rounded-lg border border-white/5">
                        <div className="grid gap-3 text-sm bg-black/20 p-4 rounded-lg border border-white/5">
                            <div className="grid grid-cols-12 gap-2 border-b border-white/10 pb-2 font-bold text-gray-400">
                                <div className="col-span-4">Residente</div>
                                <div className="col-span-4">Espacio Asignado</div>
                                <div className="col-span-4 text-right">Renta Individual</div>
                            </div>
                            {APP_CONFIG.roomies.map((roomie) => (
                                <div key={roomie.id} className="grid grid-cols-12 gap-2 border-b border-white/10 pb-2 items-center">
                                    <div className="col-span-4">{roomie.name}</div>
                                    <div className="col-span-4 text-xs">{roomie.room}</div>
                                    <div className="col-span-4 text-right font-mono text-cyan-400">{formatCurrency(roomie.rent)}</div>
                                </div>
                            ))}
                            <div className="grid grid-cols-12 gap-2 font-bold pt-1 items-center">
                                <div className="col-span-8">TOTAL RENTA MENSUAL</div>
                                <div className="col-span-4 text-right font-mono text-emerald-400">{formatCurrency(APP_CONFIG.finance.totalRent)}</div>
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-2">Fecha Límite de Pago al &apos;Boss&apos;: Día {APP_CONFIG.finance.paymentDeadlineDay} de cada mes</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-white">A. El &apos;Boss&apos; del Mes (Protocolo Dinámico)</h3>
                        <ul className="list-decimal list-inside space-y-2 text-gray-300 pl-2">
                            <li><strong>Flexibilidad:</strong> El sistema permite dos modos: <em>Rotación Automática</em> (lo estándar) o <em>Boss Fijo</em> (si alguien quiere aventarse el tiro por más tiempo). Esto se configura democráticamente en la App.</li>
                            <li><strong>Rotación:</strong> En modo rotación, ser el Boss significa que te toca juntar la lana ({formatCurrency(APP_CONFIG.finance.totalRent)} MXN) de la renta y los servicios. La responsabilidad rota mensualmente.</li>
                            <li><strong>Deadline:</strong> El Boss del Mes debe asegurar que el pago total llegue al Arrendador el Día {APP_CONFIG.finance.landlordPaymentDay} de cada mes (No se puede fallar!).</li>
                            <li><strong>Ciclo de Rotación Fijo:</strong> Este es el calendario para el rol de Boss. El ciclo empieza con Alejandro:
                                <ul className="list-disc list-inside pl-6 mt-1 space-y-1 text-sm">
                                    {APP_CONFIG.bossRotation.slice(0, 3).map((rotation) => {
                                        const roomie = APP_CONFIG.roomies.find(r => r.id === rotation.roomieId);
                                        return (
                                            <li key={rotation.month}>
                                                {roomie?.name}: Meses {rotation.month}, {rotation.month + 3}, {rotation.month + 6}, {rotation.month + 9}...
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-white">B. REGLA DE ORO DEL PAGO (Cero Tolerancia)</h3>
                        <p className="text-gray-300">El pago de la renta individual al &apos;Boss&apos; (Día {APP_CONFIG.finance.paymentDeadlineDay}) es final e irrevocable. No hay espacio para &quot;pon mi parte y te repongo después&quot; o &quot;me faltan 5 días&quot;. El Boss necesita el dinero COMPLETO en tiempo y forma para pagar el día {APP_CONFIG.finance.landlordPaymentDay}, sin tener que poner su propio dinero o perseguir el pago.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-white">C. Servicios Fijos (La División 1/3)</h3>
                        <ul className="list-decimal list-inside space-y-2 text-gray-300 pl-2">
                            <li><strong>Conceptos:</strong> Luz (CFE), Gas, Agua e Internet.</li>
                            <li><strong>Reparto:</strong> El costo total de los servicios se divide en partes totalmente iguales (1/3). Cuentas claras, amistades largas.</li>
                            <li><strong>Responsable:</strong> El Boss del Mes también recolecta los pagos de servicios y hace las transferencias.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-white">D. La Caja Común (El Pool de Insumos)</h3>
                        <ul className="list-decimal list-inside space-y-2 text-gray-300 pl-2">
                            <li><strong>Aportación:</strong> Cada uno pone {formatCurrency(APP_CONFIG.finance.commonFund)} MXN (monto sujeto a ajuste) a esta caja los primeros 5 días del mes.</li>
                            <li><strong>Uso Exclusivo (Regla de Oro):</strong> Este fondo es INTOCABLE y solo se utiliza para los gastos comunes especificados a continuación:
                                <ul className="list-disc list-inside pl-6 mt-1 space-y-1 text-sm">
                                    <li>Servicios de Limpieza: Pago al servicio de limpieza semanal contratado.</li>
                                    <li>Insumos de baños: Papel higiénico y jabón de manos.</li>
                                    <li>Insumos de cocina: Jabón para lavar trastes, esponjas nuevas, limpiador de superficies, bolsas de basura grandes.</li>
                                    <li>Básicos Comunes: Café(si aplica), sal, azúcar, aceite de cocina, y especias generales (si se acuerda).</li>
                                </ul>
                            </li>
                            <li><strong>El Bonus Anual:</strong> Si al final del año (12 meses) existe un saldo positivo en la caja común, el pool se dividirá equitativamente entre los tres, o se gastará en algo compartido (ej. una peda, una cena épica, unas damas o todo junto).</li>
                            <li><strong>Control:</strong> El Tesorero de la Caja Común será el mismo &apos;Boss&apos; del Mes en turno. Se encargará de llevar un tracking transparente en la APP.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "II. EL CÓDIGO DE ORDEN Y LA COCINA (No Seas Roomie Mamon)",
            icon: <Shield className="w-5 h-5 text-purple-400" />,
            content: (
                <div className="space-y-6">
                    <p className="italic text-gray-400">La regla es simple: Si lo usas, lo levantas. Si lo ensucias, lo limpias.</p>

                    <div className="space-y-2">
                        <h3 className="font-bold text-white">A. Limpieza de Áreas Comunes</h3>
                        <ul className="list-decimal list-inside space-y-2 text-gray-300 pl-2">
                            <li><strong>Limpieza Pro:</strong> Contrataremos a alguien para la limpieza semanal o quincenal para habitaciones, baños y áreas compartidas (se paga con la Caja Común).</li>
                            <li><strong>Cuarto de Servicio (Área Chill):</strong> Es de uso común para hangout, visitas, ver TV, o uso para los 3 roomies, no uso privado como habitacion o bodega.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-white">B. Cocina y Trastes</h3>
                        <ul className="list-decimal list-inside space-y-2 text-gray-300 pl-2">
                            <li><strong>Trastes:</strong> Si cocinas, lavas. Los trastes sucios se lavan inmediatamente. Cero &quot;dejar para después&quot; o acumular e irse a dormir.</li>
                            <li><strong>Refrigerador:</strong> La comida debe estar marcada con tu nombre o de uso general para evitar malentendidos (y confusiones).</li>
                            <li><strong>Descarte:</strong> Los alimentos caducados se tiran. La limpieza de este tema es obligatoria y compartida cada domingo por la noche.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "III. CÓMO EVITAR EL DRAMA Y EL CHECK-IN",
            icon: <Heart className="w-5 h-5 text-pink-400" />,
            content: (
                <div className="space-y-4">
                    <ul className="list-decimal list-inside space-y-2 text-gray-300 pl-2">
                        <li><strong>Regla de Oro (No Drama):</strong> Si hay un problema, háblalo directo con la persona involucrada lo antes posible. Cero chismes, cero acumular rencores.</li>
                        <li><strong>Mediación Neutral:</strong> Si dos roomies se traban en un conflicto, el tercero actuará como mediador neutral. El objetivo es siempre que la casa funcione en paz.</li>
                        <li><strong>Revisión del Manifiesto (Documento Vivo):</strong> Este acuerdo es contingente y se adapta a la convivencia. Si algo no está funcionando o se necesita un cambio, se puede convocar una Junta de Revisión/Check-In en cualquier momento. Adicionalmente, haremos un Check-In oficial a los 6 meses para revisar las dinámicas, gastos y ajustes.</li>
                    </ul>
                </div>
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
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                        <Card className="hover:border-cyan-500/30 transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 group">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-4 text-xl md:text-2xl font-heading tracking-wide">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/50">
                                        {section.icon}
                                    </div>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-cyan-200 group-hover:to-white transition-all duration-300">
                                        {section.title}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-gray-300 leading-relaxed text-lg font-light tracking-wide">
                                    {section.content}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col items-center justify-center pt-8 pb-12 gap-6">
                <BiometricCommitment
                    onCommit={handleCommit}
                />
            </div>
        </div>
    );
}

