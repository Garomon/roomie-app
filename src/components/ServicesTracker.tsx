"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ROOMIES } from "@/lib/bossLogic";
import { toast } from "sonner";

interface ServicesState {
    electricity: string;
    gas: string;
    water: string;
    internet: string;
}

interface ServicesTrackerProps {
    services: ServicesState;
    setServices: (services: ServicesState) => void;
}

export default function ServicesTracker({ services, setServices }: ServicesTrackerProps) {
    const total = Object.values(services).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    const perPerson = total / ROOMIES.length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Servicios Fijos (División 1/3)</CardTitle>
                    <CardDescription>
                        Luz, Gas, Agua e Internet. Se dividen equitativamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="electricity">Luz (CFE)</Label>
                                <Input
                                    id="electricity"
                                    placeholder="$0.00"
                                    type="number"
                                    value={services.electricity}
                                    onChange={(e) => setServices({ ...services, electricity: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gas">Gas</Label>
                                <Input
                                    id="gas"
                                    placeholder="$0.00"
                                    type="number"
                                    value={services.gas}
                                    onChange={(e) => setServices({ ...services, gas: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="water">Agua</Label>
                                <Input
                                    id="water"
                                    placeholder="$0.00"
                                    type="number"
                                    value={services.water}
                                    onChange={(e) => setServices({ ...services, water: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="internet">Internet</Label>
                                <Input
                                    id="internet"
                                    placeholder="$0.00"
                                    type="number"
                                    value={services.internet}
                                    onChange={(e) => setServices({ ...services, internet: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 flex flex-col justify-center space-y-6">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <span className="text-gray-400">Total Servicios</span>
                                <span className="text-2xl font-bold text-white">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-4">A pagar por persona:</h4>
                                {ROOMIES.map(roomie => (
                                    <div key={roomie.id} className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${roomie.color}`} />
                                            <span className="text-white">{roomie.name}</span>
                                        </div>
                                        <span className="font-mono text-cyan-400">${perPerson.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
                                onClick={() => {
                                    const text = `*Servicios del Mes*\n\nLuz: $${services.electricity || 0}\nGas: $${services.gas || 0}\nAgua: $${services.water || 0}\nInternet: $${services.internet || 0}\n\n*Total: $${total.toLocaleString()}*\n*A pagar c/u: $${perPerson.toLocaleString(undefined, { minimumFractionDigits: 2 })}*\n\nFavor de depositar al Boss. 💸`;
                                    navigator.clipboard.writeText(text);
                                    toast.success("Copiado al portapapeles para WhatsApp");
                                }}
                            >
                                Copiar para WhatsApp 📱
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
