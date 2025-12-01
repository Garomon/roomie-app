"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, PlusSquare } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
        }

        // Check for iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleManualInstall = () => {
        setShowIOSInstructions(true);
    };

    const onClick = (evt: any) => {
        evt.preventDefault();

        if (!promptInstall) {
            handleManualInstall();
            return;
        }

        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === "accepted") {
                toast.success("Instalando aplicación...");
            }
            setPromptInstall(null);
        });
    };

    // Don't show if already installed
    if (isStandalone) return null;

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-cyan-400"
                onClick={onClick}
                aria-label="Instalar Aplicación"
            >
                <Download className="w-4 h-4" />
                <span className="hidden xl:inline">Instalar App</span>
            </Button>

            <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Instalar Aplicación</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {isIOS ? "iOS no permite instalación automática. Sigue estos pasos:" : "Si no aparece la instalación automática, sigue estos pasos:"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        {isIOS ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Share className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <p>1. Toca el botón <strong>Compartir</strong> en la barra inferior.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <PlusSquare className="w-6 h-6 text-white" />
                                    </div>
                                    <p>2. Busca y selecciona <strong>"Agregar a Inicio"</strong>.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <span className="font-bold text-lg px-2">Add</span>
                                    </div>
                                    <p>3. Toca <strong>Agregar</strong> arriba a la derecha.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <span className="text-xl">⋮</span>
                                    </div>
                                    <p>1. Abre el menú del navegador (tres puntos).</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <p>2. Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.</p>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
