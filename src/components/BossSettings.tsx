"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Crown } from "lucide-react";
import { useBoss } from "@/hooks/useBoss";
import { ROOMIES } from "@/lib/bossLogic";

export default function BossSettings() {
    const { config, updateConfig } = useBoss();
    const [open, setOpen] = useState(false);

    const handleModeChange = (value: 'fixed' | 'rotation') => {
        updateConfig({
            ...config,
            mode: value
        });
    };

    const handleBossChange = (value: string) => {
        updateConfig({
            ...config,
            fixedBossId: value
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-white/20 hover:text-white hover:bg-white/10"
                    title="Configurar Boss"
                >
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Crown className="w-6 h-6 text-yellow-500" />
                        Configuración del Boss
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Define quién lleva las finanzas del departamento.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <Label className="text-base">Modo de Selección</Label>
                        <RadioGroup
                            value={config.mode}
                            onValueChange={(val: string) => handleModeChange(val as 'fixed' | 'rotation')}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="rotation" id="rotation" className="peer sr-only" />
                                <Label
                                    htmlFor="rotation"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <span className="mb-2 text-2xl">🔄</span>
                                    <span className="font-semibold">Rotación</span>
                                    <span className="text-xs text-gray-400 text-center mt-1">Cambia cada mes automáticamente</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="fixed" id="fixed" className="peer sr-only" />
                                <Label
                                    htmlFor="fixed"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <span className="mb-2 text-2xl">👑</span>
                                    <span className="font-semibold">Fijo</span>
                                    <span className="text-xs text-gray-400 text-center mt-1">Un roomie permanente</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {config.mode === 'fixed' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Seleccionar Boss Permanente</Label>
                            <Select value={config.fixedBossId} onValueChange={handleBossChange}>
                                <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                                    <SelectValue placeholder="Selecciona un roomie" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    {ROOMIES.map((roomie) => (
                                        <SelectItem key={roomie.id} value={roomie.id}>
                                            {roomie.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
