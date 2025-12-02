"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, RotateCcw, Crown } from "lucide-react";
import { useBoss } from "@/hooks/useBoss";

export default function SettingsModal() {
    const { config, updateConfig, roomies, loading } = useBoss();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'fixed' | 'rotation'>(config.mode);
    const [fixedBossId, setFixedBossId] = useState<string>(config.fixedBossId);

    // Sync local state with config when modal opens or config changes
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            setMode(config.mode);
            setFixedBossId(config.fixedBossId);
        }
    };

    const handleSave = async () => {
        await updateConfig({
            mode,
            fixedBossId
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Settings className="w-5 h-5 text-cyan-400" />
                        Configuración del Depa
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-300 border-b border-white/10 pb-2">Modo del Boss</h4>
                        <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'fixed' | 'rotation')} className="grid gap-4">
                            <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                                <RadioGroupItem value="rotation" id="rotation" className="mt-1 border-gray-400 text-cyan-400" />
                                <div className="grid gap-1.5">
                                    <Label htmlFor="rotation" className="font-medium text-white cursor-pointer flex items-center gap-2">
                                        <RotateCcw className="w-4 h-4 text-purple-400" />
                                        Rotación Automática
                                    </Label>
                                    <p className="text-sm text-gray-400">
                                        El Boss cambia cada mes según el calendario oficial. (Estándar)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                                <RadioGroupItem value="fixed" id="fixed" className="mt-1 border-gray-400 text-cyan-400" />
                                <div className="grid gap-1.5">
                                    <Label htmlFor="fixed" className="font-medium text-white cursor-pointer flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-yellow-400" />
                                        Boss Fijo
                                    </Label>
                                    <p className="text-sm text-gray-400">
                                        Una persona se encarga de todo hasta nuevo aviso.
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {mode === 'fixed' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-gray-300">¿Quién es el Boss Supremo?</Label>
                            <Select value={fixedBossId} onValueChange={setFixedBossId}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue placeholder="Selecciona un roomie" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                                    {roomies.map((roomie) => (
                                        <SelectItem key={roomie.id} value={roomie.id} className="focus:bg-white/10 focus:text-white">
                                            {roomie.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/10">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
