"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BellRing, BellOff, Smartphone, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { VAPID_PUBLIC_KEY } from "../lib/pushConfig";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushManager() {
    const { roomie } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        // 1. Detect Environment
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        setIsStandalone(standalone);

        // 2. Check Permission & Subscription
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setPermission(Notification.permission);

            navigator.serviceWorker.ready.then(function (registration) {
                registration.pushManager.getSubscription().then(function (subscription) {
                    setIsSubscribed(!(subscription === null));
                });
            });
        }
    }, []);

    const subscribeUser = async () => {
        if (!roomie) return;
        setLoading(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const sub = JSON.parse(JSON.stringify(subscription));

            const { error } = await supabase.from('push_subscriptions').insert({
                roomie_id: roomie.id,
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth
            });

            if (error) throw error;

            setIsSubscribed(true);
            setPermission('granted');
            toast.success("✅ Notificaciones activadas en este dispositivo");
        } catch (error: any) {
            console.error('Failed to subscribe the user: ', error);
            toast.error(`Error: ${error.message || 'No se pudo activar'}`);
            setPermission(Notification.permission);
        } finally {
            setLoading(false);
        }
    };

    const resetSubscription = async () => {
        if (confirm("¿Reiniciar configuración de notificaciones en este dispositivo?")) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                }
                setIsSubscribed(false);
                toast.success("Reiniciado. Intenta activar de nuevo.");
                window.location.reload();
            } catch (error) {
                console.error("Error resetting:", error);
                toast.error("Error al reiniciar");
            }
        }
    };

    if (!roomie) return null;

    // SCENARIO 1: iOS + Browser (Not Standalone) -> BLOCKER
    if (isIOS && !isStandalone) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">
                        <AlertCircle className="w-4 h-4" />
                        <span className="hidden xl:inline">Alertas iOS</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>⚠️ iOS Requiere Instalación</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            En iPhone, las notificaciones <strong>NO funcionan en Safari</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="bg-blue-500/20 p-3 rounded-full">
                                <Download className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="font-bold text-white">Paso 1: Instala la App</p>
                                <p className="text-sm text-gray-400">Toca "Compartir" y luego "Agregar a Inicio".</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="bg-purple-500/20 p-3 rounded-full">
                                <BellRing className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="font-bold text-white">Paso 2: Abre desde Inicio</p>
                                <p className="text-sm text-gray-400">Abre la app instalada y activa las alertas ahí.</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // SCENARIO 2: Already Subscribed -> SUCCESS
    if (isSubscribed) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-emerald-400 gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20" disabled>
                    <BellRing className="w-4 h-4" />
                    <span className="hidden xl:inline">Activas</span>
                </Button>
                <button
                    onClick={resetSubscription}
                    className="text-[10px] text-gray-600 hover:text-red-400 underline decoration-dotted"
                    title="Reiniciar configuración si fallan"
                >
                    Fix
                </button>
            </div>
        );
    }

    // SCENARIO 3: Permission Denied -> ERROR
    if (permission === 'denied') {
        return (
            <Button
                variant="destructive"
                size="sm"
                className="gap-2 opacity-80"
                onClick={() => alert("Has bloqueado las notificaciones. Debes activarlas manualmente en la configuración de tu navegador (candado en la barra de URL).")}
            >
                <BellOff className="w-4 h-4" />
                <span className="hidden xl:inline">Bloqueado</span>
            </Button>
        );
    }

    // SCENARIO 4: Default (Can Subscribe) -> ACTION
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/50 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                onClick={subscribeUser}
                disabled={loading}
            >
                {loading ? (
                    <span className="animate-pulse">Activando...</span>
                ) : (
                    <>
                        <BellRing className="w-4 h-4 animate-bounce" />
                        <span className="hidden xl:inline font-semibold">Activar Alertas</span>
                    </>
                )}
            </Button>
        </div>
    );
}
